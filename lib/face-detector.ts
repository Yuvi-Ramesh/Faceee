/**
 * Face Detection using MediaPipe Vision Tasks
 * Vercel-compatible face landmark detection for biomarker scanning
 */

export interface FaceLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface FaceDetectionResult {
  detected: boolean;
  landmarks: FaceLandmark[];
  boundingBox?: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  };
  confidence?: number;
}

let faceDetector: any = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

/**
 * Wait for MediaPipe Vision to be available
 */
function waitForVision(maxAttempts = 150): Promise<any> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkVision = () => {
      const vision = (window as any).VisionTasksVision;
      if (vision) {
        console.log('[v0] MediaPipe Vision library loaded successfully');
        resolve(vision);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkVision, 100);
      } else {
        reject(new Error("MediaPipe Vision Tasks library failed to load. Check your internet connection and try refreshing the page."));
      }
    };
    
    checkVision();
  });
}

/**
 * Initialize MediaPipe Face Landmarker
 */
export async function initializeFaceDetector(): Promise<void> {
  if (faceDetector) return;
  if (isInitializing && initPromise) return initPromise;

  isInitializing = true;

  initPromise = (async () => {
    try {
      console.log('[v0] Starting face detector initialization...');
      
      // Wait for MediaPipe Vision Tasks to load
      const vision = await waitForVision();
      
      if (!vision) {
        throw new Error("MediaPipe Vision Tasks library is not available");
      }

      console.log('[v0] MediaPipe Vision available, loading face landmarker model...');

      // Use local API endpoint to proxy the model
      const modelUrl = '/api/mediapipe-model?model=face_landmarker';

      // Create FaceLandmarker with fallback to CPU if GPU fails
      try {
        console.log('[v0] Attempting GPU delegate initialization...');
        faceDetector = await vision.FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: modelUrl,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceExpressions: false,
          outputHeadRotation: false,
        });
        console.log('[v0] GPU delegate initialized successfully');
      } catch (gpuError) {
        console.warn("[v0] GPU delegate failed, falling back to CPU:", gpuError);
        try {
          faceDetector = await vision.FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: modelUrl,
              delegate: "CPU",
            },
            runningMode: "VIDEO",
            numFaces: 1,
            outputFaceExpressions: false,
            outputHeadRotation: false,
          });
          console.log('[v0] CPU delegate initialized successfully');
        } catch (cpuError) {
          console.error('[v0] Both GPU and CPU delegates failed:', cpuError);
          throw new Error("Failed to initialize face landmarker with both GPU and CPU delegates");
        }
      }

      console.log("[v0] Face Landmarker fully initialized and ready");
    } catch (error) {
      console.error("[v0] Failed to initialize face detector:", error);
      isInitializing = false;
      initPromise = null;
      throw error;
    } finally {
      isInitializing = false;
    }
  })();

  return initPromise;
}

/**
 * Detect face landmarks in video frame
 */
export async function detectFaceLandmarks(
  videoElement: HTMLVideoElement,
): Promise<FaceDetectionResult> {
  if (!faceDetector) {
    await initializeFaceDetector();
  }

  if (!faceDetector) {
    return {
      detected: false,
      landmarks: [],
    };
  }

  try {
    const now = performance.now();
    const results = faceDetector.detectForVideo(videoElement, now);

    if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
      return {
        detected: false,
        landmarks: [],
      };
    }

    const landmarks = results.faceLandmarks[0].map((point: any) => ({
      x: point.x,
      y: point.y,
      z: point.z,
      visibility: point.visibility,
    }));

    return {
      detected: true,
      landmarks,
      confidence: results.faceDetections?.[0]?.categories?.[0]?.score || 0.9,
    };
  } catch (error) {
    console.error("[v0] Face detection error:", error);
    return {
      detected: false,
      landmarks: [],
    };
  }
}

/**
 * Extract PPG signal from face landmarks
 * Uses cheek and nose regions which have strong PPG signal
 */
export function extractPPGSignal(
  landmarks: FaceLandmark[],
  frame: ImageData,
): number {
  if (!landmarks || landmarks.length === 0) return 0;

  try {
    // Key facial regions for PPG extraction
    const CHEEK_LEFT = 130; // Left cheek landmark
    const CHEEK_RIGHT = 359; // Right cheek landmark
    const FOREHEAD = 9; // Forehead
    const NOSE = 1; // Nose tip

    const regions = [CHEEK_LEFT, CHEEK_RIGHT, FOREHEAD, NOSE].filter(
      (idx) => idx < landmarks.length && landmarks[idx],
    );

    if (regions.length === 0) return 0;

    let totalIntensity = 0;

    // Sample pixels around each landmark
    const data = frame.data;
    const width = frame.width;

    for (const landmarkIdx of regions) {
      const landmark = landmarks[landmarkIdx];
      if (!landmark) continue;

      const x = Math.round(landmark.x * width);
      const y = Math.round(landmark.y * frame.height);

      // Sample 5x5 region around landmark
      const sampleSize = 2;
      let regionIntensity = 0;
      let sampleCount = 0;

      for (let dy = -sampleSize; dy <= sampleSize; dy++) {
        for (let dx = -sampleSize; dx <= sampleSize; dx++) {
          const px = x + dx;
          const py = y + dy;

          if (px >= 0 && px < width && py >= 0 && py < frame.height) {
            const idx = (py * width + px) * 4;
            // Extract green channel (strongest PPG signal)
            regionIntensity += data[idx + 1];
            sampleCount++;
          }
        }
      }

      if (sampleCount > 0) {
        totalIntensity += regionIntensity / sampleCount;
      }
    }

    // Normalize to 0-1 range
    const avgIntensity = totalIntensity / Math.max(1, regions.length);
    return avgIntensity / 255;
  } catch (error) {
    console.error("[v0] PPG extraction error:", error);
    return 0;
  }
}

/**
 * Get face bounding box from landmarks
 */
export function getFaceBoundingBox(landmarks: FaceLandmark[]): {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
} {
  if (!landmarks || landmarks.length === 0) {
    return { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
  }

  let xMin = 1,
    xMax = 0;
  let yMin = 1,
    yMax = 0;

  for (const landmark of landmarks) {
    if (landmark.visibility && landmark.visibility < 0.3) continue;
    xMin = Math.min(xMin, landmark.x);
    xMax = Math.max(xMax, landmark.x);
    yMin = Math.min(yMin, landmark.y);
    yMax = Math.max(yMax, landmark.y);
  }

  return { xMin, xMax, yMin, yMax };
}

/**
 * Draw face landmarks on canvas
 */
export function drawLandmarks(
  canvas: HTMLCanvasElement,
  landmarks: FaceLandmark[],
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Clear previous drawings
  ctx.clearRect(0, 0, width, height);

  // Draw landmarks
  for (const landmark of landmarks) {
    if (landmark.visibility && landmark.visibility < 0.3) continue;

    const x = landmark.x * width;
    const y = landmark.y * height;

    ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
  }

  // Draw face outline
  const bbox = getFaceBoundingBox(landmarks);
  ctx.strokeStyle = "rgba(0, 255, 0, 0.6)";
  ctx.lineWidth = 2;
  ctx.strokeRect(
    bbox.xMin * width,
    bbox.yMin * height,
    (bbox.xMax - bbox.xMin) * width,
    (bbox.yMax - bbox.yMin) * height,
  );
}
