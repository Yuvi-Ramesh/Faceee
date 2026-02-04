"use client";

/**
 * Health Metrics Types and Utilities
 * All calculations are now performed by Next.js API routes in /app/api/
 * This module contains only types and display utilities
 */

export interface HealthMetrics {
  heartRate: number;
  breathingRate: number;
  bloodPressureSys: number;
  bloodPressureDia: number;
  hrv: number;
  stressIndex: number;
  parasympathetic: number;
  wellnessScore: number;
}

/**
 * Get status color for a metric
 */
export function getStatusColor(
  metric: string,
  value: number,
): "green" | "orange" | "red" {
  switch (metric) {
    case "heartRate":
      if (value >= 60 && value <= 100) return "green";
      if (value >= 50 && value <= 120) return "orange";
      return "red";
    case "breathingRate":
      if (value >= 12 && value <= 20) return "green";
      if (value >= 8 && value <= 25) return "orange";
      return "red";
    case "hrv":
      if (value > 40) return "green";
      if (value > 20) return "orange";
      return "red";
    case "stressIndex":
      if (value < 0.3) return "green";
      if (value < 0.7) return "orange";
      return "red";
    case "parasympathetic":
      if (value > 60) return "green";
      if (value > 30) return "orange";
      return "red";
    case "wellnessScore":
      if (value > 70) return "green";
      if (value > 40) return "orange";
      return "red";
    default:
      return "green";
  }
}

/**
 * Format metric value for display
 */
export function formatMetricValue(metric: string, value: number): string {
  switch (metric) {
    case "heartRate":
      return `${Math.round(value)} bpm`;
    case "breathingRate":
      return `${Math.round(value)} breaths/min`;
    case "bloodPressureSys":
    case "bloodPressureDia":
      return `${Math.round(value)} mmHg`;
    case "hrv":
      return `${value.toFixed(1)} ms`;
    case "stressIndex":
      return `${(value * 100).toFixed(0)}%`;
    case "parasympathetic":
    case "wellnessScore":
      return `${Math.round(value)}`;
    default:
      return value.toFixed(1);
  }
}
