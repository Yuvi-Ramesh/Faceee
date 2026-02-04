'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { AlertCircle, Play, Pause, RotateCcw, Download, Camera } from 'lucide-react'
import { HealthMetrics, getStatusColor, formatMetricValue } from '@/lib/health-metrics'
import { useHealthMetrics } from '@/hooks/use-health-metrics'
import { VideoFeed } from './video-feed'
import { MetricsDisplay } from './metrics-display'
import { TrendCharts } from './trend-charts'
import { AlertBox } from './alert-box'

const FPS = 30
const MAX_PPG = 900 // 30s @ 30fps
const CALCULATION_INTERVAL = 150 // Calculate every 5 seconds

interface SessionData {
  startTime: Date | null
  endTime: Date | null
  measurements: HealthMetrics[]
  rawPPGData: number[]
}

export function FaceVitalMonitor() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [faceMesh, setFaceMesh] = useState<any>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [monitorActive, setMonitorActive] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)

  const [ppgSignal, setPpgSignal] = useState<number[]>([])
  const [metrics, setMetrics] = useState<HealthMetrics>({
    heartRate: 0,
    breathingRate: 0,
    bloodPressureSys: 0,
    bloodPressureDia: 0,
    hrv: 0,
    stressIndex: 0,
    parasympathetic: 0,
    wellnessScore: 0,
  })

  const [metricHistory, setMetricHistory] = useState({
    hrValues: [] as number[],
    brValues: [] as number[],
    hrvValues: [] as number[],
    stressValues: [] as number[],
    paraValues: [] as number[],
    wellnessValues: [] as number[],
  })

  const [sessionData, setSessionData] = useState<SessionData>({
    startTime: null,
    endTime: null,
    measurements: [],
    rawPPGData: [],
  })

  const [alert, setAlert] = useState<{
    type: 'success' | 'warning' | 'info' | 'error'
    message: string
  } | null>(null)
  const [progress, setProgress] = useState(0)
  const [calculationCount, setCalculationCount] = useState(0)

  // Use health metrics hook for API calls
  const { calculateMetrics, extractPPG, generateReport, loading } = useHealthMetrics()

  // Initialize MediaPipe
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        let attempts = 0
        while (!(window as any).FaceMesh && attempts < 30) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          attempts++
        }

        const FaceMesh = (window as any).FaceMesh
        if (!FaceMesh) {
          setAlert({
            type: 'error',
            message: 'MediaPipe failed to load. Please refresh the page.',
          })
          return
        }

        const mesh = new FaceMesh({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.10.5/${file}`,
        })

        mesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        })

        setFaceMesh(mesh)
        setAlert({ type: 'info', message: 'Ready! Click Start Camera to begin.' })
      } catch (error) {
        console.error('MediaPipe init error:', error)
        setAlert({
          type: 'error',
          message: 'Failed to initialize MediaPipe',
        })
      }
    }

    const timer = setTimeout(initMediaPipe, 500)
    return () => clearTimeout(timer)
  }, [])

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setCameraActive(true)
          setAlert({ type: 'success', message: 'Camera started. Click Monitor to begin.' })
        }
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Could not access camera',
      })
    }
  }, [])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
    }
    setCameraActive(false)
    setMonitorActive(false)
  }, [])

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (!cameraActive || !faceMesh) {
      setAlert({ type: 'warning', message: 'Start camera first' })
      return
    }

    setMonitorActive(true)
    setPpgSignal([])
    setMetricHistory({
      hrValues: [],
      brValues: [],
      hrvValues: [],
      stressValues: [],
      paraValues: [],
      wellnessValues: [],
    })
    setSessionData({
      startTime: new Date(),
      endTime: null,
      measurements: [],
      rawPPGData: [],
    })
    setCalculationCount(0)
    setAlert({
      type: 'info',
      message: 'Monitoring started. Keep your face in frame.',
    })
  }, [cameraActive, faceMesh])

  // Process video frames
  useEffect(() => {
    if (!monitorActive || !videoRef.current || !canvasRef.current || !faceMesh) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const processFrame = async () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Process with MediaPipe
        await faceMesh.send({ image: canvas })

        faceMesh.onResults((results: any) => {
          if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
            setFaceDetected(true)
            const landmarks = results.multiFaceLandmarks[0]

            // Extract PPG from frame
            const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
            if (imageData) {
              const ppgValue = extractPPGFromFrame(landmarks, imageData)
              setPpgSignal((prev) => [...prev.slice(-MAX_PPG + 1), ppgValue])
              setProgress(
                ((ppgSignal.length + 1) / Math.max(CALCULATION_INTERVAL, 1)) * 100,
              )

              // Calculate metrics every CALCULATION_INTERVAL frames
              if ((ppgSignal.length + 1) % CALCULATION_INTERVAL === 0) {
                calculateMetricsFromSignal(ppgSignal)
              }
            }
          } else {
            setFaceDetected(false)
          }
        })
      }

      if (monitorActive) {
        requestAnimationFrame(processFrame)
      }
    }

    processFrame()
  }, [monitorActive, faceMesh, ppgSignal, calculateMetrics])

  // Extract PPG from frame using green channel
  const extractPPGFromFrame = (
    landmarks: Array<{ x: number; y: number; z: number }>,
    imageData: ImageData,
  ): number => {
    const { width, height, data } = imageData

    // Use forehead region (landmarks around index 10, 151)
    const foreheadPoints = [10, 151, 9].map((idx) => ({
      x: Math.floor(landmarks[idx].x * width),
      y: Math.floor(landmarks[idx].y * height),
    }))

    let sum = 0
    let count = 0

    // Sample green channel in bounding box
    const minX = Math.max(0, Math.min(...foreheadPoints.map((p) => p.x)))
    const maxX = Math.min(width - 1, Math.max(...foreheadPoints.map((p) => p.x)))
    const minY = Math.max(0, Math.min(...foreheadPoints.map((p) => p.y)))
    const maxY = Math.min(height - 1, Math.max(...foreheadPoints.map((p) => p.y)))

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const idx = (y * width + x) * 4 + 1 // Green channel
        sum += data[idx]
        count++
      }
    }

    return count > 0 ? sum / count : 0
  }

  // Calculate metrics from PPG signal
  const calculateMetricsFromSignal = async (signal: number[]) => {
    if (signal.length < FPS * 8) return

    const newMetrics = await calculateMetrics(signal, FPS)
    if (newMetrics) {
      setMetrics({
        heartRate: newMetrics.heart_rate,
        breathingRate: newMetrics.breathing_rate,
        bloodPressureSys: newMetrics.blood_pressure_sys,
        bloodPressureDia: newMetrics.blood_pressure_dia,
        hrv: newMetrics.hrv,
        stressIndex: newMetrics.stress_index,
        parasympathetic: newMetrics.parasympathetic_activity,
        wellnessScore: newMetrics.wellness_score,
      })

      // Update history
      setMetricHistory((prev) => ({
        hrValues: [...prev.hrValues.slice(-99), newMetrics.heart_rate],
        brValues: [...prev.brValues.slice(-99), newMetrics.breathing_rate],
        hrvValues: [...prev.hrvValues.slice(-99), newMetrics.hrv],
        stressValues: [...prev.stressValues.slice(-99), newMetrics.stress_index],
        paraValues: [...prev.paraValues.slice(-99), newMetrics.parasympathetic_activity],
        wellnessValues: [...prev.wellnessValues.slice(-99), newMetrics.wellness_score],
      }))

      setCalculationCount((c) => c + 1)
      setSessionData((prev) => ({
        ...prev,
        measurements: [...prev.measurements, metrics],
        rawPPGData: signal,
      }))
    }
  }

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setMonitorActive(false)
    setSessionData((prev) => ({
      ...prev,
      endTime: new Date(),
    }))
    setAlert({
      type: 'success',
      message: `Monitoring complete. ${calculationCount} measurements recorded.`,
    })
  }, [calculationCount])

  // Download report
  const downloadReport = async () => {
    if (!sessionData.startTime) return

    const reportHtml = await generateReport({
      user_name: 'User',
      measurement_date: new Date().toLocaleString(),
      heart_rate: metrics.heartRate,
      breathing_rate: metrics.breathingRate,
      blood_pressure_sys: metrics.bloodPressureSys,
      blood_pressure_dia: metrics.bloodPressureDia,
      hrv: metrics.hrv,
      stress_index: metrics.stressIndex,
      parasympathetic_activity: metrics.parasympathetic,
      wellness_score: metrics.wellnessScore,
      notes: `Monitoring session from ${sessionData.startTime.toLocaleTimeString()} with ${calculationCount} measurements.`,
    })

    if (reportHtml) {
      const blob = new Blob([reportHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `health-report-${new Date().toISOString().split('T')[0]}.html`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Alerts */}
      {alert && (
        <AlertBox
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={startCamera}
          disabled={cameraActive}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Camera size={18} />
          {cameraActive ? 'Camera On' : 'Start Camera'}
        </button>

        <button
          onClick={startMonitoring}
          disabled={!cameraActive || monitorActive}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <Play size={18} />
          Start Monitor
        </button>

        <button
          onClick={stopMonitoring}
          disabled={!monitorActive}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          <Pause size={18} />
          Stop
        </button>

        <button
          onClick={stopCamera}
          disabled={!cameraActive}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          <RotateCcw size={18} />
          Stop Camera
        </button>

        <button
          onClick={downloadReport}
          disabled={calculationCount === 0 || loading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          <Download size={18} />
          {loading ? 'Generating...' : 'Download Report'}
        </button>
      </div>

      {/* Video Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VideoFeed
            videoRef={videoRef}
            canvasRef={canvasRef}
            faceDetected={faceDetected}
            progress={progress}
          />
        </div>

        {/* Metrics Display */}
        <div>
          <MetricsDisplay metrics={metrics} />
        </div>
      </div>

      {/* Trend Charts */}
      {metricHistory.hrValues.length > 0 && (
        <TrendCharts
          hrValues={metricHistory.hrValues}
          brValues={metricHistory.brValues}
          hrvValues={metricHistory.hrvValues}
          stressValues={metricHistory.stressValues}
          paraValues={metricHistory.paraValues}
          wellnessValues={metricHistory.wellnessValues}
        />
      )}
    </div>
  )
}
