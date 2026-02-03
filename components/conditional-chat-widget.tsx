"use client"

import { usePathname } from "next/navigation"
import { ChatWidget } from "./ChatWidget"

export function ConditionalChatWidget() {
  const pathname = usePathname()
  
  // Don't show ChatWidget on auth and dashboard pages
  const hiddenPaths = [
    "/auth",
    "/admin",
    "/dashboard",
    "/checkout"
  ]
  
  const shouldHide = hiddenPaths.some(path => pathname.startsWith(path))
  
  if (shouldHide) {
    return null
  }
  
  return <ChatWidget />
}
