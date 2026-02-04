# FaceVital - Advanced PPG-Based Health Monitoring

A modern Next.js web application for real-time health monitoring using facial recognition and photoplethysmography (PPG) technology.

## Features

- **Real-time Face Detection**: Uses MediaPipe for accurate face mesh detection
- **PPG Signal Extraction**: Extracts photoplethysmographic signals from facial regions
- **Health Metrics Calculation**:
  - Heart Rate (bpm)
  - Breathing Rate (rpm)
  - Blood Pressure estimation (mmHg)
  - Heart Rate Variability (HRV)
  - Stress Index
  - Parasympathetic Activity
  - Overall Wellness Score
- **Live Trend Charts**: Real-time visualization of health metrics over time
- **PDF Reports**: Generate comprehensive health reports
- **Fully Client-Side**: All processing happens in the browser - no server required
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with React, Tailwind CSS, and Recharts

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Components**: React with Tailwind CSS
- **Charts**: Recharts for data visualization
- **Face Detection**: MediaPipe Face Mesh
- **Signal Processing**: Custom JavaScript implementation
- **PDF Generation**: jsPDF (client-side)
- **Styling**: Tailwind CSS with custom animations

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Yuvaramesh/FaceVital-Next.git
cd FaceVital-Next
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Usage

1. **Start Camera**: Click "Start Camera" and grant browser camera permissions
2. **Wait for Face Detection**: Position yourself with good lighting until face is detected (green badge)
3. **Begin Scan**: Click "Start Scan" and remain still for 30 seconds
4. **View Metrics**: Real-time metrics appear in the right panel
5. **Download Report**: After scan completes, click "PDF Report" to download

## How It Works

### Signal Processing Pipeline

1. **Face Detection**: MediaPipe detects facial landmarks in real-time
2. **PPG Extraction**: Green channel intensity from forehead and cheek regions
3. **Filtering**: Butterworth band-pass filtering to isolate cardiac signals
4. **FFT Analysis**: Frequency domain analysis to extract heart rate
5. **Peak Detection**: Identifies breathing and HRV patterns
6. **Metric Calculation**: Derives comprehensive health metrics

### Health Metrics

- **Heart Rate**: Extracted from PPG signal frequency (0.8-4.0 Hz range)
- **Breathing Rate**: Detected from low-frequency signal components (0.1-0.5 Hz)
- **HRV**: Root Mean Square of Successive Differences (RMSSD)
- **Blood Pressure**: Estimated using HR, HRV, and stress correlations
- **Stress Index**: Derived from HR, HRV, and breathing patterns
- **Parasympathetic Activity**: Calculated from HRV and breathing metrics
- **Wellness Score**: Composite score based on all metrics

## File Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── face-vital-monitor.tsx   # Main component
│   ├── video-feed.tsx           # Video display
│   ├── metrics-display.tsx      # Metrics cards
│   ├── trend-charts.tsx         # Chart visualization
│   └── alert-box.tsx            # Alert notifications
├── lib/
│   ├── signal-processing.ts     # Signal filtering & PPG extraction
│   ├── health-metrics.ts        # Metric calculations
│   └── pdf-generator.ts         # PDF report generation
└── public/                      # Static assets
```

## Browser Requirements

- Modern browser with:
  - WebRTC support (getUserMedia)
  - Canvas API support
  - Web Worker support (recommended)
  - HTTPS recommended (camera access)

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY .next ./
CMD ["npm", "start"]
```

## Important Notes

⚠️ **Medical Disclaimer**: This application is a health monitoring tool for general wellness purposes only. It should not be used as a substitute for professional medical diagnosis or treatment. Always consult healthcare professionals for medical advice.

### Accuracy Notes

- Accuracy depends on lighting conditions, skin tone, and camera quality
- Best results with consistent, diffuse lighting
- Keep face steady and within frame during measurement
- Results are estimates and should not be used for medical decisions

## Performance Optimizations

- Lazy-loaded MediaPipe WASM
- Efficient canvas rendering with requestAnimationFrame
- Optimized signal processing algorithms
- Client-side processing eliminates server latency
- Streaming video with hardware acceleration support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Ensure HTTPS or localhost
- Try different browser if issues persist

### Face Not Detecting
- Improve lighting conditions
- Position face more centrally
- Ensure camera has clear view of face
- Check camera quality

### Inaccurate Metrics
- Ensure consistent lighting
- Minimize facial movement
- Ensure good camera focus
- Check signal quality indicators

## Support

For issues and questions, please open an issue on GitHub or contact the development team.

## Author

Yuvaramesh - [GitHub Profile](https://github.com/Yuvaramesh)

## Acknowledgments

- MediaPipe team for face detection technology
- Next.js team for the excellent framework
- Recharts for charting library
- Open-source community contributions
