"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import { useWishlist } from "@/lib/wishlist-context"
import { useCart } from "@/lib/cart-context"
import { useCurrency } from "@/lib/currency-context"

interface Product {
  id: string
  title: string
  price: number
  category: string
  thumbnail_url: string
  description?: string
  created_at?: string
  discount_percent?: number | null
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("bestseller")
  const [wishlistLoadingById, setWishlistLoadingById] = useState<Record<string, boolean>>({})
  const [cartLoadingById, setCartLoadingById] = useState<Record<string, boolean>>({})
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { currency, convertPrice } = useCurrency()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products")
        if (!response.ok) {
          setLoading(false)
          return
        }
        const data = await response.json()
        setAllProducts(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Fetch failed:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    if (allProducts.length === 0) return

    let filtered = [...allProducts]

    switch (activeFilter) {
      case "bestseller":
        // Sort by price (higher price = more popular assumption)
        filtered = filtered.sort((a, b) => b.price - a.price)
        break
      case "new":
        // Sort by created_at (newest first)
        filtered = filtered.sort(
          (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
        )
        break
      case "popular":
        // Shuffle for variety (simulating popularity)
        filtered = filtered.sort(() => Math.random() - 0.5)
        break
      case "affordable":
        // Sort by price (lowest first)
        filtered = filtered.sort((a, b) => a.price - b.price)
        break
      default:
        break
    }

    setProducts(filtered.slice(0, 4))
  }, [allProducts, activeFilter])

  const filters = [
    { id: "bestseller", label: "Best Sellers" },
    { id: "new", label: "New Arrivals" },
    { id: "popular", label: "Popular" },
    { id: "affordable", label: "Affordable" },
  ]

  const getBadge = (index: number) => {
    if (activeFilter === "bestseller" && index === 0) {
      return (
        <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full z-10">
          Best Seller
        </span>
      )
    }
    if (activeFilter === "new") {
      return (
        <span className="absolute top-3 left-3 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full z-10">
          New
        </span>
      )
    }
    if (activeFilter === "popular" && index < 2) {
      return (
        <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full z-10">
          Trending
        </span>
      )
    }
    if (activeFilter === "affordable") {
      return (
        <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full z-10">
          Value Pick
        </span>
      )
    }
    return null
  }

  const handleWishlistClick = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (wishlistLoadingById[productId]) return
    try {
      setWishlistLoadingById((prev) => ({ ...prev, [productId]: true }))
      await toggleWishlist(productId)
    } finally {
      setWishlistLoadingById((prev) => ({ ...prev, [productId]: false }))
    }
  }

  const handleAddToCart = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (cartLoadingById[productId]) return
    try {
      setCartLoadingById((prev) => ({ ...prev, [productId]: true }))
      await addToCart(productId, 1)
    } finally {
      setCartLoadingById((prev) => ({ ...prev, [productId]: false }))
    }
  }

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Find Your Perfect{" "}
            <span className="relative inline-block">
              Project Kit
              <span className="absolute bottom-0 left-0 w-full h-1 bg-accent/30" />
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition ${
                activeFilter === filter.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-muted-foreground">
            Showing {products.length} of {allProducts.length} products
          </span>
          <Link href="/shop" className="text-sm text-primary hover:underline font-medium">
            View All Products →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array(4)
                .fill(0)
                .map((_, i) => <div key={i} className="bg-muted rounded-2xl h-80 animate-pulse" />)
            : products.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.id}`}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden bg-muted h-56">
                    {getBadge(index)}
                    <button
                      onClick={(e) => handleWishlistClick(e, product.id)}
                      disabled={!!wishlistLoadingById[product.id]}
                      className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition z-10 ${
                        isInWishlist(product.id) ? "bg-primary text-primary-foreground" : "bg-card hover:bg-primary hover:text-primary-foreground"
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""} ${wishlistLoadingById[product.id] ? "opacity-70" : ""}`}
                      />
                    </button>
                    <img
                      src={
                        product.thumbnail_url || "/placeholder.svg?height=224&width=280&query=electronics project kit"
                      }
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-primary font-semibold mb-1 uppercase tracking-wide">{product.category}</p>
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition">
                      {product.title}
                    </h3>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col items-start">
                        {product.discount_percent && product.discount_percent > 0 && (
                          <span className="text-sm text-muted-foreground line-through">
                            {currency === 'INR' ? '₹' : '$'}{convertPrice(product.price).toFixed(2)}
                          </span>
                        )}
                        <span className="text-lg font-bold text-primary">
                          {currency === 'INR' ? '₹' : '$'}{
                            product.discount_percent && product.discount_percent > 0
                              ? convertPrice(product.price * (1 - product.discount_percent / 100)).toFixed(2)
                              : convertPrice(product.price).toFixed(2)
                          }
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleAddToCart(e, product.id)}
                        disabled={!!cartLoadingById[product.id]}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {cartLoadingById[product.id] ? "Adding..." : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  )
}
