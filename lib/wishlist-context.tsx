"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export interface WishlistItem {
  id: string
  product_id: string
  product: {
    id: string
    title: string
    price: number
    thumbnail_url: string
    category: string
  }
}

interface WishlistContextType {
  items: WishlistItem[]
  isLoading: boolean
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (productId: string) => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        if (!supabase) {
          setIsLoading(false)
          return
        }

        let user = null
        try {
          const {
            data: { user: authUser },
            error: userError,
          } = await supabase.auth.getUser()
          if (!userError) {
            user = authUser
          }
        } catch (error) {
          console.log("[v0] Auth fetch failed:", error)
        }

        if (!user) {
          setIsLoading(false)
          return
        }

        console.log("[v0] Wishlist fetch for user:", user.id)

        // Step 1: fetch wishlist items without join (RLS-safe)
        const { data: wishRows, error: wishError } = await supabase
          .from("wishlist_items")
          .select("id, product_id")
          .eq("user_id", user.id)

        console.log("[v0] Wishlist items response:", { wishRows, wishError })
        if (wishError) throw new Error(`₹{wishError.message || "Unknown error"}`)

        const productIds = Array.from(new Set((wishRows || []).map((r: any) => r.product_id)))
        if (productIds.length === 0) {
          setItems([])
          return
        }

        // Step 2: fetch products by IDs
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("id, title, price, thumbnail_url, category")
          .in("id", productIds)

        console.log("[v0] Wishlist products response:", { products, productsError })
        if (productsError) throw new Error(`₹{productsError.message || "Unknown error"}`)

        const productMap = new Map((products || []).map((p: any) => [p.id, p]))
        const composed = (wishRows || []).map((row: any) => ({
          id: row.id,
          product_id: row.product_id,
          product: productMap.get(row.product_id) || {
            id: row.product_id,
            title: "",
            price: 0,
            thumbnail_url: "",
            category: "",
          },
        }))

        setItems(composed)
      } catch (error) {
        const e = error as any
        console.error("[v0] Wishlist fetch error message:", e?.message || e)
        console.error("[v0] Wishlist fetch error:", {
          error: e,
          message: e?.message,
          code: e?.code,
          details: e?.details,
          hint: e?.hint,
        })
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchWishlist()
  }, [supabase])

  const addToWishlist = async (productId: string) => {
    try {
      if (!supabase) throw new Error("Supabase not available")

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        alert("Please sign in to add items to your wishlist")
        return
      }

      await supabase.from("wishlist_items").insert({
        user_id: user.id,
        product_id: productId,
      })

      // Refresh items (two-step fetch to avoid join issues)
      const { data: wishRows, error: wishError } = await supabase
        .from("wishlist_items")
        .select("id, product_id")
        .eq("user_id", user.id)
      if (wishError) throw wishError

      const productIds = Array.from(new Set((wishRows || []).map((r: any) => r.product_id)))
      if (productIds.length === 0) {
        setItems([])
        return
      }
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, title, price, thumbnail_url, category")
        .in("id", productIds)
      if (productsError) throw productsError

      const productMap = new Map((products || []).map((p: any) => [p.id, p]))
      const composed = (wishRows || []).map((row: any) => ({
        id: row.id,
        product_id: row.product_id,
        product: productMap.get(row.product_id) || {
          id: row.product_id,
          title: "",
          price: 0,
          thumbnail_url: "",
          category: "",
        },
      }))
      setItems(composed)
    } catch (error) {
      console.error("[v0] Add to wishlist error:", error)
      throw error
    }
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      if (!supabase) throw new Error("Supabase not available")

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", productId)

      setItems(items.filter((item) => item.product_id !== productId))
    } catch (error) {
      console.error("[v0] Remove from wishlist error:", error)
      throw error
    }
  }

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.product_id === productId)
  }

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(productId)
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within WishlistProvider")
  }
  return context
}
