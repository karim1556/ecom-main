"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { useCurrency } from "@/lib/currency-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Package,
  Minus,
  Plus,
  Share2,
  Check,
  X,
  BookOpen,
} from "lucide-react"
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
  description: string | null
  level: string
  thumbnail_url: string | null
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [selectedImage, setSelectedImage] = useState(0)
  const [productId, setProductId] = useState<string>("")
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [associatedCourses, setAssociatedCourses] = useState<Course[]>([])
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

  const { addToCart } = useCart()
  const { currency, convertPrice } = useCurrency()
  const { items: wishlistItems, addToWishlist, removeFromWishlist } = useWishlist()

  const supabase = createClient()

  const isInWishlist = product ? wishlistItems.some((item) => item.product_id === product.id) : false

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setProductId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!productId) return
    
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`)
        const data = await response.json()

        if (!response.ok || !data || typeof data !== "object" || "error" in data) {
          setProduct(null)
          return
        }

        const parsedPrice = typeof (data as any).price === "number" ? (data as any).price : Number((data as any).price)
        const normalized: Product = {
          ...(data as any),
          price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
        }

        setProduct(normalized)
      } catch (error) {
        console.error("Failed to fetch product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId, supabase])

  useEffect(() => {
    if (!productId) return

    const fetchAssociatedCourses = async () => {
      try {
        const { data: productCourses, error } = await supabase
          .from("product_courses")
          .select(
            `
            course:courses (
              id,
              title,
              description,
              level,
              thumbnail_url
            )
          `,
          )
          .eq("product_id", productId)

        if (error) {
          console.error("Failed to fetch associated courses:", error)
          return
        }

        const courses = (productCourses || []).map((pc: any) => pc.course).filter(Boolean) as Course[]
        setAssociatedCourses(courses)
      } catch (error) {
        console.error("Failed to fetch associated courses:", error)
      }
    }

    fetchAssociatedCourses()
  }, [productId, supabase])

  // Fetch related products (same category, excluding current product)
  useEffect(() => {
    const fetchRelated = async () => {
      if (!product) return

      try {
        const res = await fetch("/api/products")
        const data = await res.json()

        if (!Array.isArray(data)) return

        const related = data
          .filter((p: any) => p.id !== product.id && p.category === product.category)
          .slice(0, 4)
          .map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            price: typeof p.price === "number" ? p.price : Number(p.price) || 0,
            category: p.category,
            thumbnail_url: p.thumbnail_url,
          })) as Product[]

        setRelatedProducts(related)
      } catch (error) {
        console.error("Failed to fetch related products:", error)
      }
    }

    fetchRelated()
  }, [product])

  const handleAddToCart = async () => {
    if (!product) return
    try {
      setAddingToCart(true)
      await addToCart(product.id, quantity)
      setSuccessMessage("Added to cart!")
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (error) {
      console.error("Failed to add to cart:", error)
    } finally {
      setAddingToCart(false)
    }
  }

  const toggleWishlist = async () => {
    if (!product) return
    
    try {
      setWishlistLoading(true)
      
      // Check authentication status
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error("Auth error:", authError)
      }
      
      if (!user) {
        alert("Please sign in to add items to your wishlist")
        return
      }
      
      if (isInWishlist) {
        await removeFromWishlist(product.id)
        console.log("Removed from wishlist")
      } else {
        await addToWishlist(product.id)
        console.log("Added to wishlist")
      }
    } catch (error) {
      console.error("Wishlist error:", error)
      // Show user-friendly error message
      if (error instanceof Error && error.message.includes("sign in")) {
        alert("Please sign in to add items to your wishlist")
      } else {
        alert("Failed to update wishlist. Please try again.")
      }
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleShare = async (platform: string) => {
    if (!product) return
    
    const url = window.location.href
    const title = product.title
    let shareUrl = ''

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Check out this product: ${title}`)}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`Check out this product: ${title} ${url}`)}`
        break
      case 'copy':
        await navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
        setShowShareMenu(false)
        return
      default:
        return
    }

    window.open(shareUrl, '_blank', 'width=600,height=400')
    setShowShareMenu(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Product not found</h2>
            <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/shop">Back to Shop</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Mock images for gallery
  const productImages = [
    product.thumbnail_url || "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
  ]

  const safePrice = Number.isFinite(product.price) ? product.price : 0
  const discountPercent = (product as any).discount_percent != null
    ? Number.parseFloat(String((product as any).discount_percent))
    : 0
  const hasDiscount = Number.isFinite(discountPercent) && discountPercent > 0
  const discountedPrice = hasDiscount ? safePrice * (1 - discountPercent / 100) : safePrice

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6 text-xs text-muted-foreground">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/shop?category=${product.category}`}>{product.category}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-muted/70 rounded-3xl overflow-hidden shadow-sm">
                <img
                  src={productImages[selectedImage] || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
                />
                <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground border-0 text-xs rounded-full px-3 py-1 shadow-sm">
                  New arrival
                </Badge>
              </div>

              {/* Thumbnail Gallery */}
              {/* <div className="grid grid-cols-4 gap-3">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ₹{
                      selectedImage === idx ? "border-primary" : "border-transparent hover:border-border"
                    }`}
                  >
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`View ₹{idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div> */}
            </div>

            {/* Product Details */}
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-3">
                <p className="text-xs font-medium text-primary/80 uppercase tracking-[0.16em]">{product.category}</p>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
                  {product.title}
                </h1>
                
                {/* SKU */}
                {product.sku && (
                  <p className="text-sm text-muted-foreground mb-3">
                    SKU: <span className="font-mono uppercase bg-muted px-2 py-1 rounded">{product.sku}</span>
                  </p>
                )}

                {/* Rating */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <span>4.8 • 128 reviews</span>
                  <Separator orientation="vertical" className="h-4" />
                  {product.track_stock ? (
                    <span className={`flex items-center gap-1 ${
                      product.stock_quantity && product.stock_quantity > (product.low_stock_threshold || 5) 
                        ? 'text-emerald-600' 
                        : 'text-orange-600'
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${
                        product.stock_quantity && product.stock_quantity > (product.low_stock_threshold || 5)
                          ? 'bg-emerald-500'
                          : 'bg-orange-500'
                      }`} />
                      {product.stock_quantity && product.stock_quantity > (product.low_stock_threshold || 5)
                        ? `In stock (${product.stock_quantity} units)`
                        : `Low stock (${product.stock_quantity} units)`
                      }
                    </span>
                  ) : (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      In stock
                    </span>
                  )}
                </div>
              </div>

              {/* SKU Display */}
              {product.sku && (
                <div className="text-sm text-muted-foreground">
                  SKU: <span className="font-mono">{product.sku}</span>
                </div>
              )}

              {/* Price */}
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3">
                <span className="text-3xl md:text-4xl font-semibold text-primary tracking-tight">
                  {currency === 'INR' ? '₹' : '$'}{convertPrice(discountedPrice).toFixed(2)}
                </span>
                {hasDiscount && (
                  <div className="flex items-baseline gap-2 text-sm">
                    <span className="text-muted-foreground line-through">{currency === 'INR' ? '₹' : '$'}{convertPrice(safePrice).toFixed(2)}</span>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-xs font-medium">
                      Save {discountPercent.toFixed(0)}%
                    </Badge>
                  </div>
                )}
              </div>

              <Separator className="my-1" />

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">Quantity:</span>
                  <div className="flex items-center border border-border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={addingToCart}
                      className="rounded-r-none"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={addingToCart}
                      className="rounded-l-none"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3 relative">
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-base"
                  >
                    {addingToCart ? (
                      "Adding..."
                    ) : successMessage ? (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        {successMessage}
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    onClick={toggleWishlist}
                    disabled={wishlistLoading}
                    className={`h-14 px-6 ${isInWishlist ? "text-primary border-primary bg-primary/10" : ""}`}
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""} ${wishlistLoading ? "animate-pulse" : ""}`} />
                  </Button>

                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-14 px-6 relative"
                    onClick={() => setShowShareMenu(!showShareMenu)}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>

                  {/* Share Menu */}
                  {showShareMenu && (
                    <div className="absolute top-full mt-2 right-0 bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-[200px]">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                        <span className="text-sm font-medium">Share</span>
                        <button
                          onClick={() => setShowShareMenu(false)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2"
                      >
                        <span className="w-4 h-4 bg-blue-600 rounded"></span>
                        Facebook
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2"
                      >
                        <span className="w-4 h-4 bg-sky-500 rounded"></span>
                        Twitter
                      </button>
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2"
                      >
                        <span className="w-4 h-4 bg-green-600 rounded"></span>
                        WhatsApp
                      </button>
                      <button
                        onClick={() => handleShare('copy')}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2"
                      >
                        <span className="w-4 h-4 bg-muted-foreground rounded"></span>
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-3">
                  <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                    <Truck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-foreground">Free shipping</p>
                    <p className="text-[11px] text-muted-foreground">On orders over ₹100</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-3">
                  <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-foreground">1 year warranty</p>
                    <p className="text-[11px] text-muted-foreground">Standard coverage included</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-3">
                  <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                    <RotateCcw className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-foreground">Easy returns</p>
                    <p className="text-[11px] text-muted-foreground">30-day return policy</p>
                  </div>
                </div>
              </div>

              {/* Included Courses */}
              {associatedCourses.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Included courses
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4">
                    Purchase includes access to the following course
                    {associatedCourses.length > 1 ? "s" : ""}.
                  </p>
                  {associatedCourses.map((course) => (
                    <Card key={course.id} className="border border-dashed border-border/60 bg-background p-4">
                      <CardContent>
                        <div className="flex items-start gap-4">
                          <div className="h-16 w-16 rounded-md bg-background flex items-center justify-center overflow-hidden">
                            {course.thumbnail_url ? (
                              <img
                                src={course.thumbnail_url}
                                alt={course.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <BookOpen className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-lg truncate mb-1">{course.title}</h3>
                            {course.level && (
                              <Badge variant="outline" className="text-xs capitalize whitespace-nowrap mb-2">
                                {course.level}
                              </Badge>
                            )}
                            {course.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {course.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Separator className="my-8" />

              {/* Details Tabs */}
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="inline-flex w-full justify-start gap-1 rounded-full bg-muted/80 p-1 mb-4">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="specification">Specification</TabsTrigger>
                  <TabsTrigger value="warranty">Warranty</TabsTrigger>
                  <TabsTrigger value="other">Other Info</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.description ||
                      "High-quality product designed for students and professionals. Perfect for robotics projects, IoT applications, and educational purposes. Comes with comprehensive documentation and expert support."}
                  </p>
                </TabsContent>

                <TabsContent value="specification" className="mt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.specification || "Detailed specifications will be available soon."}
                  </p>
                </TabsContent>

                <TabsContent value="warranty" className="mt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.warranty || "Standard warranty terms apply. Contact support for more information."}
                  </p>
                </TabsContent>

                <TabsContent value="other" className="mt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.other_info || "Additional information will be provided here."}
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-border bg-muted/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Related products</h2>
              <Link
                href={`/shop?category=${encodeURIComponent(product.category)}`}
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <Link key={rp.id} href={`/shop/${rp.id}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border hover:border-accent/50">
                    <div className="relative overflow-hidden bg-muted aspect-video">
                      <img
                        src={rp.thumbnail_url || "/placeholder.svg?height=300&width=400&query=tech product"}
                        alt={rp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0">New</Badge>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
                        {rp.category}
                      </p>
                      <h3 className="font-semibold text-sm text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {rp.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {rp.description ||
                          "High-quality product for your next project. Features premium components and expert support."}
                      </p>
                      <span className="text-lg font-bold text-primary">
                        {currency === 'INR' ? '₹' : '$'}{convertPrice(rp.price).toFixed(2)}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
