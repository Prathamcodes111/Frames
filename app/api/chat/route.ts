import { NextRequest, NextResponse } from "next/server"
import { getChatResponse } from "@/lib/gemini"
import { Message } from "@/types/chat"

export async function POST(request: NextRequest) {
  try {
    // 1. Parse the request body to get messages array
    const body = await request.json()
    const messages: Message[] = body.messages || []

    // 2. Validate that we have messages
    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      )
    }

    // 3. Ensure the last message is from the user
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 }
      )
    }

    // 4. Call Gemini API to get the chat response
    const aiResponse = await getChatResponse(messages)

    // 5. Return the AI response as JSON
    return NextResponse.json({ message: aiResponse })
  } catch (error) {
    // 6. Handle any errors gracefully
    console.error("Error in chat API:", error)
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    )
  }
}

