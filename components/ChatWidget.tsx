"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { ChatButton } from "./ChatButton"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const createInitialMessages = (): Message[] => [
  {
    id: "welcome",
    role: "assistant",
    content: "Hi there! Welcome to Ecom AI Chat. How can I help you today?",
  },
]

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(createInitialMessages)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [isOpen, messages])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    }

    const optimisticMessages = [...messages, userMessage]
    setMessages(optimisticMessages)
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: optimisticMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!response.ok) {
        let serverMessage = "Request failed"
        try {
          const errData = (await response.json()) as { error?: string }
          if (errData?.error) {
            serverMessage = errData.error
          } else if (response.statusText) {
            serverMessage = `${serverMessage} (${response.status} ${response.statusText})`
          }
        } catch {
          // ignore JSON parse errors and fall back to generic message
        }
        throw new Error(serverMessage)
      }

      const data = (await response.json()) as { reply?: string }
      const replyText = data.reply?.trim() || "Sorry, I could not generate a response right now."

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: replyText,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const friendly =
        error instanceof Error && error.message
          ? error.message
          : "There was an error talking to the AI. Please try again."
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: friendly,
      }
      setMessages((prev) => [...prev, errorMessage])
      console.error("ChatWidget error", error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-40 w-80 max-w-[90vw] rounded-xl bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between bg-orange-500 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="text-lg">💬</span>
              <span className="font-semibold">Ecom AI Chat</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xl leading-none hover:text-gray-200"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="flex-1 max-h-80 overflow-y-auto bg-gray-50 px-3 py-3 space-y-2 text-sm">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-orange-500 text-white"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-white text-gray-500 border border-gray-200 px-3 py-2 text-xs">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 bg-white px-3 py-2 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 rounded-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white disabled:opacity-60 disabled:cursor-not-allowed hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <ChatButton isOpen={isOpen} onToggle={() => setIsOpen((prev) => !prev)} />
    </>
  )
}
