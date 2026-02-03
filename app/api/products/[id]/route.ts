import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) throw error
    if (!data) return Response.json({ error: "Product not found" }, { status: 404 })

    // Normalize stock fields
    const normalized = {
      ...data,
      price: Number.parseFloat(String(data.price ?? 0)),
      discount_percent: data.discount_percent != null ? Number.parseFloat(String(data.discount_percent)) : null,
      stock_quantity: data.stock_quantity != null ? Number(data.stock_quantity) : 0,
      low_stock_threshold: data.low_stock_threshold != null ? Number(data.low_stock_threshold) : 5,
      track_stock: data.track_stock != null ? Boolean(data.track_stock) : true,
    }

    return Response.json(normalized)
  } catch (error) {
    console.error("API Error:", error)
    return Response.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error("API Error:", error)
    return Response.json({ error: "Failed to delete product" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("products")
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    if (!data) return Response.json({ error: "Product not found" }, { status: 404 })

    return Response.json(data)
  } catch (error) {
    console.error("API Error:", error)
    return Response.json({ error: "Failed to update product" }, { status: 500 })
  }
}
