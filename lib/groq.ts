import Groq from "groq-sdk"

if (!process.env.GROQ_API_KEY) {
  console.warn("[groq] GROQ_API_KEY is not set. Chat API will not work without it.")
}

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
})

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function chatWithGroq(messages: ChatMessage[]): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured on the server.")
  }

  try {
    const response = await groqClient.chat.completions.create({
      // Model requested by user
      model: "openai/gpt-oss-120b",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: false,
    })

    const choice = response.choices?.[0]
    const content = choice?.message?.content || ""
    return content
  } catch (error: any) {
    console.error("[groq] Chat API error", error)
    const message =
      (typeof error?.message === "string" && error.message) ||
      "Groq API request failed. Please check GROQ_API_KEY and model configuration."
    throw new Error(message)
  }
}
