<<<<<<< HEAD
function getLandmarkDistance(a, b) {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) +
    Math.pow(a.y - b.y, 2)
  )
}


export function classifyBodyType(landmarks, combinedMeasurements) {
  if (!landmarks || landmarks.length < 25) return null

  let shoulderWidth, waistWidth, hipWidth

  if (combinedMeasurements) {
    shoulderWidth = combinedMeasurements.shoulderWidth
    waistWidth = combinedMeasurements.waistWidth
    hipWidth = combinedMeasurements.hipWidth
  } else {
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]

    shoulderWidth = getLandmarkDistance(leftShoulder, rightShoulder)
    hipWidth = getLandmarkDistance(leftHip, rightHip) * 1.9
    waistWidth = (shoulderWidth + hipWidth) / 2
  }

  if (!hipWidth || hipWidth === 0) return null

  const shoulderToHipRatio = shoulderWidth / hipWidth
  const waistToHipRatio = waistWidth / hipWidth

  if (
    shoulderToHipRatio >= 0.92 &&
    shoulderToHipRatio <= 1.08 &&
    waistToHipRatio < 0.75
  ) return "hourglass"

  if (shoulderToHipRatio > 1.12) return "inverted triangle"

  if (shoulderToHipRatio < 0.88) return "pear"

  if (
    shoulderToHipRatio >= 0.88 &&
    shoulderToHipRatio <= 1.12 &&
    waistToHipRatio >= 0.75
  ) return "rectangle"

  return "apple"
=======
function getLandmarkDistance(lm1, lm2) {
  return Math.sqrt(
    Math.pow(lm1.x - lm2.x, 2) +
    Math.pow(lm1.y - lm2.y, 2)
  )
}

function getVisibility(landmarks, indices) {
  return indices.every(i => landmarks[i] && landmarks[i].visibility > 0.5)
}

export function classifyBodyType(landmarks) {
  const required = [11, 12, 23, 24]
  if (!getVisibility(landmarks, required)) return null

  const leftShoulder  = landmarks[11]
  const rightShoulder = landmarks[12]
  const leftHip       = landmarks[23]
  const rightHip      = landmarks[24]

  // Extra landmarks for better accuracy
  const leftKnee  = landmarks[25]
  const rightKnee = landmarks[26]
  const leftElbow = landmarks[13]
  const rightElbow = landmarks[14]

  const shoulderWidth = getLandmarkDistance(leftShoulder, rightShoulder)
  const hipWidth      = getLandmarkDistance(leftHip, rightHip)

  // Waist estimation — midpoint between shoulders and hips
  const waistY = (leftShoulder.y + rightShoulder.y + leftHip.y + rightHip.y) / 4
  const waistX_L = (leftShoulder.x + leftHip.x) / 2
  const waistX_R = (rightShoulder.x + rightHip.x) / 2
  const waistWidth = Math.abs(waistX_R - waistX_L)

  const ratio = shoulderWidth / hipWidth

  // Normalize waist relative to shoulder width
  const waistToShoulder = waistWidth / shoulderWidth
  const waistToHip      = waistWidth / hipWidth

  // Debug log — remove after testing
  console.log(`Shoulder: ${shoulderWidth.toFixed(3)}, Hip: ${hipWidth.toFixed(3)}, Ratio: ${ratio.toFixed(3)}, Waist/Shoulder: ${waistToShoulder.toFixed(3)}`)

  // ── Recalibrated thresholds ──────────────────────────
  // MediaPipe normalized coords: shoulders appear ~20% wider
  // than hips on average for neutral standing posture
  // Actual neutral ratio is ~1.15-1.25, NOT 1.0

  // Hourglass: shoulders ≈ hips, narrow waist
  if (ratio >= 0.95 && ratio <= 1.2 && waistToShoulder < 0.75) {
    return "hourglass"
  }

  // Pear: hips clearly wider than shoulders
  if (ratio < 0.95) {
    return "pear"
  }

  // Inverted triangle: shoulders significantly wider than hips
  if (ratio > 1.45) {
    return "inverted triangle"
  }

  // Apple: wide waist relative to both shoulders and hips
  if (waistToShoulder > 0.82 && waistToHip > 0.82) {
    return "apple"
  }

  // Rectangle: shoulders and hips similar, no defined waist
  if (ratio >= 1.2 && ratio <= 1.45) {
    return "rectangle"
  }

  return "rectangle"
>>>>>>> origin/main
}