import { GoogleGenAI } from "@google/genai"
import { Script } from "@/types/script"

export async function generateVideo(script: Script): Promise<Buffer> {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables")
  }

  // Combine visual descriptions and narration into a video prompt
  // Include narration so Veo generates video with proper audio/narration
  const videoPrompt = script.scenes
    .map((scene, index) => 
      `Scene ${index + 1} (${scene.duration}s):\n` +
      `Visual: ${scene.visualDescription}\n` +
      `Narration/Audio: "${scene.narration}"`
    )
    .join("\n\n")

  try {
    // Initialize Google GenAI client with API key
    // The API key might be passed in constructor or via environment variable
    const ai = new GoogleGenAI({
      apiKey: apiKey,
    })
    
    // Generate video using Veo 3.1
    console.log("Starting video generation...")
    let operation = await ai.models.generateVideos({
      model: "veo-3.1-generate-preview",
      prompt: videoPrompt,
    })

    // Poll the operation status until the video is ready
    console.log("Polling for video generation to complete...")
    while (!operation.done) {
      console.log("Waiting for video generation to complete...")
      await new Promise((resolve) => setTimeout(resolve, 10000)) // Wait 10 seconds
      
      operation = await ai.operations.getVideosOperation({
        operation: operation,
      })
    }

    console.log("Video generation complete!")

    // Download the generated video
    if (!operation.response || !operation.response.generatedVideos || !operation.response.generatedVideos[0]) {
      throw new Error("Video generation completed but no video was returned in the response")
    }

    const videoFile = operation.response.generatedVideos[0].video
    
    // Download video to a buffer instead of file system
    // Note: The files.download method might return a stream or require a file path
    // We'll need to handle this appropriately for Next.js
    const videoBuffer = await downloadVideoFile(ai, videoFile)
    
    return videoBuffer
  } catch (error) {
    console.error("Video generation error:", error)
    throw error
  }
}

async function downloadVideoFile(ai: any, videoFile: any): Promise<Buffer> {
  console.log("Video file object:", JSON.stringify(videoFile, null, 2))
  
  try {
    // Try using SDK's download method first (as per documentation)
    if (ai.files && ai.files.download) {
      console.log("Trying SDK files.download() method...")
      
      try {
        const downloadResult = await ai.files.download({
          file: videoFile,
        })
        
        console.log("Download result type:", typeof downloadResult)
        console.log("Download result constructor:", downloadResult?.constructor?.name)
        
        // Handle different return types
        if (downloadResult instanceof Buffer) {
          console.log(`Downloaded video: ${downloadResult.length} bytes`)
          return downloadResult
        } else if (downloadResult instanceof ArrayBuffer) {
          const buffer = Buffer.from(downloadResult)
          console.log(`Downloaded video: ${buffer.length} bytes`)
          return buffer
        } else if (typeof downloadResult === 'string') {
          // If it's a file path, read it
          const fs = require('fs')
          const buffer = fs.readFileSync(downloadResult)
          console.log(`Downloaded video from file: ${buffer.length} bytes`)
          return buffer
        } else if (downloadResult && typeof downloadResult.pipe === 'function') {
          // If it's a stream, convert to buffer
          const chunks: Buffer[] = []
          return new Promise((resolve, reject) => {
            downloadResult.on('data', (chunk: Buffer) => chunks.push(chunk))
            downloadResult.on('end', () => {
              const buffer = Buffer.concat(chunks)
              console.log(`Downloaded video from stream: ${buffer.length} bytes`)
              resolve(buffer)
            })
            downloadResult.on('error', reject)
          })
        } else {
          console.error("Unexpected download result:", downloadResult)
          throw new Error("Unexpected download result format")
        }
      } catch (downloadError) {
        console.error("SDK download method failed, trying URL fetch:", downloadError)
        // Fall through to URL fetch method
      }
    }
    
    // Fallback: Try fetching from URL with API key authentication
    if (videoFile.uri || videoFile.url) {
      const videoUrl = videoFile.uri || videoFile.url
      console.log(`Fetching video from URL: ${videoUrl}`)
      
      // Add API key to the URL if it's a Google API endpoint
      const apiKey = process.env.GEMINI_API_KEY
      const urlWithKey = videoUrl.includes('?') 
        ? `${videoUrl}&key=${apiKey}`
        : `${videoUrl}?key=${apiKey}`
      
      console.log(`Fetching with authenticated URL...`)
      const response = await fetch(urlWithKey, {
        headers: {
          'Accept': 'video/*',
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Fetch error (${response.status}):`, errorText)
        throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`)
      }
      
      const contentType = response.headers.get('content-type')
      const contentLength = response.headers.get('content-length')
      console.log(`Response content-type: ${contentType}`)
      console.log(`Response content-length: ${contentLength || 'unknown'}`)
      
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      console.log(`Downloaded video from URL: ${buffer.length} bytes`)
      
      // Check if the response is too small (likely an error message)
      if (buffer.length < 10000) {
        // Very small file, might be an error message or metadata
        const text = buffer.toString('utf-8').substring(0, 500)
        console.error("Received small response:", text)
        throw new Error(`Video download returned too small file (${buffer.length} bytes). Might be error or metadata. Response preview: ${text}`)
      }
      
      return buffer
    } else {
      throw new Error("Cannot download video - no URL or download method available")
    }
  } catch (error) {
    console.error("Error downloading video file:", error)
    // Try fallback - check if videoFile has a direct data URL or buffer
    if (videoFile.data) {
      if (videoFile.data instanceof Buffer) {
        return videoFile.data
      } else if (typeof videoFile.data === 'string') {
        return Buffer.from(videoFile.data, 'base64')
      }
    }
    throw error
  }
}

