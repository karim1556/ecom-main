import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { videoPath } = await request.json()
    const supabase = await createServerClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    if (!videoPath) {
      return NextResponse.json({ error: "Video path is required" }, { status: 400 })
    }

    // For now, we'll create a simple signed URL
    // In production, you might want to add additional validation
    // to ensure the user has access to this specific video
    
    const { data, error } = await supabase.storage
      .from('course-videos')
      .createSignedUrl(videoPath, 3600) // 1 hour expiry

    if (error) {
      console.error("Error creating signed URL:", error)
      return NextResponse.json({ error: "Failed to generate video URL" }, { status: 500 })
    }

    return NextResponse.json({ signedUrl: data.signedUrl })
  } catch (error) {
    console.error("Video URL generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
