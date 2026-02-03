"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/admin-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"

export default function NewCategoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", slug: "" })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error("Failed")
      router.push("/admin/categories")
    } catch (e) {
      alert("Failed to create category")
    } finally {
      setLoading(false)
    }
  }

  const toSlug = (s: string) => s.replace(/\s+/g, "").replace(/&/g, "&").replace(/[^A-Za-z0-9&]/g, "")

  return (
    <div className="flex flex-col">
      <AdminHeader title="Add Category" description="Create a new category" />

      <div className="flex-1 p-6">
        <div className="mb-6">
          <Link href="/admin/categories">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Button>
          </Link>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Category Info</CardTitle>
                <CardDescription>Basic details for the category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={form.name} onChange={(e)=>{ const name=e.target.value; setForm({ name, slug: toSlug(name) }) }} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" value={form.slug} onChange={(e)=>setForm((p)=>({ ...p, slug: e.target.value }))} required />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90">
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Creating..." : "Create Category"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  )
}
