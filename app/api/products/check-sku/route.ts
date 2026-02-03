import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { sku, excludeId } = await request.json()
    const supabase = await createServerClient()

    let query = supabase.from("products").select("id").eq("sku", sku)
    
    // If excluding an ID (for editing), exclude it from the check
    if (excludeId) {
      query = query.neq("id", excludeId)
    }

    const { data, error } = await query.limit(1)

    if (error) {
      console.error("SKU check error:", error)
      return Response.json({ error: "Failed to check SKU" }, { status: 500 })
    }

    // Return whether SKU exists
    return Response.json({ 
      exists: data && data.length > 0,
      sku: sku 
    })
  } catch (error) {
    console.error("API Error:", error)
    return Response.json({ error: "Failed to check SKU" }, { status: 500 })
  }
}
