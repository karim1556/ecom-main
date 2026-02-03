import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Eye, Download } from "lucide-react"
import Link from "next/link"

export default async function UserOrdersPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch all user orders with product details
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      products (
        title,
        thumbnail_url,
        price,
        category
      )
    `)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      cancelled: "destructive",
      processing: "outline",
    }
    return variants[status] || "secondary"
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-500",
      pending: "bg-yellow-500",
      cancelled: "bg-red-500",
      processing: "bg-blue-500",
    }
    return colors[status] || "bg-gray-500"
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground mt-2 text-lg">View and track all your purchases</p>
      </div>

      {/* Orders List */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Order History</CardTitle>
          <CardDescription className="mt-1">{orders?.length || 0} total orders</CardDescription>
        </CardHeader>
        <CardContent>
          {!orders || orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">Start shopping to see your order history here</p>
              <Link href="/shop">
                <Button className="bg-primary hover:bg-primary/90">Browse Products</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-border rounded-lg overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-muted/50 p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Order ID</p>
                        <p className="font-mono text-sm">{order.id.slice(0, 8)}...</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Date</p>
                        <p className="text-sm">
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Total</p>
                        <p className="text-sm font-semibold text-primary">₹{Number(order.amount).toFixed(2)}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusBadge(order.status)} className="capitalize">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(order.status)} mr-2`} />
                      {order.status}
                    </Badge>
                  </div>

                  {/* Order Content */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {order.products?.thumbnail_url ? (
                          <img
                            src={order.products.thumbnail_url || "/placeholder.svg"}
                            alt={order.products.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{order.products?.title || "Product"}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.products?.category || "General"} | Qty: {order.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Unit Price: ₹{Number(order.products?.price || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </Link>
                      {order.status === "completed" && (
                        <Link href={`/dashboard/orders/${order.id}/invoice`}>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Invoice
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Order Timeline */}
                  <div className="border-t border-border p-4 bg-muted/30">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={`w-2 h-2 rounded-full ₹{getStatusColor(order.status)}`} />
                      {order.status === "completed" && "Delivered successfully"}
                      {order.status === "pending" && "Awaiting confirmation"}
                      {order.status === "processing" && "Order is being processed"}
                      {order.status === "cancelled" && "Order was cancelled"}
                    </div>
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
