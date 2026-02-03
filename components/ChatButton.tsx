"use client"

import type React from "react"

interface ChatButtonProps {
  isOpen: boolean
  onToggle: () => void
}

export const ChatButton: React.FC<ChatButtonProps> = ({ isOpen, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      <span className="text-2xl">💬</span>
    </button>
  )
}
