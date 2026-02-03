import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return Response.json(data || [])
  } catch (error) {
    console.error("API Error:", error)
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createServerClient()

    const { data, error } = await supabase.from("orders").insert([body]).select()

    if (error) throw error

    return Response.json(data?.[0])
  } catch (error) {
    console.error("API Error:", error)
    return Response.json({ error: "Failed to create order" }, { status: 500 })
  }
}
