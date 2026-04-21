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

  const drawMeasurementLines = useCallback((ctx, landmarks, width, height) => {
    if (!landmarks[11] || !landmarks[12] || !landmarks[23] || !landmarks[24]) return

    const leftShoulder = { x: landmarks[11].x * width, y: landmarks[11].y * height }
    const rightShoulder = { x: landmarks[12].x * width, y: landmarks[12].y * height }
    const leftHip = { x: landmarks[23].x * width, y: landmarks[23].y * height }
    const rightHip = { x: landmarks[24].x * width, y: landmarks[24].y * height }

    ctx.strokeStyle = "#ef4444"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(leftShoulder.x, leftShoulder.y)
    ctx.lineTo(rightShoulder.x, rightShoulder.y)
    ctx.stroke()

    const waistLeft = {
      x: leftShoulder.x + (leftHip.x - leftShoulder.x) * 0.65,
      y: leftShoulder.y + (leftHip.y - leftShoulder.y) * 0.65,
    }
    const waistRight = {
      x: rightShoulder.x + (rightHip.x - rightShoulder.x) * 0.65,
      y: rightShoulder.y + (rightHip.y - rightShoulder.y) * 0.65,
    }

    ctx.strokeStyle = "#eab308"
    ctx.beginPath()
    ctx.moveTo(waistLeft.x, waistLeft.y)
    ctx.lineTo(waistRight.x, waistRight.y)
    ctx.stroke()

    const hipCenterX = (leftHip.x + rightHip.x) / 2
    const hipY = ((leftHip.y + rightHip.y) / 2) + height * 0.035
    const expandedHipWidth = Math.abs(rightHip.x - leftHip.x) * 1.88

    ctx.strokeStyle = "#3b82f6"
    ctx.beginPath()
    ctx.moveTo(hipCenterX - expandedHipWidth / 2, hipY)
    ctx.lineTo(hipCenterX + expandedHipWidth / 2, hipY)
    ctx.stroke()
  }, [])

  const onPoseResults = useCallback((results) => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext("2d")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (results.poseLandmarks?.length) {
      setDetected(true)

      const scaledLandmarks = results.poseLandmarks.map(landmark => ({
        x: landmark.x * canvas.width,
        y: landmark.y * canvas.height,
        z: landmark.z || 0,
        visibility: landmark.visibility || 0,
      }))

      drawConnectors(ctx, scaledLandmarks, POSE_CONNECTIONS, {
        color: "#a855f7",
        lineWidth: 2,
      })

      drawLandmarks(ctx, scaledLandmarks, {
        color: "#f0abfc",
        radius: 4,
        lineWidth: 1,
      })

      let combinedMeasurements = null
      if (results.segmentationMask) {
        try {
          const segMeasurements = extractBodyMeasurementsFromSegmentation(
            results.segmentationMask,
            results.poseLandmarks,
            canvas.width,
            canvas.height
          )

          if (segMeasurements.shoulderWidth > 0) {
            combinedMeasurements = combineMeasurements(results.poseLandmarks, segMeasurements, canvas.width)
          }
        } catch (error) {
          console.warn("Segmentation processing error:", error)
        }
      }

      drawMeasurementLines(ctx, results.poseLandmarks, canvas.width, canvas.height)

      const bodyType = classifyBodyType(results.poseLandmarks, combinedMeasurements)
      if (bodyType) {
        onBodyTypeDetected(bodyType)
        setStatus(`Detected: ${bodyType}`)
      } else {
        onBodyTypeDetected(null)
        setStatus("Adjusting position...")
      }
    } else {
      setDetected(false)
      onBodyTypeDetected(null)
      setStatus("Move back so full body is visible")
    }
  }, [drawMeasurementLines, onBodyTypeDetected])

  useEffect(() => {
    const videoElement = videoRef.current
    const pose = new Pose({
      locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    })

    pose.setOptions({
      modelComplexity: 2,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      minDetectionConfidence: 0.65,
      minTrackingConfidence: 0.65,
    })

    pose.onResults(onPoseResults)
    poseRef.current = pose

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

        if (!videoRef.current) return

        videoRef.current.srcObject = stream
        await videoRef.current.play()

        setIsLive(true)
        setStatus("Stand 5-6 feet away for full body scan")

        const detect = async () => {
          if (videoRef.current?.readyState === 4 && poseRef.current) {
            await poseRef.current.send({ image: videoRef.current })
          }
          frameRef.current = requestAnimationFrame(detect)
        }

        detect()
      } catch (error) {
        console.error(error)
        setStatus("Camera permission denied")
      }
    }

    startCamera()

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      if (videoElement?.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop())
      }
    }
  }, [onPoseResults])

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-4/3 bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
      <div className="absolute top-3 left-3 right-3 z-20">
        <div className="bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 text-xs text-gray-200 text-center">
          {status}
        </div>
      </div>

      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ transform: "scaleX(-1)" }}
      />

      {isLive && (
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">LIVE</span>
        </div>
      )}

      {detected && (
        <div className="absolute bottom-3 left-3 z-20 bg-purple-600/80 backdrop-blur-md px-3 py-1 rounded-full">
          <span className="text-xs text-white font-medium">Body Detected</span>
        </div>
      )}
    </div>
  )
}
