import { useEffect, useRef, useState, useCallback } from "react"
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose"
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils"
import { classifyBodyType } from "../utils/bodyTypeClassifier"

export default function WebcamFeed({ onBodyTypeDetected }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const poseRef = useRef(null)
  const animFrameRef = useRef(null)
  const [status, setStatus] = useState("Starting camera...")
  const [isActive, setIsActive] = useState(false)
  const [landmarks, setLandmarks] = useState(null)

  const onResults = useCallback((results) => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext("2d")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (results.poseLandmarks) {
      // Draw skeleton connectors
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: "#a855f7",
        lineWidth: 2,
      })

      // Draw landmark dots
      drawLandmarks(ctx, results.poseLandmarks, {
        color: "#f0abfc",
        lineWidth: 1,
        radius: 4,
      })

      setLandmarks(results.poseLandmarks)

      // Classify body type
      const bodyType = classifyBodyType(results.poseLandmarks)
      if (bodyType) {
        onBodyTypeDetected(bodyType)
        setStatus(`Body type detected: ${bodyType}`)
      }
    } else {
      setStatus("Stand back so your full body is visible")
      onBodyTypeDetected(null)
    }
  }, [onBodyTypeDetected])

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    })

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    })

    pose.onResults(onResults)
    poseRef.current = pose

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setIsActive(true)
          setStatus("Analyzing your posture...")
          detectLoop()
        }
      } catch {
        setStatus("Camera access denied. Please allow camera permissions.")
      }
    }

    const detectLoop = () => {
      const detect = async () => {
        if (videoRef.current && poseRef.current &&
            videoRef.current.readyState === 4) {
          await poseRef.current.send({ image: videoRef.current })
        }
        animFrameRef.current = requestAnimationFrame(detect)
      }
      detect()
    }

    startCamera()

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop())
      }
    }
  }, [onResults])

  return (
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
      {/* Status bar */}
      <div className="absolute top-3 left-3 right-3 z-10">
        <div className="bg-black/60 backdrop-blur rounded-lg px-3 py-1.5 text-xs text-gray-300">
          {status}
        </div>
      </div>

      {/* Video — hidden, used as source for MediaPipe */}
      <video
        ref={videoRef}
        className="w-full"
        style={{ transform: "scaleX(-1)" }}
        playsInline
        muted
      />

      {/* Canvas — draws skeleton on top */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ transform: "scaleX(-1)" }}
      />

      {/* Active indicator */}
      {isActive && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 rounded-full px-2 py-1">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400">LIVE</span>
        </div>
      )}

      {/* Body type badge */}
      {landmarks && (
        <div className="absolute bottom-3 left-3 bg-purple-600/80 backdrop-blur rounded-full px-3 py-1">
          <span className="text-xs font-medium">🦴 Landmarks detected</span>
        </div>
      )}
    </div>
  )
}