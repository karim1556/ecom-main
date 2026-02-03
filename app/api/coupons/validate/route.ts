import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { code, cartTotal, cartItems } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 })
    }

    // Find the coupon
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .single()

    if (error || !coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 })
    }

    // Check if coupon is active
    if (!coupon.is_active) {
      return NextResponse.json({ error: "Coupon is not active" }, { status: 400 })
    }

    // Check if coupon has expired
    const now = new Date()
    const expiresAt = new Date(coupon.expires_at)
    if (expiresAt < now) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 })
    }

    // Check if coupon applies to cart items
    let applicableItems = []
    if (coupon.applicable_products && coupon.applicable_products.length > 0) {
      // Coupon applies to specific products
      applicableItems = cartItems.filter((item: any) => 
        coupon.applicable_products.includes(item.id)
      )
      if (applicableItems.length === 0) {
        return NextResponse.json({ error: "Coupon does not apply to any items in your cart" }, { status: 400 })
      }
    } else if (coupon.applicable_categories && coupon.applicable_categories.length > 0) {
      // Coupon applies to specific categories
      applicableItems = cartItems.filter((item: any) => 
        coupon.applicable_categories.includes(item.category)
      )
      if (applicableItems.length === 0) {
        return NextResponse.json({ error: "Coupon does not apply to any items in your cart" }, { status: 400 })
      }
    } else {
      // Coupon applies to all products
      applicableItems = cartItems
    }

    // Calculate discount based on applicable items only
    const applicableTotal = applicableItems.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    )

    // Check minimum order requirement based on applicable items
    if (coupon.min_order_amount && applicableTotal < coupon.min_order_amount) {
      return NextResponse.json({ 
        error: `Minimum order amount of ₹${coupon.min_order_amount} required for applicable items` 
      }, { status: 400 })
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 })
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.discount_type === "percentage") {
      discountAmount = (applicableTotal * coupon.discount_value) / 100
      // Apply maximum discount limit if set
      if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
        discountAmount = coupon.max_discount_amount
      }
    } else if (coupon.discount_type === "fixed") {
      discountAmount = coupon.discount_value
    }

    // Ensure discount doesn't exceed applicable total
    discountAmount = Math.min(discountAmount, applicableTotal)

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discountAmount,
        description: coupon.description,
        applicableItems: applicableItems.map((item: any) => item.id)
      }
    })

  } catch (error) {
    console.error("Failed to validate coupon:", error)
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 })
  }
}
