import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, ShoppingCart, Heart, CreditCard } from "lucide-react"
import Link from "next/link"

export default async function UserDashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

  // Fetch user orders with product details
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      products (
        title,
        thumbnail_url,
        price
      )
    `)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })

  const totalOrders = orders?.length || 0
  const totalSpent = orders?.reduce((sum, order) => sum + Number(order.amount), 0) || 0
  const pendingOrders = orders?.filter((o) => o.status === "pending").length || 0
  const recentOrders = orders?.slice(0, 5) || []

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Spent",
      value: `₹${totalSpent.toFixed(2)}`,
      icon: CreditCard,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Pending Orders",
      value: pendingOrders.toString(),
      icon: ShoppingCart,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Wishlist Items",
      value: "0",
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ]

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      cancelled: "destructive",
      processing: "outline",
    }
    return variants[status] || "secondary"
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {profile?.full_name || user?.email?.split("@")[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">Here&apos;s an overview of your account activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest purchase history</CardDescription>
          </div>
          <Link href="/dashboard/orders" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders yet</p>
              <Link href="/shop" className="text-primary hover:underline text-sm mt-2 inline-block">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {order.products?.thumbnail_url ? (
                        <img
                          src={order.products.thumbnail_url || "/placeholder.svg"}
                          alt={order.products.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{order.products?.title || "Product"}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {order.quantity} | {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={getStatusBadge(order.status)}>{order.status}</Badge>
                    <p className="font-semibold text-primary">₹{Number(order.amount).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
