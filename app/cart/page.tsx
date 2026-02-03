"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useCart } from "@/lib/cart-context"
import { useCurrency } from "@/lib/currency-context"

export default function CartPage() {
  const { items, isLoading, removeFromCart, updateQuantity, total } = useCart()
  const { currency, convertPrice } = useCurrency()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading cart...</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-primary mb-8">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Link
                href="/shop"
                className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-light transition inline-block"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 border border-border rounded-lg p-4">
                    <img
                      src={item.product.thumbnail_url || "/placeholder.svg"}
                      alt={item.product.title}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary">{item.product.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {item.product.discount_percent && item.product.discount_percent > 0 ? (
                          <>
                            <p className="text-accent text-lg font-bold">
                              {currency === 'INR' ? '₹' : '$'}{convertPrice(item.product.price * (1 - item.product.discount_percent / 100)).toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground line-through">
                              {currency === 'INR' ? '₹' : '$'}{convertPrice(item.product.price).toFixed(2)}
                            </p>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {item.product.discount_percent}% OFF
                            </span>
                          </>
                        ) : (
                          <p className="text-accent text-lg font-bold">
                            {currency === 'INR' ? '₹' : '$'}{convertPrice(item.product.price).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center border border-border rounded">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-muted-foreground hover:text-foreground"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                          className="w-10 text-center border-l border-r border-border py-1"
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-muted-foreground hover:text-foreground"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-muted rounded-lg p-6 h-fit">
                <h2 className="text-xl font-bold text-primary mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{currency === 'INR' ? '₹' : '$'}{convertPrice(total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold">{total > 100 ? "FREE" : `${currency === 'INR' ? '₹' : '$'}${(10).toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-semibold">{currency === 'INR' ? '₹' : '$'}{convertPrice(total * 0.1).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between mb-6">
                  <span className="text-lg font-bold text-primary">Total</span>
                  <span className="text-2xl font-bold text-accent">
                    {currency === 'INR' ? '₹' : '$'}{convertPrice(total + (total > 100 ? 0 : 10) + total * 0.1).toFixed(2)}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  className="w-full px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-light transition font-semibold mb-3 block text-center"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/shop"
                  className="w-full px-6 py-3 border border-border rounded-lg hover:bg-white transition font-semibold text-center"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
