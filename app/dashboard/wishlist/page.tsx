"use client"

import { useWishlist } from "@/lib/wishlist-context"
import { useCart } from "@/lib/cart-context"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import Link from "next/link"

export default function WishlistPage() {
  const { items, isLoading, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1)
  }

  const handleRemove = async (productId: string) => {
    await removeFromWishlist(productId)
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-primary fill-primary flex-shrink-0" />
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Wishlist</h1>
          <span className="text-muted-foreground">({items.length} items)</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-muted rounded-2xl h-64 sm:h-80 animate-pulse" />
            ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 sm:py-20">
          <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6 text-sm sm:text-base max-w-md mx-auto">
            Save items you love by clicking the heart icon on any product
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition text-sm sm:text-base"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <Link href={`/shop/₹{item.product_id}`}>
                <div className="relative overflow-hidden bg-muted h-48 sm:h-56">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleRemove(item.product_id)
                    }}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-card rounded-full shadow-md hover:bg-destructive/10 transition z-10"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
                  </button>
                  <img
                    src={
                      item.product.thumbnail_url ||
                      "/placeholder.svg?height=224&width=280&query=electronics project kit" ||
                      "/placeholder.svg"
                    }
                    alt={item.product.title}
                    className="w-full h-full object-cover hover:scale-110 transition duration-500"
                  />
                </div>
              </Link>
              <div className="p-3 sm:p-4">
                <p className="text-xs text-primary font-semibold mb-1 uppercase tracking-wide">
                  {item.product.category}
                </p>
                <Link href={`/shop/₹{item.product_id}`}>
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition text-sm sm:text-base">
                    {item.product.title}
                  </h3>
                </Link>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-base sm:text-lg font-bold text-primary">₹{item.product.price.toFixed(2)}</span>
                  <button
                    onClick={() => handleAddToCart(item.product_id)}
                    className="flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded-lg text-xs sm:text-sm font-medium hover:bg-primary/90 transition w-full sm:w-auto"
                  >
                    <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Add</span>
                    <span className="sm:hidden">Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
