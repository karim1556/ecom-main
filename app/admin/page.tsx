import { createServerClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"
import { StatsCard } from "@/components/admin/stats-card"
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  Tags,
  BookOpen,
  Settings,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function AdminPage() {
  const supabase = await createServerClient()

  const [productsRes, ordersRes] = await Promise.all([
    supabase.from("products").select("*"),
    supabase.from("orders").select("*"),
  ])

  const products = productsRes.data || []
  const orders = ordersRes.data || []

  // Only count revenue from completed orders
  const completedOrders = orders.filter((order) => order.status === "completed")
  const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.amount || 0), 0)
  const totalOrders = orders.length
  const totalProducts = products.length
  const pendingOrders = orders.filter((o) => o.status === "pending").length

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AdminHeader title="Dashboard" description="Welcome back! Here's an overview of your store." />

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Total Revenue"
            value={`₹${totalRevenue.toFixed(2)}`}
            description={`From ${completedOrders.length} completed orders`}
            icon={DollarSign}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatsCard
            title="Total Orders"
            value={totalOrders}
            description={`${pendingOrders} pending`}
            icon={ShoppingCart}
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatsCard
            title="Products"
            value={totalProducts}
            description="In catalog"
            icon={Package}
            trend={{ value: 4.1, isPositive: true }}
          />
          <StatsCard
            title="Active Customers"
            value={orders.length > 0 ? new Set(orders.map((o) => o.user_id)).size : 0}
            description="This month"
            icon={Users}
            trend={{ value: 15.3, isPositive: true }}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
          {/* Recent Orders */}
          <Card className="lg:col-span-4 h-full shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-2xl">Recent Orders</CardTitle>
                <CardDescription className="mt-1">Latest transactions from your store</CardDescription>
              </div>
              <Link href="/admin/orders">
                <Button variant="outline" size="sm" className="gap-2">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <ShoppingCart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={
                            order.status === "completed"
                              ? "default"
                              : order.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            order.status === "completed"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                : ""
                          }
                        >
                          {order.status}
                        </Badge>
                        <span className="font-bold text-lg text-primary">₹{order.amount?.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="lg:col-span-3 h-full shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-2xl">Top Products</CardTitle>
                <CardDescription className="mt-1">Best selling items</CardDescription>
              </div>
              <Link href="/admin/products">
                <Button variant="outline" size="sm" className="gap-2">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">No products yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-bold text-primary group-hover:from-primary/30 group-hover:to-primary/20 transition-all">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{product.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
                      </div>
                      <span className="font-bold text-primary text-base">₹{product.price?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Actions</CardTitle>
            <CardDescription className="mt-1">Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link href="/admin/products/new">
                <Button className="w-full h-12 text-base font-semibold">
                  <Package className="mr-2 h-5 w-5" />
                  Add New Product
                </Button>
              </Link>
              <Link href="/admin/categories">
                <Button variant="outline" className="w-full h-12 text-base font-semibold">
                  <Tags className="mr-2 h-5 w-5" />
                  Manage Categories
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button variant="outline" className="w-full h-12 text-base font-semibold">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  View Orders
                </Button>
              </Link>
              <Link href="/admin/customers">
                <Button variant="outline" className="w-full h-12 text-base font-semibold">
                  <Users className="mr-2 h-5 w-5" />
                  View Customers
                </Button>
              </Link>
              <Link href="/admin/courses">
                <Button variant="outline" className="w-full h-12 text-base font-semibold">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Manage Courses
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full h-12 text-base font-semibold">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
