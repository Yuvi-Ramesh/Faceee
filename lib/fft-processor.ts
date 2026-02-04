"use client";

/**
 * FFT and signal processing in pure TypeScript
 * Replaces SciPy functionality for browser/Node.js environments
 */

// Simple FFT implementation (Cooley-Tukey algorithm)
export function fft(signal: number[]): Complex[] {
  const n = signal.length;

  // Base case
  if (n <= 1) {
    return signal.map((val) => ({ real: val, imag: 0 }));
  }

  // Ensure power of 2
  if (n & (n - 1)) {
    throw new Error("FFT length must be power of 2");
  }

  // Divide
  const even: number[] = [];
  const odd: number[] = [];

  for (let i = 0; i < n; i++) {
    if (i % 2 === 0) {
      even.push(signal[i]);
    } else {
      odd.push(signal[i]);
    }
  }

  // Conquer
  const fftEven = fft(even);
  const fftOdd = fft(odd);

  // Combine
  const result: Complex[] = new Array(n);

  for (let k = 0; k < n / 2; k++) {
    const angle = (-2 * Math.PI * k) / n;
    const wReal = Math.cos(angle);
    const wImag = Math.sin(angle);

    const oddReal = fftOdd[k].real;
    const oddImag = fftOdd[k].imag;

    const mulReal = wReal * oddReal - wImag * oddImag;
    const mulImag = wReal * oddImag + wImag * oddReal;

    result[k] = {
      real: fftEven[k].real + mulReal,
      imag: fftEven[k].imag + mulImag,
    };

    result[k + n / 2] = {
      real: fftEven[k].real - mulReal,
      imag: fftEven[k].imag - mulImag,
    };
  }

  return result;
}

// Get magnitude spectrum
export function getMagnitudeSpectrum(fftData: Complex[]): number[] {
  return fftData.map((c) => Math.sqrt(c.real * c.real + c.imag * c.imag));
}

// Get phase spectrum
export function getPhaseSpectrum(fftData: Complex[]): number[] {
  return fftData.map((c) => Math.atan2(c.imag, c.real));
}

// Butterworth filter coefficients (simplified for low/high pass)
export function butterworthCoefficients(
  fc: number, // cutoff frequency (normalized 0-1)
  order: number = 4,
  filterType: "low" | "high" = "low",
): { b: number[]; a: number[] } {
  // Simplified Butterworth coefficients for common orders
  // In production, use proper IIR filter design

  if (order === 4 && filterType === "low") {
    // Second-order Butterworth lowpass filter at normalized frequency
    const omega = 2 * Math.tan(Math.PI * fc);
    const a0 = 4 + 2 * Math.SQRT2 * omega + omega * omega;
    const a1 = 2 * omega * omega - 8;
    const a2 = 4 - 2 * Math.SQRT2 * omega + omega * omega;
    const b0 = omega * omega;
    const b1 = 2 * omega * omega;
    const b2 = omega * omega;

    return {
      b: [b0 / a0, b1 / a0, b2 / a0],
      a: [1, a1 / a0, a2 / a0],
    };
  }

  // Fallback simple lowpass
  return {
    b: [fc, fc],
    a: [1, -1 + 2 * fc],
  };
}

// Apply IIR filter (direct form II)
export function filterSignal(
  signal: number[],
  b: number[],
  a: number[],
): number[] {
  const filtered = new Array(signal.length).fill(0);

  for (let i = 0; i < signal.length; i++) {
    let output = 0;

    // FIR part
    for (let j = 0; j < b.length; j++) {
      if (i >= j) {
        output += b[j] * signal[i - j];
      }
    }

    // IIR part
    for (let j = 1; j < a.length; j++) {
      if (i >= j) {
        output -= a[j] * filtered[i - j];
      }
    }

    filtered[i] = output / a[0];
  }

  return filtered;
}

// Find peaks in signal
export function findPeaks(
  signal: number[],
  minDistance: number = 0,
  threshold: number = 0,
): number[] {
  const peaks: number[] = [];

  for (let i = 1; i < signal.length - 1; i++) {
    if (
      signal[i] > signal[i - 1] &&
      signal[i] > signal[i + 1] &&
      signal[i] > threshold
    ) {
      // Check minimum distance
      if (peaks.length === 0 || i - peaks[peaks.length - 1] >= minDistance) {
        peaks.push(i);
      }
    }
  }

  return peaks;
}

// Detrend signal (remove linear trend)
export function detrend(signal: number[]): number[] {
  const n = signal.length;

  // Calculate linear regression
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += signal[i];
    sumXY += i * signal[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Remove trend
  const detrended = new Array(n);
  for (let i = 0; i < n; i++) {
    detrended[i] = signal[i] - (slope * i + intercept);
  }

  return detrended;
}

// Median filter
export function medianFilter(
  signal: number[],
  kernelSize: number = 5,
): number[] {
  const filtered = new Array(signal.length);
  const padding = Math.floor(kernelSize / 2);

  for (let i = 0; i < signal.length; i++) {
    const window: number[] = [];

    for (let j = -padding; j <= padding; j++) {
      const idx = i + j;
      if (idx >= 0 && idx < signal.length) {
        window.push(signal[idx]);
      }
    }

    window.sort((a, b) => a - b);
    filtered[i] = window[Math.floor(window.length / 2)];
  }

  return filtered;
}

// Complex number type
export interface Complex {
  real: number;
  imag: number;
}

// Normalization utilities
export function normalizeSignal(signal: number[]): number[] {
  const min = Math.min(...signal);
  const max = Math.max(...signal);
  const range = max - min || 1;

  return signal.map((val) => (val - min) / range);
}

// Calculate statistics
export function calculateStats(signal: number[]): {
  mean: number;
  std: number;
  min: number;
  max: number;
} {
  const mean = signal.reduce((a, b) => a + b) / signal.length;
  const variance =
    signal.reduce((sum, val) => sum + (val - mean) ** 2, 0) / signal.length;
  const std = Math.sqrt(variance);

  return {
    mean,
    std,
    min: Math.min(...signal),
    max: Math.max(...signal),
  };
}
