import { useEffect } from 'react'

interface VideoFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  faceDetected: boolean
  isActive: boolean
}

export function VideoFeed({
  videoRef,
  canvasRef,
  faceDetected,
  isActive,
}: VideoFeedProps) {
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Set up canvas drawing
      ctx.strokeStyle = '#00ff00'
      ctx.lineWidth = 2
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [videoRef, canvasRef])

  return (
    <div className="bg-black rounded-2xl overflow-hidden shadow-lg relative">
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* Status Badge */}
        <div
          className={`absolute top-4 left-4 px-4 py-2 rounded-full font-semibold flex items-center gap-2 z-10 ${
            faceDetected
              ? 'bg-green-500 text-white'
              : 'bg-black/75 text-white'
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full blink-animation ${
              faceDetected ? 'bg-white' : 'bg-red-500'
            }`}
          />
          <span>{faceDetected ? 'Face Detected' : 'No Face Detected'}</span>
        </div>

        {/* Recording Indicator */}
        {isActive && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
            <div className="w-2 h-2 bg-white rounded-full blink-animation" />
            Recording
          </div>
        )}
      </div>
    </div>
  )
}
