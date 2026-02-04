import { NextRequest, NextResponse } from 'next/server'
import {
  fft,
  getMagnitudeSpectrum,
  findPeaks,
  detrend,
  medianFilter,
  calculateStats,
  filterSignal,
  butterworthCoefficients,
} from '@/lib/fft-processor'

interface MetricsRequest {
  ppg_signal: number[]
  timestamps?: number[]
  fps?: number
}

interface MetricsResponse {
  heart_rate: number
  breathing_rate: number
  hrv: number
  stress_index: number
  blood_pressure_sys: number
  blood_pressure_dia: number
  parasympathetic_activity: number
  wellness_score: number
}

/**
 * Calculate heart rate from PPG signal using FFT
 */
function calculateHeartRate(
  signal: number[],
  fps: number = 30,
): number {
  if (signal.length < fps * 8) {
    return 0
  }

  try {
    // Detrend the signal
    const detrended = detrend(signal)

    // Find next power of 2 for FFT
    let n = 1
    while (n < detrended.length) n *= 2

    // Pad signal to power of 2
    const padded = [...detrended, ...new Array(n - detrended.length).fill(0)]

    // Apply FFT
    const fftData = fft(padded)
    const magnitude = getMagnitudeSpectrum(fftData)

    // Find peak in valid HR range (0.8-4.0 Hz = 48-240 BPM)
    const nyquist = fps / 2
    const minFreqIdx = Math.floor((0.8 / nyquist) * magnitude.length)
    const maxFreqIdx = Math.ceil((4.0 / nyquist) * magnitude.length)

    let maxIdx = minFreqIdx
    for (let i = minFreqIdx; i < Math.min(maxFreqIdx, magnitude.length); i++) {
      if (magnitude[i] > magnitude[maxIdx]) {
        maxIdx = i
      }
    }

    const hrFreq = (maxIdx / n) * fps
    const hrBpm = hrFreq * 60

    // Clamp to reasonable range
    return Math.max(50, Math.min(200, hrBpm))
  } catch (error) {
    console.error('Error calculating heart rate:', error)
    return 0
  }
}

/**
 * Calculate breathing rate from PPG signal
 */
function calculateBreathingRate(
  signal: number[],
  fps: number = 30,
): number {
  if (signal.length < fps * 12) {
    return 0
  }

  try {
    // Apply bandpass filter for breathing (0.1-0.5 Hz)
    const coeffs = butterworthCoefficients(0.3, 2, 'low')
    const filtered = filterSignal(signal, coeffs.b, coeffs.a)

    // Find peaks (breathing cycles)
    const peaks = findPeaks(
      filtered,
      Math.floor(fps * 2), // minimum distance between peaks
    )

    const breathingRate = peaks.length * (60 / (signal.length / fps))
    return Math.max(8, Math.min(35, breathingRate))
  } catch (error) {
    console.error('Error calculating breathing rate:', error)
    return 0
  }
}

/**
 * Calculate Heart Rate Variability (HRV)
 */
function calculateHRV(
  signal: number[],
  fps: number = 30,
): number {
  if (signal.length < fps * 15) {
    return 0
  }

  try {
    const filtered = medianFilter(signal, 5)
    const peaks = findPeaks(filtered, Math.floor(fps / 3))

    if (peaks.length < 5) {
      return 0
    }

    // Calculate intervals between peaks (in milliseconds)
    const intervals: number[] = []
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(((peaks[i] - peaks[i - 1]) / fps) * 1000)
    }

    // Calculate RMSSD (root mean square of successive differences)
    let sumSqDiff = 0
    for (let i = 1; i < intervals.length; i++) {
      const diff = intervals[i] - intervals[i - 1]
      sumSqDiff += diff * diff
    }

    const rmssd = Math.sqrt(sumSqDiff / (intervals.length - 1))
    return Math.min(100, Math.max(10, rmssd))
  } catch (error) {
    console.error('Error calculating HRV:', error)
    return 0
  }
}

/**
 * Estimate blood pressure based on heart rate, HRV, and stress
 */
function estimateBloodPressure(
  heartRate: number,
  hrv: number,
  stressIndex: number,
): { systolic: number; diastolic: number } {
  const baseSys = 120
  const baseDia = 80

  const hrFactor = (heartRate - 70) * 0.5
  const stressFactor = stressIndex * 10
  const hrvFactor = (50 - hrv) * 0.2

  let sysBp = baseSys + hrFactor + stressFactor + hrvFactor
  let diaBp = baseDia + hrFactor * 0.6 + stressFactor * 0.6 + hrvFactor * 0.6

  sysBp = Math.max(90, Math.min(180, sysBp))
  diaBp = Math.max(60, Math.min(120, diaBp))

  return {
    systolic: Math.round(sysBp),
    diastolic: Math.round(diaBp),
  }
}

/**
 * Calculate stress index from multiple parameters
 */
function calculateStressIndex(
  heartRate: number,
  hrv: number,
  breathingRate: number,
): number {
  const hrStress = Math.max(0, (heartRate - 70) / 50)
  const hrvStress = Math.max(0, (50 - hrv) / 50)
  const brStress = Math.max(0, (breathingRate - 15) / 15)

  const stressIndex = (hrStress + hrvStress + brStress) / 3
  return Math.min(1.0, Math.max(0.0, stressIndex))
}

/**
 * Calculate parasympathetic nervous system activity
 */
function calculateParasympatheticActivity(
  hrv: number,
  breathingRate: number,
): number {
  const hrvFactor = Math.min(1.0, hrv / 50)
  const breathingFactor = Math.max(0, (20 - breathingRate) / 10)

  const parasympathetic = ((hrvFactor + breathingFactor) / 2) * 100
  return Math.min(100, Math.max(0, parasympathetic))
}

/**
 * Calculate overall wellness score
 */
function calculateWellnessScore(
  heartRate: number,
  hrv: number,
  stressIndex: number,
  parasympathetic: number,
): number {
  const hrScore = heartRate > 0 ? 1 - Math.abs(heartRate - 70) / 50 : 0.5
  const hrvScore = Math.min(1, hrv / 50)
  const stressScore = 1 - stressIndex
  const paraScore = parasympathetic / 100

  const wellness = (hrScore + hrvScore + stressScore + paraScore) / 4 * 100
  return Math.round(Math.min(100, Math.max(0, wellness)))
}

/**
 * POST handler for calculating health metrics
 */
export async function POST(request: NextRequest) {
  try {
    const body: MetricsRequest = await request.json()

    const {
      ppg_signal,
      timestamps = [],
      fps = 30,
    } = body

    if (!ppg_signal || ppg_signal.length === 0) {
      return NextResponse.json(
        { error: 'PPG signal is required and cannot be empty' },
        { status: 400 },
      )
    }

    // Calculate all metrics
    const heartRate = calculateHeartRate(ppg_signal, fps)
    const breathingRate = calculateBreathingRate(ppg_signal, fps)
    const hrv = calculateHRV(ppg_signal, fps)
    const stressIndex = calculateStressIndex(heartRate, hrv, breathingRate)
    const { systolic, diastolic } = estimateBloodPressure(
      heartRate,
      hrv,
      stressIndex,
    )
    const parasympatheticActivity = calculateParasympatheticActivity(
      hrv,
      breathingRate,
    )
    const wellnessScore = calculateWellnessScore(
      heartRate,
      hrv,
      stressIndex,
      parasympatheticActivity,
    )

    const response: MetricsResponse = {
      heart_rate: Math.round(heartRate),
      breathing_rate: Math.round(breathingRate),
      hrv: Math.round(hrv * 100) / 100,
      stress_index: Math.round(stressIndex * 100) / 100,
      blood_pressure_sys: systolic,
      blood_pressure_dia: diastolic,
      parasympathetic_activity: Math.round(parasympatheticActivity),
      wellness_score: wellnessScore,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error processing health metrics:', error)
    return NextResponse.json(
      { error: 'Failed to calculate health metrics' },
      { status: 500 },
    )
  }
}

/**
 * GET handler for health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Health metrics API is running',
    endpoints: {
      POST: '/api/health-metrics',
    },
  })
}
