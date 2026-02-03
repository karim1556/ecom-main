"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Coupon {
  id: string
  code: string
  description: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  min_order_amount: number | null
  max_discount_amount: number | null
  usage_limit: number | null
  used_count: number
  is_active: boolean
  expires_at: string
}

export default function EditCouponPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [form, setForm] = useState({
    code: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 10,
    min_order_amount: "",
    max_discount_amount: "",
    usage_limit: "",
    is_active: true,
    expires_at: "",
  })

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const res = await fetch(`/api/coupons/${params.id}`)
        if (!res.ok) {
          router.push("/admin/coupons")
          return
        }
        const coupon: Coupon = await res.json()
        setForm({
          code: coupon.code,
          description: coupon.description || "",
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          min_order_amount: coupon.min_order_amount?.toString() || "",
          max_discount_amount: coupon.max_discount_amount?.toString() || "",
          usage_limit: coupon.usage_limit?.toString() || "",
          is_active: coupon.is_active,
          expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 16) : "",
        })
      } catch (error) {
        console.error("Failed to load coupon", error)
      } finally {
        setInitialLoading(false)
      }
    }

    if (params.id) {
      fetchCoupon()
    }
  }, [params.id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const body = {
        code: form.code.toUpperCase().trim(),
        description: form.description,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : null,
        max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        is_active: form.is_active,
        expires_at: new Date(form.expires_at).toISOString(),
      }

      const res = await fetch(`/api/coupons/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        alert("Failed to update coupon")
        return
      }

      router.push("/admin/coupons")
    } catch (error) {
      console.error("Update coupon error", error)
      alert("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex flex-col">
        <AdminHeader title="Edit Coupon" description="Loading coupon details..." />
        <div className="flex-1 p-6">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <AdminHeader title="Edit Coupon" description={`Edit coupon ${form.code}`} />
      <div className="flex-1 p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Coupon Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Code</label>
                  <Input
                    name="code"
                    placeholder="SAVE10"
                    value={form.code}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Type</label>
                  <select
                    name="discount_type"
                    value={form.discount_type}
                    onChange={handleChange}
                    className="w-full rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Value</label>
                  <Input
                    name="discount_value"
                    type="number"
                    min={1}
                    value={form.discount_value}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Minimum Order Amount (optional)</label>
                  <Input
                    name="min_order_amount"
                    type="number"
                    min={0}
                    value={form.min_order_amount}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Maximum Discount Amount (optional)</label>
                  <Input
                    name="max_discount_amount"
                    type="number"
                    min={0}
                    value={form.max_discount_amount}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Usage Limit (optional)</label>
                  <Input
                    name="usage_limit"
                    type="number"
                    min={1}
                    value={form.usage_limit}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expires At</label>
                  <Input
                    name="expires_at"
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    id="is_active"
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />
                  <label htmlFor="is_active" className="text-sm">Active</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/coupons")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
