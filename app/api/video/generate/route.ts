import { NextRequest, NextResponse } from "next/server"
import { generateVideoScript } from "@/lib/scriptGenerator"
import { generateVideo } from "@/lib/videoGenerator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { solution } = body

    if (!solution || typeof solution !== 'string') {
      return NextResponse.json(
        { error: "Solution text is required" },
        { status: 400 }
      )
    }

    // Step 1: Generate script
    console.log("Step 1: Generating video script...")
    const script = await generateVideoScript(solution)
    console.log(`Script generated with ${script.scenes.length} scenes`)
    
    // Step 2: Generate video with Veo (includes built-in audio/narration)
    console.log("Step 2: Generating video with Veo (includes audio)...")
    let videoBuffer: Buffer
    try {
      videoBuffer = await generateVideo(script)
      console.log(`Video generated: ${videoBuffer.length} bytes`)
    } catch (error) {
      console.error("Video generation error:", error)
      throw error
    }
    
    // Video is ready with built-in audio from Veo
    // For MVP, we return the video as base64 (later: upload to S3)
    const videoBase64 = videoBuffer.length > 0 
      ? `data:video/mp4;base64,${videoBuffer.toString('base64')}`
      : null

    return NextResponse.json({
      script,
      videoGenerated: videoBuffer.length > 0,
      videoSize: videoBuffer.length,
      videoUrl: videoBase64, // Temporary base64 URL for testing
      message: videoBuffer.length > 0 
        ? "Video generated successfully with built-in audio!"
        : "Video generation failed."
    })
  } catch (error) {
    console.error("Error in video generation:", error)
    return NextResponse.json(
      { error: "Failed to generate video", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

