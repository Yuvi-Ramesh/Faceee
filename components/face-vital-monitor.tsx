"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Download,
  Camera,
} from "lucide-react";
import {
  HealthMetrics,
  getStatusColor,
  formatMetricValue,
} from "@/lib/health-metrics";
import { useHealthMetrics } from "@/hooks/use-health-metrics";
import {
  initializeFaceDetector,
  detectFaceLandmarks,
  extractPPGSignal,
  drawLandmarks,
} from "@/lib/face-detector";
import { MetricsDisplay } from "./metrics-display";
import { TrendCharts } from "./trend-charts";
import { AlertBox } from "./alert-box";

const FPS = 30;
const MAX_PPG = 900; // 30s @ 30fps
const CALCULATION_INTERVAL = 150; // Calculate every 5 seconds

interface SessionData {
  startTime: Date | null;
  endTime: Date | null;
  measurements: HealthMetrics[];
  rawPPGData: number[];
}

export function FaceVitalMonitor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameCountRef = useRef(0);
  const lastCalcRef = useRef(0);

  const [cameraActive, setCameraActive] = useState(false);
  const [monitorActive, setMonitorActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [detectorReady, setDetectorReady] = useState(false);

  const [ppgSignal, setPpgSignal] = useState<number[]>([]);
  const [metrics, setMetrics] = useState<HealthMetrics>({
    heartRate: 0,
    breathingRate: 0,
    bloodPressureSys: 0,
    bloodPressureDia: 0,
    hrv: 0,
    stressIndex: 0,
    parasympathetic: 0,
    wellnessScore: 0,
  });

  const [metricHistory, setMetricHistory] = useState({
    hrValues: [] as number[],
    brValues: [] as number[],
    hrvValues: [] as number[],
    stressValues: [] as number[],
    paraValues: [] as number[],
    wellnessValues: [] as number[],
  });

  const [sessionData, setSessionData] = useState<SessionData>({
    startTime: null,
    endTime: null,
    measurements: [],
    rawPPGData: [],
  });

  const [alert, setAlert] = useState<{
    type: "success" | "warning" | "info" | "error";
    message: string;
  } | null>(null);

  const [progress, setProgress] = useState(0);

  // Use health metrics hook for API calls
  const { calculateMetrics, extractPPG, generateReport, loading } =
    useHealthMetrics();

  // Initialize face detector
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const init = async () => {
      try {
        if (retryCount === 0) {
          setAlert({
            type: "info",
            message: "Loading face detection model...",
          });
        } else {
          setAlert({
            type: "info",
            message: `Retrying face detector initialization (${retryCount}/${maxRetries})...`,
          });
        }
        
        console.log('[v0] Initializing face detector, attempt:', retryCount + 1);
        await initializeFaceDetector();
        setDetectorReady(true);
        setAlert({
          type: "success",
          message: "Face detector ready. Click Camera On to begin.",
        });
        console.log('[v0] Face detector initialized successfully');
      } catch (error) {
        console.error("[v0] Detector init error:", error);
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        
        retryCount++;
        
        if (retryCount < maxRetries) {
          setAlert({
            type: "warning",
            message: `Face detector loading... (Attempt ${retryCount + 1}/${maxRetries})`,
          });
          
          // Retry after 3 seconds
          setTimeout(() => {
            init();
          }, 3000);
        } else {
          setAlert({
            type: "error",
            message: `Face detector failed after ${maxRetries} attempts: ${errorMsg}. Please refresh the page or check your internet connection.`,
          });
          console.error('[v0] Face detector initialization failed after max retries');
        }
      }
    };

    init();
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!detectorReady) {
      setAlert({ type: "warning", message: "Detector still loading..." });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraActive(true);
          setAlert({
            type: "success",
            message: "Camera started. Click Start Monitor to scan.",
          });
        };
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: "Could not access camera. Check permissions.",
      });
    }
  }, [detectorReady]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    setCameraActive(false);
    setMonitorActive(false);
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (!cameraActive) {
      setAlert({ type: "warning", message: "Camera not active" });
      return;
    }

    setMonitorActive(true);
    setSessionData({
      startTime: new Date(),
      endTime: null,
      measurements: [],
      rawPPGData: [],
    });
    setPpgSignal([]);
    setAlert({
      type: "info",
      message: "Scanning biomarkers... Keep your face visible.",
    });
  }, [cameraActive]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setMonitorActive(false);
    setSessionData((prev) => ({
      ...prev,
      endTime: new Date(),
    }));
    setAlert({
      type: "success",
      message: "Scan completed. Download report or continue monitoring.",
    });
  }, []);

  // Main video processing loop
  useEffect(() => {
    if (
      !monitorActive ||
      !videoRef.current ||
      !canvasRef.current ||
      !detectorReady
    ) {
      return;
    }

    let animationId: number;

    const processFrame = async () => {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Detect face landmarks
        const result = await detectFaceLandmarks(video);

        if (result.detected && result.landmarks.length > 0) {
          setFaceDetected(true);

          // Extract PPG signal
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const ppgValue = extractPPGSignal(result.landmarks, imageData);

          // Accumulate PPG signal
          setPpgSignal((prev) => {
            const updated = [...prev, ppgValue];
            if (updated.length > MAX_PPG) {
              updated.shift();
            }
            return updated;
          });

          // Draw landmarks on overlay
          if (overlayCanvasRef.current) {
            drawLandmarks(overlayCanvasRef.current, result.landmarks);
          }

          // Calculate metrics periodically
          const now = Date.now();
          if (
            ppgSignal.length >= FPS * 8 &&
            now - lastCalcRef.current > CALCULATION_INTERVAL
          ) {
            lastCalcRef.current = now;
            frameCountRef.current++;

            // Call API to calculate metrics
            const newMetrics = await calculateMetrics(ppgSignal);

            if (newMetrics) {
              setMetrics(newMetrics);

              setMetricHistory((prev) => ({
                hrValues: [...prev.hrValues, newMetrics.heartRate].slice(-60),
                brValues: [...prev.brValues, newMetrics.breathingRate].slice(
                  -60,
                ),
                hrvValues: [...prev.hrvValues, newMetrics.hrv].slice(-60),
                stressValues: [
                  ...prev.stressValues,
                  newMetrics.stressIndex,
                ].slice(-60),
                paraValues: [
                  ...prev.paraValues,
                  newMetrics.parasympathetic,
                ].slice(-60),
                wellnessValues: [
                  ...prev.wellnessValues,
                  newMetrics.wellnessScore,
                ].slice(-60),
              }));

              setSessionData((prev) => ({
                ...prev,
                measurements: [...prev.measurements, newMetrics],
                rawPPGData: [...prev.rawPPGData, ...ppgSignal],
              }));
            }

            setProgress(Math.min(100, (frameCountRef.current * 20) % 100));
          }
        } else {
          setFaceDetected(false);
        }

        animationId = requestAnimationFrame(processFrame);
      } catch (error) {
        console.error("[v0] Frame processing error:", error);
        animationId = requestAnimationFrame(processFrame);
      }
    };

    animationId = requestAnimationFrame(processFrame);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [monitorActive, detectorReady, calculateMetrics, ppgSignal.length]);

  // Download report
  const downloadReport = useCallback(async () => {
    if (sessionData.measurements.length === 0) {
      setAlert({ type: "warning", message: "No data to generate report" });
      return;
    }

    try {
      await generateReport(sessionData.measurements, sessionData.startTime);
      setAlert({ type: "success", message: "Report downloaded successfully" });
    } catch (error) {
      setAlert({ type: "error", message: "Failed to generate report" });
    }
  }, [sessionData, generateReport]);

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">FaceVital</h1>
        <p className="text-purple-100">Advanced PPG-based Health Monitoring</p>
      </div>

      {/* Alert */}
      {alert && <AlertBox type={alert.type} message={alert.message} />}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Section */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            {/* Video Feed */}
            <div className="relative bg-black aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />

              {/* Hidden canvas for processing */}
              <canvas
                ref={canvasRef}
                className="hidden"
                width={640}
                height={480}
              />

              {/* Overlay Canvas */}
              <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 w-full h-full"
                width={640}
                height={480}
              />

              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                {faceDetected ? (
                  <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Face Detected
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                    <div className="w-2 h-2 bg-white" />
                    No Face Detected
                  </div>
                )}
              </div>

              {/* Loading State */}
              {!detectorReady && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mb-3 mx-auto" />
                    <p>Loading face detector...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="bg-gradient-to-r from-purple-700 to-purple-600 p-4">
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={startCamera}
                  disabled={cameraActive || !detectorReady}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                >
                  <Camera size={18} />
                  Camera On
                </button>

                <button
                  onClick={startMonitoring}
                  disabled={!cameraActive || monitorActive}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                >
                  <Play size={18} />
                  Start Monitor
                </button>

                <button
                  onClick={stopMonitoring}
                  disabled={!monitorActive}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                >
                  <Pause size={18} />
                  Stop
                </button>

                <button
                  onClick={stopCamera}
                  disabled={!cameraActive}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <RotateCcw size={18} />
                  Stop Camera
                </button>

                <button
                  onClick={downloadReport}
                  disabled={sessionData.measurements.length === 0 || loading}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition ml-auto"
                >
                  <Download size={18} />
                  Download Report
                </button>
              </div>

              {/* Progress */}
              {monitorActive && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-sm text-white mb-1">
                    <span>Scanning</span>
                    <span className="ml-auto">{progress}%</span>
                  </div>
                  <div className="w-full bg-purple-900 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="lg:col-span-1">
          <MetricsDisplay metrics={metrics} />
        </div>
      </div>

      {/* Charts */}
      {Object.values(metricHistory).some((arr) => arr.length > 0) && (
        <div className="mt-6">
          <TrendCharts history={metricHistory} />
        </div>
      )}
    </div>
  );
}
