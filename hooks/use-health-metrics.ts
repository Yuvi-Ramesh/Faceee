"use client";

import { useState, useCallback } from "react";

export interface HealthMetrics {
  heart_rate: number;
  breathing_rate: number;
  hrv: number;
  stress_index: number;
  blood_pressure_sys: number;
  blood_pressure_dia: number;
  parasympathetic_activity: number;
  wellness_score: number;
}

interface PPGExtractionResult {
  ppg_value: number;
  roi_values: number[];
  status: string;
}

/**
 * Hook to calculate health metrics from PPG signal using the backend API
 */
export function useHealthMetrics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calculate metrics from PPG signal via API
   */
  const calculateMetrics = useCallback(
    async (
      ppgSignal: number[],
      fps: number = 30,
    ): Promise<HealthMetrics | null> => {
      if (!ppgSignal || ppgSignal.length === 0) {
        setError("PPG signal is required");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/health-metrics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ppg_signal: ppgSignal,
            fps,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to calculate metrics");
        }

        const metrics: HealthMetrics = await response.json();
        setLoading(false);
        return metrics;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        setLoading(false);
        return null;
      }
    },
    [],
  );

  /**
   * Extract PPG signal from frame data and landmarks
   */
  const extractPPG = useCallback(
    async (
      landmarks: Array<{ x: number; y: number; z?: number }>,
      frameData: {
        width: number;
        height: number;
        channels: number;
        data: number[];
      },
    ): Promise<PPGExtractionResult | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/extract-ppg", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            face_landmarks: landmarks,
            frame_data: frameData,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to extract PPG");
        }

        const result: PPGExtractionResult = await response.json();
        setLoading(false);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        setLoading(false);
        return null;
      }
    },
    [],
  );

  /**
   * Generate health report
   */
  const generateReport = useCallback(
    async (reportData: {
      user_name?: string;
      measurement_date: string;
      heart_rate: number;
      breathing_rate: number;
      blood_pressure_sys: number;
      blood_pressure_dia: number;
      hrv: number;
      stress_index: number;
      parasympathetic_activity: number;
      wellness_score: number;
      notes?: string;
    }): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/generate-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reportData),
        });

        if (!response.ok) {
          throw new Error("Failed to generate report");
        }

        const html = await response.text();
        setLoading(false);
        return html;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        setLoading(false);
        return null;
      }
    },
    [],
  );

  return {
    calculateMetrics,
    extractPPG,
    generateReport,
    loading,
    error,
    setError,
  };
}
