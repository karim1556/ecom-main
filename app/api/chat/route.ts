import { NextResponse } from "next/server"
import { chatWithGroq, type ChatMessage } from "@/lib/groq"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages } = body as { messages: ChatMessage[] }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Missing messages" }, { status: 400 })
    }

    const assistantReply = await chatWithGroq(messages)

    return NextResponse.json({ reply: assistantReply })
  } catch (error) {
    console.error("/api/chat error", error)
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Failed to process chat request"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
