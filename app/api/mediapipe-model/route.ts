import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy endpoint for MediaPipe model files
 * This serves the face landmarker model from Google's CDN through our domain
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const model = searchParams.get('model') || 'face_landmarker'

    // Construct the model URL based on requested model
    const modelUrl = `https://storage.googleapis.com/mediapipe-models/face_landmarker/${model}/float16/1/${model}.task`

    console.log('[v0] Fetching model from:', modelUrl)

    const response = await fetch(modelUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch model: ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()

    // Return with proper headers for caching and CORS
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('[v0] Error fetching MediaPipe model:', error)
    return NextResponse.json(
      { error: 'Failed to load MediaPipe model' },
      { status: 500 }
    )
  }
}
