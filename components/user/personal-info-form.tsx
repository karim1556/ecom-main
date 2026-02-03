"use client"

import { useState, FormEvent } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function PersonalInfoForm({ defaultName, email }: { defaultName: string; email: string }) {
  const [fullName, setFullName] = useState<string>(defaultName || "")
  const [saving, setSaving] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const supabase = createClient()
      if (!supabase) throw new Error("Supabase not available")

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id)
      if (error) throw error
      alert("Profile updated")
    } catch (err: any) {
      console.error("[v0] Personal info update error:", err)
      alert(err?.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
          disabled={saving}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" value={email} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
      </div>
      <Button className="w-full bg-primary hover:bg-primary/90" type="submit" disabled={saving || !fullName.trim()}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
