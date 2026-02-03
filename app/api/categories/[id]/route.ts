import { createServerClient } from "@/lib/supabase/server"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("categories")
      .update({ name: body.name, slug: body.slug })
      .eq("id", params.id)
      .select()

    if (error) throw error
    return Response.json(data?.[0])
  } catch (error) {
    return Response.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()
    const { error } = await supabase.from("categories").delete().eq("id", params.id)
    if (error) throw error
    return new Response(null, { status: 204 })
  } catch (error) {
    return Response.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
