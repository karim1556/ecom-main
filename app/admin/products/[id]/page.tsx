"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/admin-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Trash2, BookOpen, X, Upload } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface Product {
  id: string
  title: string
  description: string
  specification?: string | null
  warranty?: string | null
  other_info?: string | null
  price: number
  discount_percent?: number | null
  category: string
  thumbnail_url: string
  sku?: string | null
  stock_quantity?: number
  low_stock_threshold?: number
  track_stock?: boolean
}

interface Course {
  id: string
  title: string
  level: string
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Product>({
    id: "",
    title: "",
    description: "",
    specification: "",
    warranty: "",
    other_info: "",
    price: 0,
    discount_percent: null,
    category: "",
    thumbnail_url: "",
    sku: "",
    stock_quantity: 0,
    low_stock_threshold: 5,
    track_stock: true,
  })
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [skuError, setSkuError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()

        // Fetch product
        const response = await fetch(`/api/products/${id}`)
        if (response.ok) {
          const data = await response.json()
          setFormData({
            ...data,
            specification: data.specification ?? "",
            warranty: data.warranty ?? "",
            other_info: data.other_info ?? "",
            discount_percent: data.discount_percent ?? null,
          })
          setImagePreview(data.thumbnail_url)
        }

        // Run Supabase queries in parallel
        const [
          coursesResult,
          categoryResult,
          productCoursesResult,
        ] = await Promise.all([
          supabase.from("courses").select("id, title, level").order("title"),
          supabase.from("categories").select("name, slug").order("name"),
          supabase.from("product_courses").select("course_id").eq("product_id", id),
        ])

        if (coursesResult.error) {
          console.error("Courses error:", coursesResult.error)
          throw coursesResult.error
        }
        if (categoryResult.error) {
          console.error("Categories error:", categoryResult.error)
          throw categoryResult.error
        }
        if (productCoursesResult.error) {
          console.error("Product courses error:", productCoursesResult.error)
          throw productCoursesResult.error
        }

        setCourses(coursesResult.data || [])
        setCategories(categoryResult.data || [])
        setSelectedCourses(productCoursesResult.data?.map((pc: { course_id: string }) => pc.course_id) || [])
      } catch (error) {
        console.error("Failed to fetch data:", error)
        // Set default values on error so page doesn't stay loading
        setCourses([])
        setCategories([])
        setSelectedCourses([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear SKU error when SKU is changed
    if (name === 'sku') {
      setSkuError(null)
    }
  }

  const validateSku = async (sku: string) => {
    if (!sku.trim()) {
      setSkuError(null)
      return
    }

    try {
      const response = await fetch('/api/products/check-sku', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, excludeId: id })
      })
      
      const data = await response.json()
      
      if (data.exists) {
        setSkuError('This SKU already exists. Please use a different SKU.')
      } else {
        setSkuError(null)
      }
    } catch (error) {
      console.error('SKU validation error:', error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const preview = URL.createObjectURL(file)
      setImagePreview(preview)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null

    setUploading(true)
    try {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `product-images/${fileName}`

      const supabase = createClient()
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile)

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Storage bucket "product-images" not found. Please create it in Supabase Dashboard.')
        }
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate SKU before submission
    if (skuError) {
      alert('Please fix the SKU error before submitting.')
      return
    }
    
    setSaving(true)

    try {
      // Upload image if a new one was selected
      let imageUrl = formData.thumbnail_url
      if (imageFile) {
        const uploadedUrl = await uploadImage()
        if (!uploadedUrl) {
          throw new Error("Failed to upload image")
        }
        imageUrl = uploadedUrl
      }

      // Update product
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          thumbnail_url: imageUrl,
          price: Number.parseFloat(String(formData.price)),
          stock_quantity: formData.stock_quantity || 0,
          low_stock_threshold: formData.low_stock_threshold || 5,
          track_stock: formData.track_stock || false,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update product")
      }

      const supabase = createClient()
      // Update course associations
      // First, remove existing associations
      const { error: deleteError } = await supabase
        .from("product_courses")
        .delete()
        .eq("product_id", id)

      if (deleteError) throw deleteError

      // Then add new associations
      if (selectedCourses.length > 0) {
        const productCourses = selectedCourses.map((courseId: string) => ({
          product_id: id,
          course_id: courseId
        }))

        const { error: insertError } = await supabase
          .from("product_courses")
          .insert(productCourses)

        if (insertError) throw insertError
      }

      router.push("/admin/products")
    } catch (error) {
      console.error("Error:", error)
      alert(`An error occurred while saving: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (response.ok) {
        router.push("/admin/products")
      } else {
        alert("Failed to delete product")
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col">
        <AdminHeader title="Edit Product" description="Loading..." />
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <AdminHeader title="Edit Product" description={`Editing: ${formData.title}`} />

      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/admin/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Product
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>Update product details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Product Title</Label>
                    <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku || ""}
                      onChange={handleChange}
                      onBlur={(e) => validateSku(e.target.value)}
                      placeholder="e.g. DRN-X1-001"
                      className="uppercase"
                    />
                    {skuError && (
                      <p className="text-sm text-red-600">{skuError}</p>
                    )}
                  </div>
                </div>

                {/* Stock Tracking Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Stock Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock_quantity">Stock Quantity</Label>
                      <Input
                        id="stock_quantity"
                        name="stock_quantity"
                        type="number"
                        min="0"
                        value={formData.stock_quantity || 0}
                        onChange={handleChange}
                        placeholder="100"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="low_stock_threshold">Low Stock Alert</Label>
                      <Input
                        id="low_stock_threshold"
                        name="low_stock_threshold"
                        type="number"
                        min="0"
                        value={formData.low_stock_threshold || 5}
                        onChange={handleChange}
                        placeholder="5"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox
                      id="track_stock"
                      checked={formData.track_stock || false}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, track_stock: checked as boolean }))
                      }
                    />
                    <Label htmlFor="track_stock">Track inventory for this product</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specification">Specifications</Label>
                  <Textarea
                    id="specification"
                    name="specification"
                    value={formData.specification || ""}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warranty">Warranty</Label>
                  <Textarea
                    id="warranty"
                    name="warranty"
                    value={formData.warranty || ""}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="other_info">Other Info</Label>
                  <Textarea
                    id="other_info"
                    name="other_info"
                    value={formData.other_info || ""}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Product Image</Label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="flex-1"
                      />
                      {imageFile && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview(formData.thumbnail_url)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {imagePreview && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Image Preview:</p>
                        <div className="relative w-48 h-48 border rounded-lg overflow-hidden">
                          <img
                            src={imagePreview}
                            alt="Product preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    
                    {!imageFile && !imagePreview && (
                      <div className="text-sm text-muted-foreground">
                        <p>Upload an image for the product. Supported formats: JPG, PNG, GIF, WebP</p>
                      </div>
                    )}
                    
                    {imageFile && (
                      <div className="text-sm text-blue-600">
                        <p>New image selected. Click "Save Changes" to upload.</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discount_percent">Discount (%)</Label>
                      <Input
                        id="discount_percent"
                        name="discount_percent"
                        type="number"
                        value={formData.discount_percent ?? ""}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="e.g. 20 for 20% off (optional)"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={formData.category} onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Associated Courses
                  </CardTitle>
                  <CardDescription>
                    Select courses that come with this product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {courses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No courses available. Create courses first.
                    </p>
                  ) : (
                    courses.map((course) => (
                      <div key={course.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={course.id}
                          checked={selectedCourses.includes(course.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCourses(prev => [...prev, course.id])
                            } else {
                              setSelectedCourses(prev => prev.filter(id => id !== course.id))
                            }
                          }}
                        />
                        <Label htmlFor={course.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{course.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {course.level}
                            </Badge>
                          </div>
                        </Label>
                      </div>
                    ))
                  )}
                  
                  {selectedCourses.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Selected courses:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedCourses.map(courseId => {
                          const course = courses.find(c => c.id === courseId)
                          return course ? (
                            <Badge key={courseId} variant="secondary" className="text-xs">
                              {course.title}
                              <button
                                type="button"
                                onClick={() => setSelectedCourses(prev => prev.filter(id => id !== courseId))}
                                className="ml-1 hover:bg-muted rounded-full p-0.5"
                              >
                                <X className="h-2 w-2" />
                              </button>
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Button type="submit" disabled={saving || uploading} className="w-full bg-accent hover:bg-accent/90">
                    <Save className="mr-2 h-4 w-4" />
                    {uploading ? "Uploading Image..." : saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
