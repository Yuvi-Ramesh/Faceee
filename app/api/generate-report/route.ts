import { NextRequest, NextResponse } from 'next/server'

interface ReportData {
  user_name?: string
  measurement_date: string
  heart_rate: number
  breathing_rate: number
  blood_pressure_sys: number
  blood_pressure_dia: number
  hrv: number
  stress_index: number
  parasympathetic_activity: number
  wellness_score: number
  notes?: string
}

/**
 * Generate a comprehensive health report in text/HTML format
 * For PDF generation, this can be further processed by the frontend using html2pdf or similar
 */
function generateHTMLReport(data: ReportData): string {
  const {
    user_name = 'Patient',
    measurement_date,
    heart_rate,
    breathing_rate,
    blood_pressure_sys,
    blood_pressure_dia,
    hrv,
    stress_index,
    parasympathetic_activity,
    wellness_score,
    notes,
  } = data

  // Health status indicators
  const hrStatus =
    heart_rate >= 60 && heart_rate <= 100
      ? 'Normal'
      : heart_rate < 60
        ? 'Low'
        : 'Elevated'
  const brStatus =
    breathing_rate >= 12 && breathing_rate <= 20
      ? 'Normal'
      : breathing_rate < 12
        ? 'Low'
        : 'Elevated'
  const bpStatus =
    blood_pressure_sys < 120 && blood_pressure_dia < 80
      ? 'Normal'
      : blood_pressure_sys < 130 && blood_pressure_dia < 80
        ? 'Elevated'
        : 'High'
  const stressStatus =
    stress_index < 0.3 ? 'Low' : stress_index < 0.6 ? 'Moderate' : 'High'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FaceVital Health Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            color: #333;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #0066cc;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            color: #0066cc;
            font-size: 28px;
        }
        .header p {
            margin: 10px 0 0 0;
            color: #666;
            font-size: 14px;
        }
        .patient-info {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 25px;
        }
        .patient-info p {
            margin: 8px 0;
            font-size: 14px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            border: 1px solid #e0e0e0;
            padding: 20px;
            border-radius: 8px;
            background: #fafafa;
        }
        .metric-label {
            font-size: 12px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        .metric-value {
            font-size: 28px;
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 5px;
        }
        .metric-unit {
            font-size: 12px;
            color: #666;
        }
        .metric-status {
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
            margin-top: 8px;
            font-weight: 500;
        }
        .status-normal { background: #e8f5e9; color: #2e7d32; }
        .status-elevated { background: #fff3e0; color: #e65100; }
        .status-high { background: #ffebee; color: #c62828; }
        .status-low { background: #e3f2fd; color: #1565c0; }
        .status-moderate { background: #fff3e0; color: #e65100; }
        .summary-section {
            background: #f0f7ff;
            border-left: 4px solid #0066cc;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .summary-section h3 {
            margin-top: 0;
            color: #0066cc;
            font-size: 16px;
        }
        .summary-section p {
            margin: 10px 0;
            line-height: 1.6;
            font-size: 14px;
        }
        .notes-section {
            background: #fffde7;
            border-left: 4px solid #fbc02d;
            padding: 20px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .notes-section h3 {
            margin-top: 0;
            color: #f57f17;
            font-size: 14px;
        }
        .notes-section p {
            margin: 0;
            color: #333;
            font-size: 13px;
            line-height: 1.6;
        }
        .disclaimer {
            font-size: 11px;
            color: #999;
            border-top: 1px solid #e0e0e0;
            padding-top: 15px;
            margin-top: 30px;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #999;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FaceVital Health Report</h1>
            <p>Photoplethysmography-Based Vital Sign Analysis</p>
        </div>

        <div class="patient-info">
            <p><strong>Patient Name:</strong> ${user_name}</p>
            <p><strong>Measurement Date & Time:</strong> ${measurement_date}</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Heart Rate</div>
                <div class="metric-value">${heart_rate}</div>
                <div class="metric-unit">bpm</div>
                <div class="metric-status status-${hrStatus.toLowerCase()}">${hrStatus}</div>
            </div>

            <div class="metric-card">
                <div class="metric-label">Breathing Rate</div>
                <div class="metric-value">${breathing_rate}</div>
                <div class="metric-unit">breaths/min</div>
                <div class="metric-status status-${brStatus.toLowerCase()}">${brStatus}</div>
            </div>

            <div class="metric-card">
                <div class="metric-label">Blood Pressure</div>
                <div class="metric-value">${blood_pressure_sys}/${blood_pressure_dia}</div>
                <div class="metric-unit">mmHg</div>
                <div class="metric-status status-${bpStatus.toLowerCase()}">${bpStatus}</div>
            </div>

            <div class="metric-card">
                <div class="metric-label">Heart Rate Variability</div>
                <div class="metric-value">${hrv.toFixed(1)}</div>
                <div class="metric-unit">ms</div>
            </div>

            <div class="metric-card">
                <div class="metric-label">Stress Index</div>
                <div class="metric-value">${(stress_index * 100).toFixed(0)}%</div>
                <div class="metric-unit"></div>
                <div class="metric-status status-${stressStatus.toLowerCase()}">${stressStatus}</div>
            </div>

            <div class="metric-card">
                <div class="metric-label">Parasympathetic Activity</div>
                <div class="metric-value">${parasympathetic_activity}%</div>
                <div class="metric-unit"></div>
            </div>

            <div class="metric-card">
                <div class="metric-label">Wellness Score</div>
                <div class="metric-value">${wellness_score}/100</div>
                <div class="metric-unit"></div>
            </div>
        </div>

        <div class="summary-section">
            <h3>Health Summary</h3>
            <p>
                This report presents vital sign measurements obtained through advanced photoplethysmography (PPG)
                technology using facial video analysis. The measurements were processed using signal extraction
                algorithms to calculate heart rate, breathing rate, and derived metrics including heart rate variability,
                stress index, and overall wellness score.
            </p>
            <p>
                <strong>Key Findings:</strong>
            </p>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Heart rate: ${hrStatus}</li>
                <li>Breathing rate: ${brStatus}</li>
                <li>Blood pressure: ${bpStatus}</li>
                <li>Stress level: ${stressStatus}</li>
            </ul>
        </div>

        ${notes ? `
        <div class="notes-section">
            <h3>Additional Notes</h3>
            <p>${notes}</p>
        </div>
        ` : ''}

        <div class="disclaimer">
            <strong>Disclaimer:</strong> This report is generated for informational purposes only and should not be
            used as a substitute for professional medical advice, diagnosis, or treatment. The measurements are estimates
            based on video analysis and may not be as accurate as clinical medical devices. Always consult with a qualified
            healthcare provider for medical concerns or diagnoses.
        </div>

        <div class="footer">
            <p>Generated by FaceVital on ${new Date().toLocaleString()}</p>
            <p>© 2024 FaceVital. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `.trim()
}

/**
 * POST handler for report generation
 */
export async function POST(request: NextRequest) {
  try {
    const body: ReportData = await request.json()

    // Validate required fields
    if (!body.measurement_date) {
      return NextResponse.json(
        { error: 'Measurement date is required' },
        { status: 400 },
      )
    }

    // Generate HTML report
    const htmlReport = generateHTMLReport(body)

    // Return HTML
    return new NextResponse(htmlReport, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'inline; filename="health-report.html"',
      },
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 },
    )
  }
}

/**
 * GET handler with JSON option
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const format = searchParams.get('format') || 'info'

  if (format === 'sample') {
    const sampleData: ReportData = {
      user_name: 'Sample Patient',
      measurement_date: new Date().toLocaleString(),
      heart_rate: 72,
      breathing_rate: 16,
      blood_pressure_sys: 120,
      blood_pressure_dia: 80,
      hrv: 45.5,
      stress_index: 0.35,
      parasympathetic_activity: 65,
      wellness_score: 78,
      notes: 'Sample health report for demonstration purposes.',
    }

    const htmlReport = generateHTMLReport(sampleData)

    return new NextResponse(htmlReport, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Health report generation API is running',
    endpoints: {
      POST: '/api/generate-report',
      GET: '/api/generate-report?format=sample',
    },
  })
}
