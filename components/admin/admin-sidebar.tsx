"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Store, BarChart3, BookOpen, Ticket } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Package,
  },
  {
    title: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Coupons",
    href: "/admin/coupons",
    icon: Ticket,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      if (supabase) {
        await supabase.auth.signOut()
      }
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div
      className={cn(
        "flex w-full sm:w-72 flex-col bg-gradient-to-b from-card to-card/50 border-border border-b sm:border-b-0 sm:border-r h-auto sm:h-screen transition-[width] duration-200 shadow-sm",
        collapsed && "sm:w-20",
      )}
    >
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-border/50 px-4">
        <img
          src="/images/Logo.png"
          alt="Admin Panel"
          className="h-8 w-auto"
        />
        {!collapsed && <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Admin</span>}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="ml-auto hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 text-xs text-muted-foreground hover:bg-muted transition-colors"
        >
          {collapsed ? ">" : "<"}
        </button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-5">
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  collapsed ? "justify-center" : "gap-3",
                  isActive 
                    ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-md" 
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "animate-pulse")} />
                {!collapsed && item.title}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border/50 p-4 bg-muted/20\">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className={cn(
              "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors",
              collapsed ? "justify-center" : "gap-3"
            )}
          >
            <Store className="h-5 w-5" />
            {!collapsed && "Back to Store"}
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full text-left",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && "Logout"}
          </button>
        </div>
      </div>
    </div>
  )
}
