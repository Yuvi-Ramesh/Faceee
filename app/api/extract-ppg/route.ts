import { NextRequest, NextResponse } from 'next/server'

interface PPGRequest {
  face_landmarks: Array<{
    x: number
    y: number
    z?: number
  }>
  frame_data: {
    width: number
    height: number
    channels: number // 3 for RGB, 4 for RGBA
    data: number[] // Flattened pixel data
  }
}

interface PPGResponse {
  ppg_value: number
  roi_values: number[]
  status: string
}

/**
 * Extract PPG signal from facial regions using MediaPipe landmarks
 * Uses forehead and cheek regions for better signal extraction
 */
function extractPPGSignal(
  landmarks: Array<{ x: number; y: number; z?: number }>,
  frameData: {
    width: number
    height: number
    channels: number
    data: number[]
  },
): { ppgValue: number; roiValues: number[] } {
  const { width, height, channels, data } = frameData

  // MediaPipe face mesh landmark indices
  const foreheadIndices = [10, 151, 9]
  const leftCheekIndices = [116, 117, 118, 119, 120, 121]
  const rightCheekIndices = [345, 346, 347, 348, 349, 350]

  const roiValues: number[] = []

  for (const indices of [foreheadIndices, leftCheekIndices, rightCheekIndices]) {
    const regionPoints: Array<{ x: number; y: number }> = []

    for (const idx of indices) {
      if (idx < landmarks.length) {
        const landmark = landmarks[idx]
        regionPoints.push({
          x: Math.floor(landmark.x * width),
          y: Math.floor(landmark.y * height),
        })
      }
    }

    if (regionPoints.length > 0) {
      const roiMean = calculateROIMean(regionPoints, width, height, channels, data)
      roiValues.push(roiMean)
    }
  }

  const ppgValue = roiValues.length > 0 ? roiValues.reduce((a, b) => a + b) / roiValues.length : 0

  return { ppgValue, roiValues }
}

/**
 * Calculate mean intensity in a region of interest
 * Uses green channel (index 1) as it has better light penetration for PPG
 */
function calculateROIMean(
  points: Array<{ x: number; y: number }>,
  width: number,
  height: number,
  channels: number,
  data: number[],
): number {
  if (points.length < 2) return 0

  let sum = 0
  let count = 0

  // Find bounding box
  const minX = Math.max(0, Math.min(...points.map((p) => p.x)))
  const maxX = Math.min(width - 1, Math.max(...points.map((p) => p.x)))
  const minY = Math.max(0, Math.min(...points.map((p) => p.y)))
  const maxY = Math.min(height - 1, Math.max(...points.map((p) => p.y)))

  // Sample pixels in bounding box
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      // Check if point is in polygon (simple point-in-polygon test)
      if (isPointInPolygon({ x, y }, points)) {
        // Get green channel value (index 1 of RGB/RGBA)
        const pixelIdx = (y * width + x) * channels + 1
        if (pixelIdx < data.length) {
          sum += data[pixelIdx]
          count++
        }
      }
    }
  }

  return count > 0 ? sum / count : 0
}

/**
 * Simple point-in-polygon test using ray casting
 */
function isPointInPolygon(
  point: { x: number; y: number },
  polygon: Array<{ x: number; y: number }>,
): boolean {
  let inside = false
  let j = polygon.length - 1

  for (let i = 0; i < polygon.length; i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y

    if (
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
    ) {
      inside = !inside
    }

    j = i
  }

  return inside
}

/**
 * POST handler for PPG extraction
 */
export async function POST(request: NextRequest) {
  try {
    const body: PPGRequest = await request.json()

    const { face_landmarks, frame_data } = body

    // Validation
    if (!face_landmarks || face_landmarks.length === 0) {
      return NextResponse.json(
        { error: 'Face landmarks are required' },
        { status: 400 },
      )
    }

    if (!frame_data || !frame_data.data || frame_data.data.length === 0) {
      return NextResponse.json(
        { error: 'Frame data is required' },
        { status: 400 },
      )
    }

    // Extract PPG signal
    const { ppgValue, roiValues } = extractPPGSignal(face_landmarks, frame_data)

    const response: PPGResponse = {
      ppg_value: ppgValue,
      roi_values: roiValues,
      status: ppgValue > 0 ? 'success' : 'warning_low_signal',
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error extracting PPG signal:', error)
    return NextResponse.json(
      { error: 'Failed to extract PPG signal' },
      { status: 500 },
    )
  }
}

/**
 * GET handler for API information
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'PPG extraction API is running',
    description: 'Extract photoplethysmography (PPG) signals from facial regions',
    endpoints: {
      POST: '/api/extract-ppg',
    },
  })
}
