import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      items, 
      totalAmount, 
      subtotal, 
      shipping, 
      tax, 
      discount, 
      total, 
      couponId, 
      couponCode,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      userId
    } = body
    const supabase = await createServerClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "User not authenticated" }, { status: 401 })
    }

    // Update user profile with address information
    console.log("Checkout address data:", { firstName, lastName, phone, address, city, state, zipCode })
    
    if (firstName || lastName || phone || address || city || state || zipCode) {
      const profileData = {
        id: user.id,
        full_name: `${firstName} ${lastName}`.trim(),
        email: email || user.email,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        postal_code: zipCode || null,
        country: null, // Can be added to form if needed
        updated_at: new Date().toISOString(),
      }
      
      console.log("Updating profile with data:", profileData)
      
      const { data: profileResult, error: profileError } = await supabase
        .from("profiles")
        .upsert(profileData)
        .select()

      console.log("Profile update result:", { profileResult, profileError })

      if (profileError) {
        console.error("Failed to update user profile:", profileError)
        // Continue processing even if profile update fails
      }
    } else {
      console.log("No address data provided, skipping profile update")
    }

    // Create orders for each cart item (temporary - until migration is applied)
    const orders = []
    
    // Calculate the final total amount (including taxes and shipping)
    const finalTotalAmount = total // This should be the complete total from checkout
    
    // Distribute the final total across items proportionally
    const itemSubtotals = items.map((item: any) => {
      const itemPrice = item.product.discount_percent 
        ? item.product.price * (1 - item.product.discount_percent / 100)
        : item.product.price
      return itemPrice * item.quantity
    })
    
    const totalSubtotal = itemSubtotals.reduce((sum: number, subtotal: number) => sum + subtotal, 0)
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const itemSubtotal = itemSubtotals[i]
      
      // Calculate proportion of taxes and shipping for this item
      const proportion = itemSubtotal / totalSubtotal
      const itemTax = tax * proportion
      const itemShipping = shipping * proportion
      const itemFinalAmount = itemSubtotal + itemTax + itemShipping
      
      const { data: order, error } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user.id,
            product_id: item.product_id,
            quantity: item.quantity,
            amount: itemFinalAmount, // Store complete amount including taxes and shipping
            status: "processing",
            payment_id: `pay_${Date.now()}_${Math.random()}`,
          },
        ])
        .select()
        .single()

      if (error) throw error
      orders.push(order)
    }

    // Check if products have associated courses and grant access
    for (const item of items) {
      const { data: productCourses } = await supabase
        .from("product_courses")
        .select("course_id")
        .eq("product_id", item.product_id)

      if (productCourses && productCourses.length > 0) {
        // Grant access to each associated course
        for (const productCourse of productCourses) {
          const { error: grantError } = await supabase
            .from("user_courses")
            .insert([
              {
                user_id: user.id,
                course_id: productCourse.course_id,
                granted_at: new Date().toISOString(),
              },
            ])

          if (grantError) {
            console.error("Failed to grant course access:", grantError)
            // Continue processing even if course access fails
          }
        }
      }
    }

    // Clear cart after successful checkout
    const { error: clearError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)

    if (clearError) {
      console.error("Failed to clear cart:", clearError)
    }

    return Response.json({
      success: true,
      orders: orders.map(o => o.id),
      message: "Order completed successfully",
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return Response.json({ error: "Checkout failed" }, { status: 500 })
  }
}
