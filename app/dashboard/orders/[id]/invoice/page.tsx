import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Package } from "lucide-react"

interface InvoicePageProps {
  params: { id: string }
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

export default async function InvoicePage({ params }: InvoicePageProps) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">You must be logged in to view this invoice.</p>
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
    .eq("id", params.id)
    .single()

  if (error || !order) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Invoice not found or you do not have access to it.</p>
      </div>
    )
  }

  const createdAt = new Date(order.created_at)

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Invoice</h1>
          <p className="text-muted-foreground text-sm">Order #{order.id.slice(0, 8)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/orders">
            <span className="inline-flex items-center rounded-md border px-3 py-1 text-sm cursor-pointer">
              Back to Orders
            </span>
          </Link>
          {/* Users can use browser print (Ctrl+P / Cmd+P) on this page */}
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white text-black shadow-sm print:shadow-none print:border print:border-gray-300">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-bold">DiscoverProjects.com</h2>
            <p className="text-xs text-gray-600">Student eCommerce Platform</p>
          </div>
          <div className="text-right text-xs text-gray-600">
            <p>Invoice Date: {createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
            <p>Order ID: {order.id}</p>
            <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize mt-1">
              {order.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-4 border-b text-xs text-gray-700">
          <div>
            <p className="font-semibold mb-1">Billed To</p>
            <p>{order.user_id}</p>
            {/* In future, can be replaced with profile name/address */}
          </div>
          <div className="md:text-right">
            <p className="font-semibold mb-1">Payment Summary</p>
            <p>Payment ID: {order.payment_id}</p>
            <p>Date: {createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
          </div>
        </div>

        <div className="px-6 py-4">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-2">Item</th>
                <th className="text-left py-2">Category</th>
                <th className="text-right py-2">Unit Price</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                      {order.products?.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={order.products.thumbnail_url || "/placeholder.svg"}
                          alt={order.products.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-xs">{order.products?.title || "Product"}</p>
                    </div>
                  </div>
                </td>
                <td className="py-2 text-xs text-gray-700">{order.products?.category || "General"}</td>
                <td className="py-2 text-right">₹{Number(order.products?.price || 0).toFixed(2)}</td>
                <td className="py-2 text-right">{order.quantity}</td>
                <td className="py-2 text-right">₹{Number(order.amount).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4 flex flex-col items-end gap-1 text-xs">
            <div className="flex justify-between w-full max-w-xs">
              <span>Subtotal</span>
              <span>₹{Number(order.amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-full max-w-xs text-gray-600">
              <span>Tax & Shipping</span>
              <span>Included</span>
            </div>
            <div className="flex justify-between w-full max-w-xs border-t mt-1 pt-2 font-semibold">
              <span>Total</span>
              <span>₹{Number(order.amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t text-[10px] text-gray-500">
          <p>Thank you for your purchase! This invoice serves as proof of payment for your order.</p>
          <p className="mt-1">For support, contact us via the Support page on DiscoverProjects.com.</p>
        </div>
      </div>
    </div>
  )
}
