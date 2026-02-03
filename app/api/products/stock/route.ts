import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, quantity, operation } = body // operation: 'add' | 'subtract' | 'set'
    
    if (!productId || quantity === undefined || !operation) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Get current product
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("stock_quantity, low_stock_threshold, track_stock")
      .eq("id", productId)
      .single()

    if (fetchError) throw fetchError
    if (!product) return Response.json({ error: "Product not found" }, { status: 404 })
    
    if (!product.track_stock) {
      return Response.json({ error: "Stock tracking is not enabled for this product" }, { status: 400 })
    }

    let newQuantity = product.stock_quantity || 0

    switch (operation) {
      case 'add':
        newQuantity += quantity
        break
      case 'subtract':
        newQuantity = Math.max(0, newQuantity - quantity)
        break
      case 'set':
        newQuantity = Math.max(0, quantity)
        break
      default:
        return Response.json({ error: "Invalid operation" }, { status: 400 })
    }

    // Update stock
    const { data, error } = await supabase
      .from("products")
      .update({ stock_quantity: newQuantity })
      .eq("id", productId)
      .select()

    if (error) throw error

    return Response.json({ 
      success: true, 
      newQuantity,
      isLowStock: newQuantity <= (product.low_stock_threshold || 5),
      product: data?.[0] || null
    })
  } catch (error) {
    console.error("Stock API Error:", error)
    return Response.json({ error: "Failed to update stock" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true'

    const supabase = await createServerClient()

    if (productId) {
      // Get stock for specific product
      const { data, error } = await supabase
        .from("products")
        .select("id, title, sku, stock_quantity, low_stock_threshold, track_stock")
        .eq("id", productId)
        .single()

      if (error) throw error
      if (!data) return Response.json({ error: "Product not found" }, { status: 404 })

      return Response.json({
        ...data,
        isLowStock: data.stock_quantity <= data.low_stock_threshold
      })
    } else {
      // Get all products with stock info
      let query = supabase
        .from("products")
        .select("id, title, sku, stock_quantity, low_stock_threshold, track_stock")
        .eq("track_stock", true)

      if (lowStockOnly) {
        query = query.lte("stock_quantity", "low_stock_threshold")
      }

      const { data, error } = await query.order("stock_quantity", { ascending: true })

      if (error) throw error

      const normalized = (data || []).map((item: any) => ({
        ...item,
        isLowStock: item.stock_quantity <= item.low_stock_threshold
      }))

      return Response.json(normalized)
    }
  } catch (error) {
    console.error("Stock API Error:", error)
    return Response.json({ error: "Failed to fetch stock info" }, { status: 500 })
  }
}
