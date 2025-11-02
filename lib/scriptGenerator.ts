import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { HumanMessage } from "@langchain/core/messages"
import { Script } from "@/types/script"

export async function generateVideoScript(solution: string): Promise<Script> {
  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.0-flash-exp"
  })

  const prompt = `You are an expert video script writer for educational YouTube tutorials. 

Given the following solution/answer, create a structured video script that will help viewers understand it through a short, engaging tutorial video (2-3 minutes max).

The solution is:
${solution}

Create a JSON script with the following structure:
{
  "title": "Short descriptive title",
  "scenes": [
    {
      "sceneNumber": 1,
      "narration": "What the narrator should say (natural, conversational)",
      "visualDescription": "Detailed visual description of what should appear on screen (be specific about visuals, text, animations, etc.)",
      "duration": 5
    }
  ],
  "totalDuration": 0
}

Requirements:
- Break into 3-6 scenes maximum
- Each scene should be 3-8 seconds
- Narration should be clear and easy to understand
- Visual descriptions should be detailed enough for video generation AI
- Total duration should not exceed 180 seconds (3 minutes)
- Make it engaging and easy to follow

Return ONLY valid JSON, no markdown formatting, no code blocks.`

  const response = await model.invoke([new HumanMessage(prompt)])
  
  // Extract JSON from response
  const content = response.content.toString()
  
  // Try to parse JSON (handle cases where response might have extra text)
  let jsonText = content
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    jsonText = jsonMatch[0]
  }
  
  const script: Script = JSON.parse(jsonText)
  
  // Validate and calculate total duration
  script.totalDuration = script.scenes.reduce((sum, scene) => sum + scene.duration, 0)
  
  return script
}

