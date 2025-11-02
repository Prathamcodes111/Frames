
export type Message = {
  role: "user" | "assistant"
  content: string
  timestamp?: Date
  videoUrl?: string  // URL to generated video
  videoGenerating?: boolean  // Is video currently being generated
}