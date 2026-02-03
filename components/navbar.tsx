"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { AuthChangeEvent, Session } from "@supabase/supabase-js"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { useCurrency } from "@/lib/currency-context"
import { UserIcon, ChevronDown, Heart, Menu, ShoppingCart, Settings, Package, Shield, X, Grid3x3, Cpu, Zap, Wrench } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

interface UserProfile {
  email: string
  id: string
}

export function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [shopMenuOpen, setShopMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { items } = useCart()
  const { items: wishlistItems } = useWishlist()
  const { currency, toggleCurrency } = useCurrency()
  const shopMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!shopMenuOpen) return
      const target = e.target as Node
      if (shopMenuRef.current && !shopMenuRef.current.contains(target)) {
        setShopMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [shopMenuOpen])

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createClient()
        if (!supabase) {
          setLoading(false)
          return
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          setLoading(false)
          return
        }

        if (user) {
          setUser({ email: user.email || "", id: user.id })
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
          setIsAdmin(profile?.role === "admin")
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("[v0] Get user error:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    let dataSubscription: any = null
    try {
      const supabase = createClient()
      if (supabase) {
        const { data } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
          if (session?.user) {
            setUser({ email: session.user.email || "", id: session.user.id })
            const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()
            setIsAdmin(profile?.role === "admin")
          } else {
            setUser(null)
            setIsAdmin(false)
          }
        })
        dataSubscription = data?.subscription
      }
    } catch (error) {
      console.error("[v0] Auth state listener error:", error)
    }

    return () => {
      if (dataSubscription) {
        dataSubscription.unsubscribe()
      }
    }
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      if (supabase) {
        await supabase.auth.signOut()
        setUser(null)
        setIsAdmin(false)
      }
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop", hasDropdown: true },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
    { href: "/support", label: "Support" },
    { href: "/contact", label: "Contact" },
  ]

  const shopCategories = [
    {
      title: "Electronics",
      icon: Cpu,
      description: "Components & devices",
      links: [
        { href: "/shop?category=microcontrollers", label: "Microcontrollers" },
        { href: "/shop?category=sensors", label: "Sensors" },
        { href: "/shop?category=motors", label: "Motors & Servos" },
        { href: "/shop?category=power", label: "Power Supplies" },
      ]
    },
    {
      title: "Robotics",
      icon: Grid3x3,
      description: "Robots & kits",
      links: [
        { href: "/shop?category=robotic-kits", label: "Robot Kits" },
        { href: "/shop?category=arms", label: "Robotic Arms" },
        { href: "/shop?category=drone", label: "Drones & Quadcopters" },
        { href: "/shop?category=parts", label: "Spare Parts" },
      ]
    },
    {
      title: "Tools",
      icon: Wrench,
      description: "Workshop essentials",
      links: [
        { href: "/shop?category=tools", label: "Hand Tools" },
        { href: "/shop?category=measurement", label: "Measurement" },
        { href: "/shop?category=soldering", label: "Soldering" },
        { href: "/shop?category=testing", label: "Testing Equipment" },
      ]
    },
    {
      title: "Lighting",
      icon: Zap,
      description: "LED & lighting",
      links: [
        { href: "/shop?category=led-strips", label: "LED Strips" },
        { href: "/shop?category=modules", label: "LED Modules" },
        { href: "/shop?category=controllers", label: "Controllers" },
        { href: "/shop?category=accessories", label: "Accessories" },
      ]
    },
  ]

  const userNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: UserIcon },
    { href: "/dashboard/orders", label: "Orders", icon: Package },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  const adminNavItems = [
    { href: "/admin", label: "Admin Panel", icon: Shield, isAdmin: true },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-18 lg:h-20">
          <Link href="/" className="flex items-center gap-1 sm:gap-2">
            <img
              src="/images/Logo.png"
              alt="DiscoverProjects.com"
              className="h-8 w-auto sm:h-10 md:h-11 lg:h-12"
            />
          </Link>

          {/* Desktop Navigation - Hidden on small screens */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navLinks.map((link) => (
              <div
                key={link.href}
                className="relative"
                ref={link.hasDropdown ? shopMenuRef : undefined}
                onMouseEnter={link.hasDropdown ? () => isMounted && setShopMenuOpen(true) : undefined}
                onMouseLeave={link.hasDropdown ? () => isMounted && setShopMenuOpen(false) : undefined}
              >
                {link.hasDropdown ? (
                  <div>
                    <div className="text-foreground transition text-xs sm:text-sm font-medium flex items-center gap-1 py-4">
                      <Link
                        href={link.href}
                        className="hover:text-primary"
                        onClick={() => isMounted && setShopMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                      <button
                        type="button"
                        aria-label="Toggle shop menu"
                        onClick={() => isMounted && setShopMenuOpen((v) => !v)}
                        className="p-1 hover:text-primary"
                      >
                        <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform ${shopMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Mega Menu */}
                    {isMounted && (
                      <div 
                        className={`absolute top-full left-1/2 -translate-x-1/2 w-screen max-w-4xl lg:max-w-6xl bg-background border border-border shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mt-2 ${shopMenuOpen ? '' : 'hidden'}`}
                        aria-hidden={!shopMenuOpen}
                      >
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                          {shopCategories.map((category) => {
                            const Icon = category.icon
                            return (
                              <div key={category.title} className="space-y-2 lg:space-y-4">
                                <div className="flex items-center gap-2 lg:gap-3">
                                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-foreground text-sm lg:text-base">{category.title}</h3>
                                    <p className="text-xs text-muted-foreground hidden lg:block">{category.description}</p>
                                  </div>
                                </div>
                                <ul className="space-y-1 lg:space-y-2">
                                  {category.links.map((item) => (
                                    <li key={item.href}>
                                      <Link
                                        href={item.href}
                                        className="text-xs lg:text-sm text-muted-foreground hover:text-primary transition block py-1"
                                        onClick={() => isMounted && setShopMenuOpen(false)}
                                      >
                                        {item.label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )
                          })}
                        </div>
                        
                        {/* Featured Products Section */}
                        <div className="mt-4 lg:mt-8 pt-4 lg:pt-8 border-t border-border">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <h4 className="font-semibold text-foreground text-sm lg:text-base">Featured Products</h4>
                              <p className="text-xs lg:text-sm text-muted-foreground hidden lg:block">Check out our latest arrivals</p>
                            </div>
                            <Link
                              href="/shop"
                              className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition text-center sm:text-left"
                              onClick={() => isMounted && setShopMenuOpen(false)}
                            >
                              View All Products
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className="text-foreground hover:text-primary transition text-xs sm:text-sm font-medium flex items-center gap-1 py-4"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="p-1.5 sm:p-2 lg:p-2.5">
                  {currency}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={toggleCurrency}>
                  {currency === 'INR' ? 'USD' : 'INR'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/dashboard/wishlist" className="relative p-1.5 sm:p-2 lg:p-2.5 hover:bg-muted rounded-full transition">
              <Heart
                className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 ${wishlistItems.length > 0 ? "fill-primary text-primary" : "text-foreground"}`}
              />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 lg:-top-1 lg:-right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative p-1.5 sm:p-2 lg:p-2.5 hover:bg-muted rounded-full transition">
              <ShoppingCart className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 ${items.length > 0 ? "text-primary" : "text-foreground"}`} />
              {items.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 lg:-top-1 lg:-right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {/* User Menu - Hidden on mobile, visible on tablet and up */}
            <div className="hidden md:block">
              {!loading && (
                <>
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1.5 sm:p-2 lg:p-2.5 hover:bg-muted rounded-full transition">
                        <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 sm:w-56 lg:w-64">
                        <div className="px-2 py-1.5 border-b">
                          <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {isAdmin ? "Administrator" : "User"}
                          </p>
                        </div>
                        {userNavItems.map((item) => {
                          const Icon = item.icon
                          return (
                            <DropdownMenuItem key={item.href} asChild>
                              <Link href={item.href} className="cursor-pointer flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {item.label}
                              </Link>
                            </DropdownMenuItem>
                          )
                        })}
                        {isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            {adminNavItems.map((item) => {
                              const Icon = item.icon
                              return (
                                <DropdownMenuItem key={item.href} asChild>
                                  <Link href={item.href} className="cursor-pointer text-primary font-medium flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                  </Link>
                                </DropdownMenuItem>
                              )
                            })}
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link href="/auth" className="p-1.5 sm:p-2 lg:p-2.5 hover:bg-muted rounded-full transition">
                      <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-foreground" />
                    </Link>
                  )}
                </>
              )}
            </div>

            {isMounted && (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="p-1.5 sm:p-2 lg:p-2.5">
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px] md:w-[350px] p-0">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                      <img
                        src="/images/Logo.png"
                        alt="DiscoverProjects.com"
                        className="h-8 w-auto sm:h-10"
                      />
                      <div className="text-xs text-muted-foreground">
                        {user ? (isAdmin ? "Admin" : "User") : "Guest"}
                      </div>
                    </div>

                    {/* Mobile Navigation Links */}
                    <div className="flex-1 overflow-y-auto py-3 sm:py-4">
                      <div className="flex flex-col gap-1 px-2 sm:px-3">
                        {navLinks.map((link) => (
                          <div key={link.href}>
                            {link.hasDropdown ? (
                              <div>
                                <button
                                  onClick={() => setShopMenuOpen(!shopMenuOpen)}
                                  className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 text-foreground hover:bg-muted rounded-lg transition font-medium text-sm"
                                >
                                  {link.label}
                                  <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform ${shopMenuOpen ? "rotate-180" : ""}`} />
                                </button>
                                
                                {/* Mobile Shop Categories */}
                                {shopMenuOpen && (
                                  <div className="px-3 sm:px-4 py-2 space-y-2 sm:space-y-3 bg-muted/50 rounded-lg mt-2">
                                    {shopCategories.map((category) => {
                                      const Icon = category.icon
                                      return (
                                        <div key={category.title} className="space-y-1.5 sm:space-y-2">
                                          <div className="flex items-center gap-2">
                                            <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                                            <span className="font-medium text-foreground text-xs sm:text-sm">{category.title}</span>
                                          </div>
                                          <div className="pl-5 sm:pl-6 space-y-1">
                                            {category.links.map((item) => (
                                              <Link
                                                key={item.href}
                                                href={item.href}
                                                className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition py-1"
                                                onClick={() => {
                                                  setMobileMenuOpen(false)
                                                  setShopMenuOpen(false)
                                                }}
                                              >
                                                {item.label}
                                              </Link>
                                            ))}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Link
                                href={link.href}
                                className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 text-foreground hover:bg-muted rounded-lg transition font-medium text-sm"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {link.label}
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Mobile User Section */}
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t mx-2 sm:mx-3">
                        <p className="text-xs sm:text-sm text-muted-foreground px-3 sm:px-4 mb-2">Account</p>
                        {!loading && (
                          <>
                            {user ? (
                              <div className="flex flex-col gap-1">
                                <div className="px-3 sm:px-4 py-2 border-b">
                                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">{user.email}</p>
                                  <p className="text-xs text-muted-foreground">{isAdmin ? "Administrator" : "User"}</p>
                                </div>
                                {userNavItems.map((item) => {
                                  const Icon = item.icon
                                  return (
                                    <Link
                                      key={item.href}
                                      href={item.href}
                                      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-foreground hover:bg-muted rounded-lg transition"
                                      onClick={() => setMobileMenuOpen(false)}
                                    >
                                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                      <span className="text-xs sm:text-sm">{item.label}</span>
                                    </Link>
                                  )
                                })}
                                {isAdmin && (
                                  <>
                                    <div className="border-t my-2"></div>
                                    {adminNavItems.map((item) => {
                                      const Icon = item.icon
                                      return (
                                        <Link
                                          key={item.href}
                                          href={item.href}
                                          className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-primary font-medium hover:bg-muted rounded-lg transition"
                                          onClick={() => setMobileMenuOpen(false)}
                                        >
                                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                          <span className="text-xs sm:text-sm">{item.label}</span>
                                        </Link>
                                      )
                                    })}
                                  </>
                                )}
                                <button
                                  onClick={() => {
                                    handleLogout()
                                    setMobileMenuOpen(false)
                                  }}
                                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-destructive hover:bg-muted rounded-lg transition text-left"
                                >
                                  <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                  <span className="text-xs sm:text-sm">Logout</span>
                                </button>
                              </div>
                            ) : (
                              <Link
                                href="/auth"
                                className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-foreground hover:bg-muted rounded-lg transition"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="text-xs sm:text-sm">Sign In / Sign Up</span>
                              </Link>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
