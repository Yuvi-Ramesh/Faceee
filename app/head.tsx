export default function Head() {
  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      <meta name="description" content="Advanced PPG-based health monitoring using face detection" />
      <meta name="theme-color" content="#667eea" />
      
      {/* MediaPipe Scripts - Loaded async to prevent blocking */}
      <script
        async
        src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.10.5/drawing_utils.js"
        crossOrigin="anonymous"
      ></script>
      <script
        async
        src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.10.5/face_mesh.js"
        crossOrigin="anonymous"
      ></script>

      {/* jsPDF for PDF report generation */}
      <script
        async
        src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        crossOrigin="anonymous"
      ></script>
    </>
  )
}
