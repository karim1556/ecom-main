import type React from "react"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { UserSidebar } from "@/components/user/user-sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  return (
    <div className="flex min-h-screen bg-muted/30 flex-col sm:flex-row">
      <UserSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
