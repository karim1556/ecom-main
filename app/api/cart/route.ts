import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ items: [] })
    }

    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select(
        `
      id,
      product_id,
      quantity,
      product:products(id, title, price, thumbnail_url)
    `,
      )
      .eq("user_id", user.id)

    if (error) throw error

    return Response.json({ items: cartItems || [] })
  } catch (error) {
    console.error("[v0] Cart API error:", error)
    return Response.json({ items: [] }, { status: 500 })
  }
}
