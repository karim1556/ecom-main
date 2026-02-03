import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Package } from "lucide-react"

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    completed: "default",
    pending: "secondary",
    cancelled: "destructive",
    processing: "outline",
  }
  return variants[status] || "secondary"
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">You must be logged in to view this order.</p>
      </div>
    )
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `*,
      products (
        title,
        thumbnail_url,
        price,
        category
      )`
    )
    .eq("id", id)
    .single()

  if (error || !order) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Order not found or you do not have access to it.</p>
      </div>
    )
  }

  const createdAt = new Date(order.created_at)

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground mt-2 font-mono text-lg">Order {order.id}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize text-base px-4 py-2">
            {order.status}
          </Badge>
          <Link href="/dashboard/orders">
            <Button variant="outline" size="sm" className="h-10 px-4">
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Summary */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Order Summary</CardTitle>
            <CardDescription className="mt-1">Overview of your purchase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Order ID</p>
                <p className="font-mono font-bold text-base break-all mt-1">{order.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Date</p>
                <p className="font-semibold text-lg mt-1">
                  {createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Status</p>
                <p className="capitalize font-semibold text-lg mt-1">{order.status}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Amount</p>
                <p className="font-bold text-lg text-primary mt-1">₹{Number(order.amount).toFixed(2)}</p>
              </div>
            </div>

            <div className="border-t pt-6 mt-4">
              <h3 className="font-bold text-lg mb-4">Ordered Items</h3>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {order.products?.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={order.products.thumbnail_url || "/placeholder.svg"}
                      alt={order.products.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">{order.products?.title || "Product"}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium">{order.products?.category || "General"}</span> • <span className="font-medium">Qty: {order.quantity}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Unit Price: <span className="font-semibold text-foreground">₹{Number(order.products?.price || 0).toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Payment Information</CardTitle>
            <CardDescription className="mt-1">Summary of payment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-lg">
              <span className="text-muted-foreground">Items Total</span>
              <span className="font-semibold">₹{Number(order.amount).toFixed(2)}</span>
            </div>
            <div className="border-t pt-4 flex justify-between">
              <span className="font-bold text-lg">Amount Paid</span>
              <span className="font-bold text-lg text-primary">₹{Number(order.amount).toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed italic pt-2">
              Note: Amount includes product price, applicable taxes and shipping charges.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
