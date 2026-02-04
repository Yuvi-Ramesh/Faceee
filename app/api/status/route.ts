import { NextRequest, NextResponse } from 'next/server'

/**
 * Status endpoint for debugging and health checks
 * Returns information about the application status and model loading
 */
export async function GET(request: NextRequest) {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      service: 'FaceVital Health Monitor',
      status: 'healthy',
      endpoints: {
        health_metrics: '/api/health-metrics',
        mediapipe_model: '/api/mediapipe-model?model=face_landmarker',
        extract_ppg: '/api/extract-ppg',
        generate_report: '/api/generate-report',
      },
      environment: {
        node_env: process.env.NODE_ENV,
        vercel_env: process.env.VERCEL_ENV,
      },
      features: {
        face_detection: 'enabled',
        ppg_extraction: 'enabled',
        health_metrics: 'enabled',
        report_generation: 'enabled',
      },
    }

    // Try to verify model endpoint is accessible
    try {
      const modelUrl = new URL('/api/mediapipe-model', request.url)
      modelUrl.searchParams.set('model', 'face_landmarker')
      
      const modelResponse = await fetch(modelUrl.toString(), {
        method: 'HEAD',
        timeout: 5000,
      })

      status.features.model_proxy = modelResponse.ok ? 'healthy' : 'error'
    } catch (err) {
      status.features.model_proxy = 'error'
    }

    return NextResponse.json(status, { status: 200 })
  } catch (error) {
    console.error('[v0] Status check error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Status check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
