"use client"

import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, MoreHorizontal, CheckCircle, Clock, XCircle, Eye, MapPin, Printer } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Order {
  id: string
  user_id: string
  product_id: string
  quantity: number
  amount: number
  status: string
  payment_id: string
  created_at: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [userDetailsOpen, setUserDetailsOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const supabase = createClient()
      if (!supabase) return

      // First try a simple query without joins
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })

      console.log("Orders data:", data)
      console.log("Orders error:", error)

      if (!error && data) {
        setOrders(data)
      } else {
        console.error("Failed to fetch orders:", error)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const printUserAddress = () => {
    if (!selectedUser) return
    
    const printContent = `
      <html>
        <head>
          <title>User Address Details - ${selectedUser.full_name || 'Customer'}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
            }
            .header { 
              border-bottom: 2px solid #333; 
              padding-bottom: 10px; 
              margin-bottom: 20px;
            }
            .section { 
              margin-bottom: 20px; 
            }
            .section-title { 
              font-weight: bold; 
              font-size: 16px; 
              margin-bottom: 10px;
              color: #333;
            }
            .field { 
              margin-bottom: 8px; 
            }
            .label { 
              font-weight: bold; 
              color: #666;
              display: inline-block;
              width: 100px;
            }
            .value { 
              margin-left: 10px;
            }
            .address-block {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin: 10px 0;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>User Address Details</h1>
            <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <div class="section">
            <div class="section-title">User Information</div>
            <div class="field">
              <span class="label">User ID:</span>
              <span class="value">${selectedUser.id.slice(0, 8)}</span>
            </div>
            <div class="field">
              <span class="label">Name:</span>
              <span class="value">${selectedUser.full_name || 'Not provided'}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Contact Information</div>
            <div class="field">
              <span class="label">Email:</span>
              <span class="value">${selectedUser.email}</span>
            </div>
            <div class="field">
              <span class="label">Phone:</span>
              <span class="value">${selectedUser.phone || 'Not provided'}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Shipping Address</div>
            <div class="address-block">
              ${selectedUser.full_name || 'Customer'}<br>
              ${selectedUser.address || 'Address not provided'}<br>
              ${selectedUser.city || 'City not provided'}, ${selectedUser.state || 'State not provided'} ${selectedUser.postal_code || 'Postal code not provided'}<br>
              ${selectedUser.country || 'Country not provided'}
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Account Information</div>
            <div class="field">
              <span class="label">Member Since:</span>
              <span class="value">${new Date(selectedUser.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>This document was generated from the E-commerce Admin Dashboard</p>
            <p>Order Management System - Customer Address Details</p>
          </div>
        </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
  }

  const fetchUserDetails = async (userId: string) => {
    try {
      console.log("Fetching user details for:", userId)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      console.log("User details result:", { data, error })

      if (error) {
        console.error("Failed to fetch user details:", error)
        return
      }

      console.log("Setting selected user:", data)
      setSelectedUser(data)
      setUserDetailsOpen(true)
    } catch (error) {
      console.error("Failed to fetch user details:", error)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const supabase = createClient()
      if (!supabase) return

      const currentOrder = orders.find((o) => o.id === orderId)
      const prevStatus = currentOrder?.status

      const { data, error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId)
        .select()

      if (!error && data) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))

        // Reduce stock ONLY when transitioning to completed (and only once)
        if (prevStatus !== "completed" && newStatus === "completed" && currentOrder?.product_id) {
          try {
            const stockRes = await fetch("/api/products/stock", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                operation: "subtract",
                productId: currentOrder.product_id,
                quantity: currentOrder.quantity,
              }),
            })

            if (!stockRes.ok) {
              console.error("Failed to reduce stock for product:", currentOrder.product_id, await stockRes.text())
            }
          } catch (stockErr) {
            console.error("Stock reduction error:", stockErr)
          }
        }
      } else {
        console.error("Failed to update order status:", error)
      }
    } catch (error) {
      console.error("Failed to update order:", error)
    }
  }

  const filteredOrders = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus)

  const searchedOrders = filteredOrders.filter(
    (o) =>
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.product_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.user_id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="mr-1 h-3 w-3" />
            Processing
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const pendingCount = orders.filter((o) => o.status === "pending").length
  const completedCount = orders.filter((o) => o.status === "completed").length
  const totalRevenue = orders.filter((o) => o.status === "completed").reduce((sum, o) => sum + (o.amount || 0), 0)

  return (
    <div className="flex flex-col">
      <AdminHeader title="Orders" description="View and manage customer orders" />

      <div className="flex-1 space-y-6 p-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Orders</p>
                  <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-accent">₹{totalRevenue.toFixed(2)}</p>
                </div>
                <span className="text-3xl">💰</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {isMounted && (
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        )}
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders ({searchedOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : searchedOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">#{order.id.slice(0, 8)}</TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right font-semibold text-accent">
                          ₹{order.amount?.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2" onClick={() => setSelectedOrder(order)}>
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2" 
                                onClick={() => fetchUserDetails(order.user_id)}
                              >
                                <MapPin className="h-4 w-4" />
                                User Address
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateOrderStatus(order.id, "processing")}
                                className="gap-2"
                              >
                                <Clock className="h-4 w-4" />
                                Mark Processing
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateOrderStatus(order.id, "completed")}
                                className="gap-2 text-green-600"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Mark Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateOrderStatus(order.id, "cancelled")}
                                className="gap-2 text-red-600"
                              >
                                <XCircle className="h-4 w-4" />
                                Cancel Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.id?.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono text-sm">#{selectedOrder.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div>{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="text-sm">
                    {new Date(selectedOrder.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Final Amount</p>
                  <p className="font-semibold text-accent">₹{selectedOrder.amount.toFixed(2)}</p>
                </div>
              </div>

              {/* Pricing Info */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <h3 className="font-semibold mb-2 text-sm">Amount Includes</h3>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Product Price (with discounts)</span>
                    <span>✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%)</span>
                    <span>✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>✓</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t">
                    <span>Total Paid</span>
                    <span>₹{selectedOrder.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div>
                <h3 className="font-semibold mb-2">Product Information</h3>
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">Product ID</p>
                  <p className="font-mono">{selectedOrder.product_id.slice(0, 8)}</p>
                  <p className="text-muted-foreground mt-2">Quantity</p>
                  <p>{selectedOrder.quantity}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="text-sm">
                  <p className="text-muted-foreground">User ID</p>
                  <p className="font-mono">{selectedOrder.user_id.slice(0, 8)}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="font-semibold mb-2">Payment Information</h3>
                <div className="text-sm">
                  <p className="text-muted-foreground">Payment ID</p>
                  <p className="font-mono text-xs">{selectedOrder.payment_id}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={userDetailsOpen} onOpenChange={() => setUserDetailsOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>User Address Details</DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={printUserAddress}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-mono text-sm">{selectedUser.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedUser.full_name || "Not provided"}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedUser.phone || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {/* Address Info */}
              <div>
                <h3 className="font-semibold mb-2">Address Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Street Address</p>
                    <p className="font-medium">{selectedUser.address || "Not provided"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">City</p>
                      <p className="font-medium">{selectedUser.city || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">State</p>
                      <p className="font-medium">{selectedUser.state || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Postal Code</p>
                      <p className="font-medium">{selectedUser.postal_code || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Country</p>
                      <p className="font-medium">{selectedUser.country || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div>
                <h3 className="font-semibold mb-2">Additional Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Member Since</p>
                    <p className="font-medium">
                      {new Date(selectedUser.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
