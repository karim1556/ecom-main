"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Product {
  id: string
  title: string
  price: number
  category: string
}

interface Order {
  id: string
  amount: number
  status: string
  created_at: string
}

export default function AdminDashboardClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          supabase.from("products").select("*"),
          supabase.from("orders").select("*"),
        ])

        if (productsRes.data) setProducts(productsRes.data)
        if (ordersRes.data) setOrders(ordersRes.data)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0)
  const totalOrders = orders.length
  const totalProducts = products.length

  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-primary text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Link href="/" className="px-4 py-2 bg-accent hover:bg-accent-light transition rounded-md">
              Back to Store
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 border border-border">
            <p className="text-muted-foreground text-sm font-semibold mb-2">Total Revenue</p>
            <h3 className="text-3xl font-bold text-primary mb-2">₹{totalRevenue.toFixed(2)}</h3>
            <p className="text-muted-foreground text-sm">From {totalOrders} orders</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-border">
            <p className="text-muted-foreground text-sm font-semibold mb-2">Total Orders</p>
            <h3 className="text-3xl font-bold text-accent mb-2">{totalOrders}</h3>
            <p className="text-muted-foreground text-sm">Across all customers</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-border">
            <p className="text-muted-foreground text-sm font-semibold mb-2">Total Products</p>
            <h3 className="text-3xl font-bold text-primary mb-2">{totalProducts}</h3>
            <p className="text-muted-foreground text-sm">In catalog</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-border">
              <div className="flex justify-between items-center p-6 border-b border-border">
                <h2 className="text-xl font-bold text-primary">Products</h2>
                <Link
                  href="/admin/products/new"
                  className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-light transition text-sm font-semibold"
                >
                  Add Product
                </Link>
              </div>

              {loading ? (
                <div className="p-6 text-center text-muted-foreground">Loading...</div>
              ) : products.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">No products found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-semibold text-foreground">Title</th>
                        <th className="text-left p-4 font-semibold text-foreground">Category</th>
                        <th className="text-left p-4 font-semibold text-foreground">Price</th>
                        <th className="text-center p-4 font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 5).map((product) => (
                        <tr key={product.id} className="border-b border-border hover:bg-muted transition">
                          <td className="p-4">{product.title}</td>
                          <td className="p-4 text-accent">{product.category}</td>
                          <td className="p-4 font-semibold">₹{product.price.toFixed(2)}</td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <Link
                                href={`/admin/products/₹{product.id}`}
                                className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-light transition"
                              >
                                Edit
                              </Link>
                              <button className="px-3 py-1 text-sm bg-destructive text-white rounded hover:opacity-90 transition">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-primary">Recent Orders</h2>
            </div>

            {loading ? (
              <div className="p-6 text-center text-muted-foreground">Loading...</div>
            ) : orders.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No orders found.</div>
            ) : (
              <div className="divide-y divide-border">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="p-4 hover:bg-muted transition">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-mono text-muted-foreground">{order.id.slice(0, 8)}...</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ₹{
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="font-semibold text-accent mb-1">₹{order.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
