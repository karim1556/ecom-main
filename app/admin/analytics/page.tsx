"use client"

import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  revenueByCategory: { category: string; revenue: number }[]
  ordersByStatus: { status: string; count: number }[]
  recentOrders: { date: string; amount: number }[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueByCategory: [],
    ordersByStatus: [],
    recentOrders: [],
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const supabase = createClient()
        if (!supabase) return

        const [ordersRes, productsRes, profilesRes] = await Promise.all([
          supabase.from("orders").select("*, products(category)"),
          supabase.from("products").select("*"),
          supabase.from("profiles").select("id"),
        ])

        const orders: any[] = ordersRes.data || []
        const products: any[] = productsRes.data || []
        const profiles: any[] = profilesRes.data || []

        // Calculate revenue by category
        const categoryRevenue: Record<string, number> = {}
        orders.forEach((order: any) => {
          const category = order.products?.category || "Unknown"
          categoryRevenue[category] = (categoryRevenue[category] || 0) + (order.amount || 0)
        })

        // Calculate orders by status
        const statusCount: Record<string, number> = {}
        orders.forEach((order: any) => {
          const status = order.status || "unknown"
          statusCount[status] = (statusCount[status] || 0) + 1
        })

        setData({
          totalRevenue: orders.reduce((sum: number, o: any) => sum + (o.amount || 0), 0),
          totalOrders: orders.length,
          totalProducts: products.length,
          totalCustomers: profiles.length,
          revenueByCategory: Object.entries(categoryRevenue).map(([category, revenue]) => ({
            category,
            revenue,
          })),
          ordersByStatus: Object.entries(statusCount).map(([status, count]) => ({
            status,
            count,
          })),
          recentOrders: orders.slice(0, 10).map((o: any) => ({
            date: o.created_at,
            amount: o.amount || 0,
          })),
        })
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [timeRange])

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${data.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      trend: 12.5,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Total Orders",
      value: data.totalOrders,
      icon: ShoppingCart,
      trend: 8.2,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Products",
      value: data.totalProducts,
      icon: Package,
      trend: 4.1,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Customers",
      value: data.totalCustomers,
      icon: Users,
      trend: 15.3,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ]

  if (loading) {
    return (
      <div className="flex flex-col">
        <AdminHeader title="Analytics" description="Loading..." />
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <AdminHeader title="Analytics" description="Track your store performance" />

      <div className="flex-1 space-y-6 p-6">
        {/* Time Range Filter */}
        <div className="flex justify-end">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {stat.trend > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={stat.trend > 0 ? "text-green-600" : "text-red-600"}>{Math.abs(stat.trend)}%</span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
              <CardDescription>Top performing product categories</CardDescription>
            </CardHeader>
            <CardContent>
              {data.revenueByCategory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              ) : (
                <div className="space-y-4">
                  {data.revenueByCategory
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map((item, index) => {
                      const maxRevenue = Math.max(...data.revenueByCategory.map((i) => i.revenue))
                      const percentage = (item.revenue / maxRevenue) * 100
                      return (
                        <div key={item.category} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{item.category}</span>
                            <span className="text-accent font-semibold">₹{item.revenue.toFixed(2)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-linear-to-r from-primary to-accent transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orders by Status */}
          <Card>
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
              <CardDescription>Current order distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {data.ordersByStatus.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {data.ordersByStatus.map((item) => {
                    const colors: Record<string, string> = {
                      completed: "bg-green-500",
                      pending: "bg-yellow-500",
                      cancelled: "bg-red-500",
                      processing: "bg-blue-500",
                    }
                    const bgColor = colors[item.status] || "bg-gray-500"
                    const total = data.ordersByStatus.reduce((sum, i) => sum + i.count, 0)
                    const percentage = (item.count / total) * 100

                    return (
                      <div key={item.status} className="flex items-center gap-4">
                        <div className={`h-3 w-3 rounded-full ${bgColor}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="capitalize font-medium">{item.status}</span>
                            <span className="text-muted-foreground">{item.count} orders</span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${bgColor} transition-all`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent orders</p>
            ) : (
              <div className="space-y-3">
                {data.recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                        <ShoppingCart className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">New Order</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-accent">₹{order.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
