"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { useCurrency } from "@/lib/currency-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Search, SlidersHorizontal, Grid3X3, LayoutList, Heart, ShoppingCart, Star, X } from "lucide-react"

interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  thumbnail_url: string
  discount_percent?: number | null
  sku?: string | null
  stock_quantity?: number
  low_stock_threshold?: number
  track_stock?: boolean
}


const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Best Rating" },
]

const FilterSidebar = ({
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  inStockOnly,
  setInStockOnly,
  setSearchTerm,
  categories,
  currency,
  convertPrice,
}: {
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  priceRange: number[]
  setPriceRange: (range: number[]) => void
  inStockOnly: boolean
  setInStockOnly: (checked: boolean) => void
  setSearchTerm: (term: string) => void
  categories: { name: string; slug: string }[]
  currency: 'INR' | 'USD'
  convertPrice: (price: number) => number
}) => (
  <div className="space-y-6">
    {/* Categories */}
    <div>
      <h3 className="font-semibold text-foreground mb-4">Categories</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <button
            key={category.slug}
            onClick={() => setSelectedCategory(category.slug)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
              selectedCategory === category.slug
                ? "bg-primary text-primary-foreground font-medium"
                : "text-foreground hover:bg-muted hover:text-primary"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>

    <Separator />

    {/* Price Range */}
    <div>
      <h3 className="font-semibold text-foreground mb-4">Price Range</h3>
      <Slider value={priceRange} onValueChange={setPriceRange} max={5000} step={100} className="mb-4" />
      <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{currency === 'INR' ? '₹' : '$'}{convertPrice(priceRange[0]).toFixed(0)}</span>
        <span>{currency === 'INR' ? '₹' : '$'}{convertPrice(priceRange[1]).toFixed(0)}</span>
      </div>
    </div>

    <Separator />

    {/* Availability */}
    <div>
      <h3 className="font-semibold text-foreground mb-4">Availability</h3>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="in-stock"
          checked={inStockOnly}
          onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
        />
        <label htmlFor="in-stock" className="text-sm text-muted-foreground cursor-pointer">
          In Stock Only
        </label>
      </div>
    </div>

    <Separator />

    {/* Clear Filters */}
    <Button
      variant="outline"
      className="w-full bg-transparent"
      onClick={() => {
        setSelectedCategory("All Products")
        setPriceRange([0, 5000])
        setInStockOnly(false)
        setSearchTerm("")
      }}
    >
      Clear All Filters
    </Button>
  </div>
)

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("AllProducts")
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([])
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [inStockOnly, setInStockOnly] = useState(false)

  const { addToCart } = useCart()
  const { currency, convertPrice } = useCurrency()
  const { items: wishlistItems, addToWishlist, removeFromWishlist } = useWishlist()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories")
        ])
        const productsData = await productsRes.json()
        const categoriesData = await categoriesRes.json()
        setProducts(productsData)
        setCategories([{ name: "All Products", slug: "AllProducts" }, ...categoriesData])
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.product_id === productId)
  }

  const toggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(productId)
    }
  }

  const handleAddToCart = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    await addToCart(productId, 1)
  }

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory = selectedCategory === "AllProducts" || product.category === selectedCategory
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      return matchesCategory && matchesSearch && matchesPrice
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "newest":
          return -1
        default:
          return 0
      }
    })

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Banner */}
        <div className="bg-muted/30 border-b border-border py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Discover Amazing <span className="text-primary">Products</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Explore our curated collection of tech products, kits, and components for your next project
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-6 text-base rounded-full border border-border shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-lg text-foreground">Filters</h2>
                  <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
                </div>
                <FilterSidebar
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  inStockOnly={inStockOnly}
                  setInStockOnly={setInStockOnly}
                  setSearchTerm={setSearchTerm}
                  categories={categories}
                  currency={currency}
                  convertPrice={convertPrice}
                />
              </div>
            </aside>

            {/* Products Section */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {/* Mobile Filter Button */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden bg-transparent">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterSidebar
                          selectedCategory={selectedCategory}
                          setSelectedCategory={setSelectedCategory}
                          priceRange={priceRange}
                          setPriceRange={setPriceRange}
                          inStockOnly={inStockOnly}
                          setInStockOnly={setInStockOnly}
                          setSearchTerm={setSearchTerm}
                          categories={categories}
                          currency={currency}
                          convertPrice={convertPrice}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> of{" "}
                    <span className="font-medium text-foreground">{products.length}</span> products
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort Dropdown */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* View Toggle */}
                  <div className="flex items-center border border-border rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded ${
                        viewMode === "grid"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded ${
                        viewMode === "list"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <LayoutList className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory !== "AllProducts" || searchTerm || priceRange[0] > 0 || priceRange[1] < 5000) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedCategory !== "AllProducts" && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory("AllProducts")}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {searchTerm && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      Search: {searchTerm}
                      <button onClick={() => setSearchTerm("")} className="ml-1 hover:bg-muted rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {(priceRange[0] > 0 || priceRange[1] < 5000) && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      {currency === 'INR' ? '₹' : '$'}{convertPrice(priceRange[0]).toFixed(0)} - {currency === 'INR' ? '₹' : '$'}{convertPrice(priceRange[1]).toFixed(0)}
                      <button
                        onClick={() => setPriceRange([0, 5000])}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}

              {/* Products Grid */}
              {loading ? (
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                  }`}
                >
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-56 w-full" />
                      <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-24" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your filters or search term</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory("AllProducts")
                      setSearchTerm("")
                      setPriceRange([0, 5000])
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Link key={product.id} href={`/shop/${product.id}`}>
                      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border hover:border-accent/50">
                        <div className="relative overflow-hidden bg-muted aspect-video">
                          <img
                            src={product.thumbnail_url || "/placeholder.svg?height=300&width=400&query=tech product"}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Badge */}
                          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0">New</Badge>
                        </div>

                        <CardContent className="p-4">
                          <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">
                            {product.category}
                          </p>
                          <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {product.title}
                          </h3>
                          
                          {/* SKU */}
                          {product.sku && (
                            <p className="text-xs text-muted-foreground mb-3">
                              SKU: <span className="font-mono uppercase">{product.sku}</span>
                            </p>
                          )}

                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">(128)</span>
                          </div>

                          {/* Stock Status */}
                          {product.track_stock && (
                            <div className="mb-3">
                              {product.stock_quantity && product.stock_quantity > (product.low_stock_threshold || 5) ? (
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-xs">
                                  In stock ({product.stock_quantity})
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-100 text-xs">
                                  Low stock ({product.stock_quantity})
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            {product.discount_percent && product.discount_percent > 0 ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground line-through">
                                  {currency === 'INR' ? '₹' : '$'}{convertPrice(product.price).toFixed(2)}
                                </span>
                                <span className="text-xl font-bold text-primary">
                                  {currency === 'INR' ? '₹' : '$'}{convertPrice(product.price * (1 - product.discount_percent / 100)).toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xl font-bold text-primary">
                                {currency === 'INR' ? '₹' : '$'}{convertPrice(product.price).toFixed(2)}
                              </span>
                            )}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => toggleWishlist(e, product.id)}
                                className={`p-2 ${
                                  isInWishlist(product.id) ? "text-primary border-primary bg-primary/10" : ""
                                }`}
                              >
                                <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => handleAddToCart(e, product.id)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <Link key={product.id} href={`/shop/${product.id}`}>
                      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50">
                        <div className="flex flex-col sm:flex-row">
                          <div className="relative overflow-hidden bg-muted sm:w-64 h-48 sm:h-auto shrink-0">
                            <img
                              src={product.thumbnail_url || "/placeholder.svg?height=200&width=300&query=tech product"}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0">New</Badge>
                          </div>

                          <CardContent className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                              <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">
                                {product.category}
                              </p>
                              <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                                {product.title}
                              </h3>
                              
                              {/* SKU */}
                              {product.sku && (
                                <p className="text-xs text-muted-foreground mb-2">
                                  SKU: <span className="font-mono uppercase">{product.sku}</span>
                                </p>
                              )}
                              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                {product.description ||
                                  "High-quality product for your next project. Features premium components and expert support."}
                              </p>

                              {/* Rating */}
                              <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                                ))}
                                <span className="text-sm text-muted-foreground ml-1">(128 reviews)</span>
                              </div>

                              {/* Stock Status */}
                              {product.track_stock && (
                                <div className="mb-4">
                                  {product.stock_quantity && product.stock_quantity > (product.low_stock_threshold || 5) ? (
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-xs">
                                      In stock ({product.stock_quantity})
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-100 text-xs">
                                      Low stock ({product.stock_quantity})
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              {product.discount_percent && product.discount_percent > 0 ? (
                                <div className="flex flex-col items-start">
                                  <span className="text-sm text-muted-foreground line-through">
                                    {currency === 'INR' ? '₹' : '$'}{convertPrice(product.price).toFixed(2)}
                                  </span>
                                  <span className="text-2xl font-bold text-primary">
                                    {currency === 'INR' ? '₹' : '$'}{convertPrice(product.price * (1 - product.discount_percent / 100)).toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-2xl font-bold text-primary">
                                  {currency === 'INR' ? '₹' : '$'}{convertPrice(product.price).toFixed(2)}
                                </span>
                              )}
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={(e) => toggleWishlist(e, product.id)}
                                  className={isInWishlist(product.id) ? "text-primary border-primary bg-primary/10" : ""}
                                >
                                  <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => handleAddToCart(e, product.id)}
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  Add to Cart
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
