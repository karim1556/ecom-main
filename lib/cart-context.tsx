"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export interface CartItem {
  id: string
  product_id: string
  quantity: number
  product: {
    id: string
    title: string
    price: number
    thumbnail_url: string
    category?: string
    discount_percent?: number | null
    stock_quantity?: number
    track_stock?: boolean
  }
}

interface CartContextType {
  items: CartItem[]
  isLoading: boolean
  addToCart: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (cartItemId: string) => Promise<void>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  applyCoupon: (code: string) => Promise<any>
  removeCoupon: () => void
  total: number
  appliedCoupon: any
  reduceStock: (items: CartItem[]) => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [supabase] = useState(() => createClient())
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)

  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (!supabase) {
          console.log("[v0] Supabase not available")
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
          console.log("[v0] No authenticated user, cart remains empty")
          setIsLoading(false)
          return
        }

        console.log("[v0] Cart fetch for user:", user.id)

        // Step 1: fetch cart items without join (RLS-safe)
        const { data: cartRows, error: cartError } = await supabase
          .from("cart_items")
          .select("id, product_id, quantity")
          .eq("user_id", user.id)

        console.log("[v0] Cart items response:", { cartRows, cartError })
        if (cartError) throw new Error(`₹{cartError.message || "Unknown error"}`)

        const productIds = Array.from(new Set((cartRows || []).map((r: any) => r.product_id)))
        if (productIds.length === 0) {
          setItems([])
          return
        }

        // Step 2: fetch products by IDs
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("id, title, price, thumbnail_url, discount_percent")
          .in("id", productIds)

        console.log("[v0] Products response:", { products, productsError })
        if (productsError) throw new Error(`₹{productsError.message || "Unknown error"}`)

        const productMap = new Map((products || []).map((p: any) => [p.id, p]))
        const composed = (cartRows || []).map((row: any) => ({
          id: row.id,
          product_id: row.product_id,
          quantity: row.quantity,
          product: productMap.get(row.product_id) || { id: row.product_id, title: "", price: 0, thumbnail_url: "" },
        }))

        setItems(composed)
      } catch (error) {
        const e = error as any
        console.error("[v0] Cart fetch error message:", e?.message || e)
        console.error("[v0] Cart fetch error:", {
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

    fetchCart()
  }, [supabase])

  const addToCart = async (productId: string, quantity: number) => {
    try {
      if (!supabase) throw new Error("Supabase not available")

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        alert("Please sign in to add items to cart")
        return
      }

      // Check existing cart item and product stock in parallel
      const [existingItemResult, productResult] = await Promise.all([
        supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .single(),
        supabase
          .from("products")
          .select("stock_quantity, track_stock, title")
          .eq("id", productId)
          .single()
      ])

      const product = productResult.data
      const existingItem = existingItemResult.data

      // Stock validation
      if (product?.track_stock && product.stock_quantity !== undefined) {
        const currentCartQuantity = existingItem?.quantity || 0
        const totalRequested = currentCartQuantity + quantity

        if (totalRequested > product.stock_quantity) {
          alert(`Only ${product.stock_quantity} units of "${product.title}" are available in stock.`)
          return
        }
      }

      // Update or insert cart item
      if (existingItem) {
        const { data: updatedItem } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id)
          .select(`
            id,
            product_id,
            quantity,
            product:products(id, title, price, thumbnail_url, discount_percent, stock_quantity, track_stock)
          `)
          .single()

        // Update local state immediately
        setItems(prev => prev.map(item => 
          item.id === existingItem.id 
            ? { ...item, quantity: updatedItem.quantity }
            : item
        ))
      } else {
        const { data: newItem } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: productId,
          quantity,
        }).select(`
          id,
          product_id,
          quantity,
          product:products(id, title, price, thumbnail_url, discount_percent, stock_quantity, track_stock)
        `).single()

        // Add to local state immediately
        if (newItem) {
          setItems(prev => [...prev, newItem])
        }
      }
    } catch (error) {
      console.error("[v0] Add to cart error:", error)
      throw error
    }
  }

  const removeFromCart = async (cartItemId: string) => {
    try {
      if (!supabase) throw new Error("Supabase not available")
      await supabase.from("cart_items").delete().eq("id", cartItemId)
      setItems(items.filter((item) => item.id !== cartItemId))
    } catch (error) {
      console.error("[v0] Remove from cart error:", error)
      throw error
    }
  }

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      if (!supabase) throw new Error("Supabase not available")
      if (quantity <= 0) {
        await removeFromCart(cartItemId)
        return
      }

      // Get cart item to check product stock
      const cartItem = items.find(item => item.id === cartItemId)
      if (!cartItem) {
        throw new Error("Cart item not found")
      }

      // Check stock availability
      const { data: product } = await supabase
        .from("products")
        .select("stock_quantity, track_stock, title")
        .eq("id", cartItem.product_id)
        .single()

      if (product?.track_stock && product.stock_quantity !== undefined && quantity > product.stock_quantity) {
        alert(`Only ${product.stock_quantity} units of "${product.title}" are available in stock.`)
        return
      }

      await supabase.from("cart_items").update({ quantity }).eq("id", cartItemId)

      setItems(items.map((item) => (item.id === cartItemId ? { ...item, quantity } : item)))
    } catch (error) {
      console.error("[v0] Update quantity error:", error)
      throw error
    }
  }

  const clearCart = async () => {
    try {
      if (!supabase) throw new Error("Supabase not available")

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from("cart_items").delete().eq("user_id", user.id)
      setItems([])
      setAppliedCoupon(null)
    } catch (error) {
      console.error("[v0] Clear cart error:", error)
      throw error
    }
  }

  const applyCoupon = async (code: string) => {
    try {
      const cartItems = items.map(item => ({
        id: item.product.id,
        price: item.product.price,
        quantity: item.quantity,
        category: item.product.category || 'General'
      }))

      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal: total, cartItems })
      })

      const data = await response.json()
      
      if (data.valid) {
        setAppliedCoupon(data.coupon)
      }
      
      return data
    } catch (error) {
      console.error('[v0] Apply coupon error:', error)
      throw error
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
  }

  const reduceStock = async (cartItems: CartItem[]) => {
    try {
      if (!supabase) throw new Error("Supabase not available")

      for (const item of cartItems) {
        if (item.product.track_stock && item.product.stock_quantity !== undefined) {
          await fetch('/api/products/stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: item.product_id,
              quantity: item.quantity,
              operation: 'subtract'
            })
          })
        }
      }
    } catch (error) {
      console.error('[v0] Reduce stock error:', error)
      throw error
    }
  }

  const total = items.reduce((sum, item) => {
  const itemPrice = item.product.discount_percent 
    ? item.product.price * (1 - item.product.discount_percent / 100)
    : item.product.price
  return sum + itemPrice * item.quantity
}, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        total,
        appliedCoupon,
        reduceStock,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
