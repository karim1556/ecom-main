import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json({ error: "Coupon id is required" }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      const code = (error as any).code as string | undefined
      if (code === "PGRST116") {
        return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
      }

      console.error("Supabase error fetching coupon:", error)
      return NextResponse.json(
        { error: "Failed to fetch coupon", details: (error as any).message ?? String(error) },
        { status: 500 },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch coupon:", error)
    return NextResponse.json({ error: "Failed to fetch coupon" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json({ error: "Coupon id is required" }, { status: 400 })
    }

    const supabase = await createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("coupons")
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to update coupon:", error)
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json({ error: "Coupon id is required" }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { error } = await supabase
      .from("coupons")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete coupon:", error)
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 })
  }
}
