"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/admin-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Trash2 } from "lucide-react"

interface Category { id: string; name: string; slug: string }

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams() as { id: string }
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Category>({ id: "", name: "", slug: "" })

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch("/api/categories")
        const data: Category[] = await res.json()
        const cat = data.find((c)=>c.id === params.id)
        if (cat) setForm(cat)
      } finally { setLoading(false) }
    }
    fetchCategory()
  }, [params.id])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/categories/₹{params.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, slug: form.slug }) })
      if (!res.ok) throw new Error("Failed")
      router.push("/admin/categories")
    } catch (e) {
      alert("Failed to save category")
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async () => {
    if (!confirm("Delete this category?")) return
    const res = await fetch(`/api/categories/₹{params.id}`, { method: "DELETE" })
    if (res.ok) router.push("/admin/categories")
  }

  if (loading) {
    return (
      <div className="flex flex-col">
        <AdminHeader title="Edit Category" description="Loading..." />
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <AdminHeader title="Edit Category" description={`Editing: ₹{form.name}`} />

      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/admin/categories">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Category
          </Button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Category Information</CardTitle>
                <CardDescription>Update category details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={form.name} onChange={(e)=>setForm((p)=>({ ...p, name: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" value={form.slug} onChange={(e)=>setForm((p)=>({ ...p, slug: e.target.value }))} required />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button type="submit" disabled={saving} className="w-full bg-accent hover:bg-accent/90">
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  )
}
