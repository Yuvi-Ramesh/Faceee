import { HealthMetrics } from './health-metrics'

interface SessionData {
  startTime: Date | null
  endTime: Date | null
  measurements: HealthMetrics[]
  rawPPGData: number[]
  timestamps: number[]
}

/**
 * Generate a comprehensive PDF report
 * Uses client-side jsPDF library for in-browser generation
 */
export function generatePDFReport(
  sessionData: SessionData,
  currentMetrics: HealthMetrics,
  metricHistory: {
    hrValues: number[]
    brValues: number[]
    hrvValues: number[]
    stressValues: number[]
    paraValues: number[]
    wellnessValues: number[]
  }
) {
  // Dynamically load jsPDF
  const scriptPromise = new Promise<void>((resolve, reject) => {
    if ((window as any).jspdf) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load jsPDF'))
    document.head.appendChild(script)
  })

  scriptPromise.then(() => {
    const { jsPDF } = (window as any)
    const doc = new jsPDF()

    const pageHeight = doc.internal.pageSize.height
    const pageWidth = doc.internal.pageSize.width
    let yPosition = 20

    // Header
    doc.setFillColor(102, 126, 234)
    doc.rect(0, 0, pageWidth, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.text('FaceVital Health Report', pageWidth / 2, 25, { align: 'center' })

    yPosition = 55

    // Session Information
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.text('Session Information', 20, yPosition)
    yPosition += 10

    doc.setFontSize(11)
    const sessionInfo = [
      ['Start Time', formatDate(sessionData.startTime)],
      ['End Time', formatDate(sessionData.endTime)],
      ['Duration', `${Math.round((sessionData.timestamps.length || 0) / 30)} seconds`],
      ['Frames Captured', sessionData.rawPPGData.length.toString()],
      ['Measurements', sessionData.measurements.length.toString()],
    ]

    sessionInfo.forEach(([label, value]) => {
      doc.text(`${label}:`, 30, yPosition)
      doc.text(value, 100, yPosition)
      yPosition += 8
    })

    yPosition += 5

    // Check if we need a new page
    if (yPosition > pageHeight - 50) {
      doc.addPage()
      yPosition = 20
    }

    // Current Metrics
    doc.setFontSize(14)
    doc.text('Current Metrics', 20, yPosition)
    yPosition += 10

    doc.setFontSize(11)
    const metricsData = [
      ['Heart Rate', `${currentMetrics.heartRate} bpm`],
      ['Breathing Rate', `${currentMetrics.breathingRate} rpm`],
      ['Blood Pressure', `${currentMetrics.bloodPressureSys}/${currentMetrics.bloodPressureDia} mmHg`],
      ['HRV', `${currentMetrics.hrv} ms`],
      ['Stress Index', currentMetrics.stressIndex.toFixed(2)],
      ['Parasympathetic Activity', `${currentMetrics.parasympathetic}%`],
      ['Wellness Score', `${currentMetrics.wellnessScore}/100`],
    ]

    metricsData.forEach(([label, value]) => {
      doc.text(`${label}:`, 30, yPosition)
      doc.text(value, 100, yPosition)
      yPosition += 8

      if (yPosition > pageHeight - 20) {
        doc.addPage()
        yPosition = 20
      }
    })

    yPosition += 5

    // Summary Statistics
    if (metricHistory.hrValues.length > 0) {
      if (yPosition > pageHeight - 50) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(14)
      doc.text('Summary Statistics', 20, yPosition)
      yPosition += 10

      doc.setFontSize(11)
      const stats = [
        ['Average Heart Rate', `${(metricHistory.hrValues.reduce((a, b) => a + b, 0) / metricHistory.hrValues.length).toFixed(1)} bpm`],
        ['Min Heart Rate', `${Math.min(...metricHistory.hrValues)} bpm`],
        ['Max Heart Rate', `${Math.max(...metricHistory.hrValues)} bpm`],
        ['Average Stress Index', `${(metricHistory.stressValues.reduce((a, b) => a + b, 0) / metricHistory.stressValues.length).toFixed(2)}`],
        ['Average Wellness Score', `${(metricHistory.wellnessValues.reduce((a, b) => a + b, 0) / metricHistory.wellnessValues.length).toFixed(0)}/100`],
      ]

      stats.forEach(([label, value]) => {
        doc.text(`${label}:`, 30, yPosition)
        doc.text(value, 100, yPosition)
        yPosition += 8
      })
    }

    yPosition += 10

    // Recommendations
    if (yPosition > pageHeight - 50) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(14)
    doc.text('Health Recommendations', 20, yPosition)
    yPosition += 10

    doc.setFontSize(11)
    const recommendations = getRecommendations(currentMetrics)
    const maxWidth = pageWidth - 40

    recommendations.forEach((rec) => {
      const wrappedText = doc.splitTextToSize(`• ${rec}`, maxWidth - 20)
      wrappedText.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage()
          yPosition = 20
        }
        doc.text(line, 30, yPosition)
        yPosition += 6
      })
      yPosition += 2
    })

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Generated on ${new Date().toLocaleString()} | FaceVital v1.0`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )

    // Save PDF
    doc.save('FaceVital_Health_Report.pdf')
  })
}

function formatDate(date: Date | null): string {
  if (!date) return 'N/A'
  return date.toLocaleString()
}

function getRecommendations(metrics: HealthMetrics): string[] {
  const recommendations: string[] = []

  if (metrics.heartRate > 100) {
    recommendations.push('Your heart rate is elevated. Consider relaxation techniques or consult a healthcare provider.')
  } else if (metrics.heartRate < 60 && metrics.heartRate > 0) {
    recommendations.push('Your heart rate is low. Ensure you are adequately hydrated and well-rested.')
  }

  if (metrics.stressIndex > 0.6) {
    recommendations.push('Your stress levels appear high. Consider deep breathing exercises or meditation.')
  }

  if (metrics.parasympathetic < 40) {
    recommendations.push('Your parasympathetic activity is low. Try relaxation techniques to activate your rest-and-digest response.')
  }

  if (metrics.wellnessScore < 50) {
    recommendations.push('Your overall wellness score is below average. Consider lifestyle adjustments including exercise and sleep.')
  }

  if (metrics.bloodPressureSys > 130) {
    recommendations.push('Your systolic blood pressure is elevated. Monitor regularly and consult a healthcare provider if it remains high.')
  }

  if (recommendations.length === 0) {
    recommendations.push('Your health metrics appear to be within normal ranges. Continue maintaining a healthy lifestyle.')
    recommendations.push('This is a screening tool and not a medical device. Always consult healthcare professionals for medical advice.')
  }

  return recommendations
}
