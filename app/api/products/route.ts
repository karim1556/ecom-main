import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("[v0] Supabase error:", error.message)
      // Return empty array if table doesn't exist yet
      return Response.json([])
    }

    const normalized = (data || []).map((item: any) => ({
      ...item,
      price: Number.parseFloat(String(item.price ?? 0)),
      discount_percent: item.discount_percent != null ? Number.parseFloat(String(item.discount_percent)) : null,
      stock_quantity: item.stock_quantity != null ? Number(item.stock_quantity) : 0,
      low_stock_threshold: item.low_stock_threshold != null ? Number(item.low_stock_threshold) : 5,
      track_stock: item.track_stock != null ? Boolean(item.track_stock) : true,
    }))

    return Response.json(normalized)
  } catch (error) {
    console.error("[v0] API Error:", error instanceof Error ? error.message : String(error))
    // Return empty array instead of error to prevent fetch failures
    return Response.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createServerClient()

    const { data, error } = await supabase.from("products").insert([body]).select()

    if (error) throw error

    return Response.json(data?.[0])
  } catch (error) {
    console.error("[v0] API Error:", error instanceof Error ? error.message : String(error))
    return Response.json({ error: "Failed to create product" }, { status: 500 })
  }
}
