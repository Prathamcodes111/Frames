import { NextRequest, NextResponse } from "next/server"
import { getChatResponse } from "@/lib/gemini"
import { Message } from "@/types/chat"

export async function POST(request: NextRequest) {
  // 1. Get the request body (messages array)
  // 2. Call getChatResponse
  // 3. Return the response
}