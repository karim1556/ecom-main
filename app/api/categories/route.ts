import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, created_at")
      .order("name")

    if (error) throw error
    return Response.json(data || [])
  } catch (error) {
    return Response.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("categories")
      .insert([{ name: body.name, slug: body.slug }])
      .select()

    if (error) throw error
    return Response.json(data?.[0])
  } catch (error) {
    return Response.json({ error: "Failed to create category" }, { status: 500 })
  }
}
