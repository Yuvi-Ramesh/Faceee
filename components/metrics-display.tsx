import { HealthMetrics, getStatusColor } from "@/lib/health-metrics";

interface MetricsDisplayProps {
  metrics: HealthMetrics;
}

const metricConfig = [
  { key: "heartRate", label: "Heart Rate", unit: "bpm", icon: "❤️" },
  { key: "breathingRate", label: "Breathing Rate", unit: "rpm", icon: "💨" },
  {
    key: "bloodPressureSys",
    label: "Blood Pressure",
    unit: "mmHg",
    icon: "🩸",
  },
  { key: "hrv", label: "HRV", unit: "ms", icon: "📊" },
  { key: "stressIndex", label: "Stress Index", unit: "0-1", icon: "😰" },
  { key: "parasympathetic", label: "Parasympathetic", unit: "%", icon: "🧘" },
  { key: "wellnessScore", label: "Wellness Score", unit: "/100", icon: "⭐" },
];

export function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  const formatValue = (key: string, value: number | string) => {
    if (key === "bloodPressureSys") {
      return `${metrics.bloodPressureSys}/${metrics.bloodPressureDia}`;
    }
    if (key === "stressIndex") {
      return (value as number).toFixed(2);
    }
    return value;
  };

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Metrics</h2>

      {metricConfig.map(({ key, label, unit, icon }) => {
        const value = metrics[key as keyof HealthMetrics];
        const color = getStatusColor(key as keyof HealthMetrics, value);
        const displayValue = formatValue(key, value);

        const colorClasses = {
          green: "text-green-600 bg-green-50 border-green-200",
          orange: "text-orange-600 bg-orange-50 border-orange-200",
          red: "text-red-600 bg-red-50 border-red-200",
        };

        return (
          <div
            key={key}
            className={`p-4 rounded-lg border-2 transition ${colorClasses[color]}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-700">
                {icon} {label}
              </span>
              <span className="text-xs font-semibold opacity-70">{unit}</span>
            </div>
            <div className="text-2xl font-bold">
              {displayValue === "0" || displayValue === "0/0"
                ? "—"
                : displayValue}
            </div>
          </div>
        );
      })}
    </div>
  );
}
