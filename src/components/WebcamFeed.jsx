import { useEffect, useRef, useState, useCallback } from "react"
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose"
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils"
import { classifyBodyType } from "../utils/bodyTypeClassifier"
import { extractBodyMeasurementsFromSegmentation, combineMeasurements } from "../utils/segmentationProcessor"

export default function WebcamFeed({ onBodyTypeDetected }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const poseRef = useRef(null)
  const frameRef = useRef(null)

  const [status, setStatus] = useState("Starting camera...")
  const [isLive, setIsLive] = useState(false)
  const [detected, setDetected] = useState(false)
  const [bodyType, setBodyType] = useState(null)
  const [showDebug, setShowDebug] = useState(true) // Debug visualization

  // Main pose detection callback
  const onPoseResults = useCallback(
    (results) => {
      const video = videoRef.current
      const canvas = canvasRef.current

      if (!video || !canvas) return

      const ctx = canvas.getContext("2d")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (results.poseLandmarks && results.poseLandmarks.length > 0) {
        setDetected(true)

        // Scale landmarks for visualization
        const scaledLandmarks = results.poseLandmarks.map(landmark => ({
          x: landmark.x * canvas.width,
          y: landmark.y * canvas.height,
          z: landmark.z || 0,
          visibility: landmark.visibility || 0,
        }))

        // Draw skeleton
        drawConnectors(ctx, scaledLandmarks, POSE_CONNECTIONS, {
          color: "#a855f7",
          lineWidth: 2,
        })

        // Draw joints
        drawLandmarks(ctx, scaledLandmarks, {
          color: "#f0abfc",
          radius: 4,
          lineWidth: 1,
        })

        // Get combined measurements using Pose segmentation mask
        let combinedMeasurements = null
        if (results.segmentationMask) {
          const segMeasurements = extractBodyMeasurementsFromSegmentation(
            results.segmentationMask,
            results.poseLandmarks,
            canvas.width,
            canvas.height
          )
          if (segMeasurements) {
            combinedMeasurements = combineMeasurements(results.poseLandmarks, segMeasurements)
          }
        }

        // Draw measurement lines
        drawMeasurementLines(ctx, results.poseLandmarks, canvas.width, canvas.height)

        // Classify with combined measurements or fallback to pose-only
        const detected = classifyBodyType(results.poseLandmarks, combinedMeasurements)

        if (detected) {
          onBodyTypeDetected(detected)
          setBodyType(detected)
          setStatus(`✅ ${detected.toUpperCase()}`)
        } else {
          setStatus("Adjusting position...")
        }
      } else {
        setDetected(false)
        onBodyTypeDetected(null)
        setBodyType(null)
        setStatus("Move back so full body is visible")
      }
    },
    [onBodyTypeDetected]
  )

  // Draw measurement lines with segmentation data
  const drawMeasurementLines = (ctx, landmarks, width, height) => {
    if (!landmarks[11] || !landmarks[12] || !landmarks[23] || !landmarks[24]) return

    const leftShoulder = { x: landmarks[11].x * width, y: landmarks[11].y * height }
    const rightShoulder = { x: landmarks[12].x * width, y: landmarks[12].y * height }
    const leftHip = { x: landmarks[23].x * width, y: landmarks[23].y * height }
    const rightHip = { x: landmarks[24].x * width, y: landmarks[24].y * height }

    if (!showDebug) return

    // RED: Shoulders (from segmentation)
    ctx.strokeStyle = "#ef4444"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(leftShoulder.x, leftShoulder.y)
    ctx.lineTo(rightShoulder.x, rightShoulder.y)
    ctx.stroke()

    // YELLOW: Waist (from segmentation)
    const waistLeft = {
      x: leftShoulder.x + (leftHip.x - leftShoulder.x) * 0.65,
      y: leftShoulder.y + (leftHip.y - leftShoulder.y) * 0.65,
    }
    const waistRight = {
      x: rightShoulder.x + (rightHip.x - rightShoulder.x) * 0.65,
      y: rightShoulder.y + (rightHip.y - rightShoulder.y) * 0.65,
    }
    ctx.strokeStyle = "#eab308"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(waistLeft.x, waistLeft.y)
    ctx.lineTo(waistRight.x, waistRight.y)
    ctx.stroke()

    // BLUE: Hips (from segmentation)
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(leftHip.x, leftHip.y)
    ctx.lineTo(rightHip.x, rightHip.y)
    ctx.stroke()

    // Labels
    ctx.font = "bold 12px Arial"
    ctx.fillStyle = "#ef4444"
    ctx.fillText("SHOULDERS", leftShoulder.x + 20, leftShoulder.y - 10)
    ctx.fillStyle = "#eab308"
    ctx.fillText("WAIST", waistLeft.x + 20, waistLeft.y - 10)
    ctx.fillStyle = "#3b82f6"
    ctx.fillText("HIPS", leftHip.x + 20, leftHip.y - 10)
  }

  useEffect(() => {
    // Initialize Pose with native segmentation
    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    })

    pose.setOptions({
      modelComplexity: 2,
      smoothLandmarks: true,
      enableSegmentation: true,  // ← ENABLED: Get segmentation mask from Pose
      minDetectionConfidence: 0.65,
      minTrackingConfidence: 0.65,
    })

    pose.onResults(onPoseResults)
    poseRef.current = pose

    // Start camera stream
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 720,
            height: 960,
            facingMode: "user",
          },
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()

          setIsLive(true)
          setStatus("Stand 5-6 feet away for full body scan")

          // Start detection loop
          const detect = async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
              await poseRef.current.send({ image: videoRef.current })
            }
            frameRef.current = requestAnimationFrame(detect)
          }

          detect()
        }
      } catch (error) {
        console.error(error)
        setStatus("Camera permission denied")
      }
    }

    startCamera()

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }

      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop())
      }
    }
  }, [onPoseResults])

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
      {/* Status */}
      <div className="absolute top-3 left-3 right-3 z-20">
        <div className="bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 text-xs text-gray-200 text-center">
          {status}
        </div>
      </div>

      {/* Webcam */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />

      {/* Pose Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ transform: "scaleX(-1)" }}
      />

      {/* Live Badge */}
      {isLive && (
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">LIVE</span>
        </div>
      )}

      {/* Detection Badge */}
      {detected && (
        <div className="absolute bottom-3 left-3 z-20 bg-purple-600/80 backdrop-blur-md px-3 py-1 rounded-full">
          <span className="text-xs text-white font-medium">
            Body Detected
          </span>
        </div>
      )}
    </div>
  )
}