export type Script = {
  scenes: Scene[]
  totalDuration: number
  title?: string
}

export type Scene = {
  sceneNumber: number
  narration: string  // Text for ElevenLabs TTS
  visualDescription: string  // Description for Gemini Veo 2
  duration: number  // Estimated seconds
}

