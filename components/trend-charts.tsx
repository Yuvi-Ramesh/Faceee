'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MetricHistoryProps {
  metricHistory: {
    hrValues: number[]
    brValues: number[]
    hrvValues: number[]
    stressValues: number[]
    paraValues: number[]
    wellnessValues: number[]
  }
}

export function TrendCharts({ metricHistory }: MetricHistoryProps) {
  const maxLength = Math.max(
    metricHistory.hrValues.length,
    metricHistory.brValues.length,
    metricHistory.hrvValues.length,
    metricHistory.stressValues.length,
    metricHistory.paraValues.length,
    metricHistory.wellnessValues.length
  )

  // Prepare data for charts
  const hrChartData = metricHistory.hrValues.map((value, index) => ({
    index,
    value,
  }))

  const brHrvChartData = metricHistory.brValues.map((value, index) => ({
    index,
    br: value,
    hrv: metricHistory.hrvValues[index] || 0,
  }))

  const stressWellnessChartData = metricHistory.stressValues.map((value, index) => ({
    index,
    stress: value,
    wellness: metricHistory.wellnessValues[index] || 0,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">❤️ Heart Rate Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={hrChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="index" stroke="#666" />
            <YAxis stroke="#666" domain={[40, 150]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
              formatter={(value) => [`${value} bpm`, 'Heart Rate']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#f56565"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">🫁 Breathing Rate & HRV</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={brHrvChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="index" stroke="#666" />
            <YAxis yAxisId="left" stroke="#4299e1" />
            <YAxis yAxisId="right" orientation="right" stroke="#48bb78" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="br"
              stroke="#4299e1"
              dot={false}
              strokeWidth={2}
              name="Breathing Rate (rpm)"
              isAnimationActive={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="hrv"
              stroke="#48bb78"
              dot={false}
              strokeWidth={2}
              name="HRV (ms)"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">😰 Stress & Wellness</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={stressWellnessChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="index" stroke="#666" />
            <YAxis yAxisId="left" stroke="#ed8936" domain={[0, 1]} />
            <YAxis yAxisId="right" orientation="right" stroke="#38b2ac" domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="stress"
              stroke="#ed8936"
              dot={false}
              strokeWidth={2}
              name="Stress Index"
              isAnimationActive={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="wellness"
              stroke="#38b2ac"
              dot={false}
              strokeWidth={2}
              name="Wellness Score"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
