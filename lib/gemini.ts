import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { HumanMessage, AIMessage } from "@langchain/core/messages"
import { Message } from "@/types/chat"

// Initialize Gemini client
export async function getChatResponse(messages: Message[]): Promise<Message> {
  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.0-flash-exp"
  })

  // Convert your Message[] to LangChain message format
  const langchainMessages = messages.map(msg => {
    if (msg.role === "user") {
      return new HumanMessage(msg.content)
    } else {
      return new AIMessage(msg.content)
    }
  })

  // Invoke the model with the conversation history
  const response = await model.invoke(langchainMessages)

  // Extract the text content and return as Message
  return {
    role: "assistant",
    content: response.content.toString(),
    timestamp: new Date()
  }
}