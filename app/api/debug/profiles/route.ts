import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()
    
    // Try to select a profile to see what columns exist
    const { data: sampleProfile, error: sampleError } = await supabase
      .from("profiles")
      .select("*")
      .limit(1)
      .single()
    
    if (sampleError) {
      return Response.json({ 
        error: "Could not access profiles table", 
        details: sampleError 
      }, { status: 500 })
    }
    
    return Response.json({ 
      message: "Profiles table columns and sample data:",
      columns: Object.keys(sampleProfile || {}),
      sampleData: sampleProfile,
      allColumns: Object.keys(sampleProfile || {}).map(key => ({
        column: key,
        value: sampleProfile?.[key],
        type: typeof sampleProfile?.[key]
      }))
    })
    
  } catch (error) {
    return Response.json({ 
      error: "Debug endpoint failed", 
      details: error 
    }, { status: 500 })
  }
}
