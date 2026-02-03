"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type React from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"
import { useCart } from "@/lib/cart-context"

interface User {
  id: string
  email: string
}

export default function CheckoutPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { items, total, clearCart } = useCart()

  const [couponCode, setCouponCode] = useState("")
  const [couponError, setCouponError] = useState<string | null>(null)
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string
    code: string
  } | null>(null)

  // Require authentication before accessing checkout
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth")
        return
      }
      setUser({ id: user.id, email: user.email || "" })
      setLoading(false)
    }

    checkAuth()
  }, [router, supabase])

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  })

  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCheckoutLoading(true)

    try {
      const checkoutData = {
        ...formData,
        userId: user?.id,
        items: items,
        subtotal: total,
        shipping,
        tax,
        discount: discountAmount,
        total: finalTotal,
        couponId: appliedCoupon?.id ?? null,
        couponCode: appliedCoupon?.code ?? null,
      }
      
      console.log("Sending checkout data:", checkoutData)

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutData),
      })

      if (response.ok) {
        await clearCart()
        alert("Order placed successfully!")
        router.push("/")
      } else {
        alert("Order failed. Please try again.")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert("An error occurred")
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-muted py-12 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-muted py-12 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Link href="/shop" className="text-accent hover:text-accent-light">
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const shipping = total > 100 ? 0 : 10
  const tax = total * 0.1
  const finalTotal = Math.max(total + shipping + tax - discountAmount, 0)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code")
      return
    }

    setApplyingCoupon(true)
    setCouponError(null)

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), cartTotal: total }),
      })

      const data = await res.json()

      if (!res.ok || !data.valid) {
        setAppliedCoupon(null)
        setDiscountAmount(0)
        setCouponError(data.error || "Invalid coupon")
        return
      }

      setAppliedCoupon({ id: data.coupon.id, code: data.coupon.code })
      setDiscountAmount(data.coupon.discountAmount)
      setCouponError(null)
    } catch (error) {
      console.error("Apply coupon error:", error)
      setCouponError("Failed to apply coupon. Please try again.")
      setAppliedCoupon(null)
      setDiscountAmount(0)
    } finally {
      setApplyingCoupon(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-muted py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Checkout</h1>
          <p className="text-muted-foreground mb-8">Logged in as: {user?.email}</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shipping Address */}
                <div className="bg-white rounded-lg p-6 border border-border">
                  <h2 className="text-xl font-bold text-primary mb-4">Shipping Address</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="col-span-2 px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="col-span-2 px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <input
                      type="text"
                      name="address"
                      placeholder="Address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="col-span-2 px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="Zip Code"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                      className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={checkoutLoading}
                    className="flex-1 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-light transition font-semibold disabled:opacity-50"
                  >
                    {checkoutLoading ? "Processing..." : "Place Order"}
                  </button>
                  <Link
                    href="/cart"
                    className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-white transition font-semibold text-center"
                  >
                    Back to Cart
                  </Link>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg p-6 border border-border h-fit">
              <h2 className="text-xl font-bold text-primary mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6 pb-6 border-b border-border max-h-64 overflow-y-auto">
                {items.map((item) => {
                    const itemTotal = item.product.discount_percent 
                      ? item.product.price * item.quantity * (1 - item.product.discount_percent / 100)
                      : item.product.price * item.quantity
                    const originalTotal = item.product.price * item.quantity
                    const hasDiscount = item.product.discount_percent && item.product.discount_percent > 0
                    
                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.product.title} x{item.quantity}
                        </span>
                        <div className="text-right">
                          {hasDiscount && (
                            <div className="flex flex-col items-end">
                              <span className="font-semibold text-accent">₹{itemTotal.toFixed(2)}</span>
                              <span className="text-xs text-muted-foreground line-through">₹{originalTotal.toFixed(2)}</span>
                            </div>
                          )}
                          {!hasDiscount && (
                            <span className="font-semibold">₹{originalTotal.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
              <div className="space-y-3 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">{shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="font-semibold">₹{tax.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && appliedCoupon && (
                  <div className="flex justify-between text-green-700">
                    <span className="text-sm">Discount ({appliedCoupon.code})</span>
                    <span className="font-semibold">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              {/* Coupon input */}
              <div className="mb-6 pb-6 border-b border-border space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full flex-1 px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !couponCode.trim()}
                    className="w-full sm:w-auto px-4 py-2 bg-accent text-white rounded-md text-sm font-semibold disabled:opacity-50"
                  >
                    {applyingCoupon ? "Applying..." : appliedCoupon ? "Update" : "Apply"}
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-destructive">{couponError}</p>
                )}
                {discountAmount > 0 && !couponError && appliedCoupon && (
                  <p className="text-xs text-green-700">
                    Coupon <span className="font-semibold">{appliedCoupon.code}</span> applied. You save ₹
                    {discountAmount.toFixed(2)}.
                  </p>
                )}
              </div>
              <div className="flex justify-between mb-6">
                <span className="text-lg font-bold text-primary">Total</span>
                <span className="text-2xl font-bold text-accent">₹{finalTotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                By placing an order, you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
