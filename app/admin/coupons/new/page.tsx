"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"

export default function NewCouponPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
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
    applicable_products: [] as string[],
    applicable_categories: [] as string[],
    target_type: "all" as "all" | "products" | "categories",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          supabase.from("products").select("id, title, category").order("title"),
          supabase.from("products").select("category").order("category")
        ])

        if (productsRes.data) {
          setProducts(productsRes.data)
        }

        if (categoriesRes.data) {
          const uniqueCategories = [...new Set(categoriesRes.data.map((p: any) => p.category).filter(Boolean))] as string[]
          setCategories(uniqueCategories)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }

    fetchData()
  }, [supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleProductToggle = (productId: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      applicable_products: checked 
        ? [...prev.applicable_products, productId]
        : prev.applicable_products.filter(id => id !== productId)
    }))
  }

  const handleCategoryToggle = (category: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      applicable_categories: checked 
        ? [...prev.applicable_categories, category]
        : prev.applicable_categories.filter(cat => cat !== category)
    }))
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
        applicable_products: form.target_type === "products" ? form.applicable_products : null,
        applicable_categories: form.target_type === "categories" ? form.applicable_categories : null,
      }

      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        alert("Failed to create coupon")
        return
      }

      router.push("/admin/coupons")
    } catch (error) {
      console.error("Create coupon error", error)
      alert("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      <AdminHeader title="New Coupon" description="Create a new discount coupon" />
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

              {/* Targeting Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Applicable To</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Type</label>
                    <select
                      name="target_type"
                      value={form.target_type}
                      onChange={handleChange}
                      className="w-full rounded-md border border-border px-3 py-2 text-sm"
                    >
                      <option value="all">All Products</option>
                      <option value="products">Specific Products</option>
                      <option value="categories">Specific Categories</option>
                    </select>
                  </div>

                  {form.target_type === "products" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Products</label>
                      <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                        {products.map((product) => (
                          <div key={product.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`product-${product.id}`}
                              checked={form.applicable_products.includes(product.id)}
                              onCheckedChange={(checked) => handleProductToggle(product.id, checked as boolean)}
                            />
                            <label htmlFor={`product-${product.id}`} className="text-sm">
                              {product.title}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {form.target_type === "categories" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Categories</label>
                      <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                        {categories.map((category) => (
                          <div key={category} className="flex items-center gap-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={form.applicable_categories.includes(category)}
                              onCheckedChange={(checked) => handleCategoryToggle(category, checked as boolean)}
                            />
                            <label htmlFor={`category-${category}`} className="text-sm">
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                  {loading ? "Saving..." : "Create Coupon"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
