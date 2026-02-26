/**
 * MediaPipe Pose landmark indices we care about:
 * 11 = left shoulder
 * 12 = right shoulder
 * 23 = left hip
 * 24 = right hip
 * 15 = left wrist (used to estimate waist)
 * 16 = right wrist
 */

function getLandmarkDistance(lm1, lm2) {
  return Math.sqrt(
    Math.pow(lm1.x - lm2.x, 2) +
    Math.pow(lm1.y - lm2.y, 2)
  )
}

function getVisibility(landmarks, indices) {
  return indices.every(i =>
    landmarks[i] && landmarks[i].visibility > 0.5
  )
}

export function classifyBodyType(landmarks) {
  // Check required landmarks are visible
  const required = [11, 12, 23, 24]
  if (!getVisibility(landmarks, required)) return null

  const leftShoulder  = landmarks[11]
  const rightShoulder = landmarks[12]
  const leftHip       = landmarks[23]
  const rightHip      = landmarks[24]

  // Calculate widths
  const shoulderWidth = getLandmarkDistance(leftShoulder, rightShoulder)
  const hipWidth      = getLandmarkDistance(leftHip, rightHip)

  // Estimate waist as midpoint between shoulders and hips
  const waistWidth = (shoulderWidth + hipWidth) / 2 * 0.75

  // Ratios
  const shoulderToHip  = shoulderWidth / hipWidth
  const waistToShoulder = waistWidth / shoulderWidth
  const waistToHip     = waistWidth / hipWidth

  // Classification logic
  // Hourglass: shoulders ≈ hips, narrow waist
  if (
    shoulderToHip >= 0.9 && shoulderToHip <= 1.1 &&
    waistToShoulder < 0.75
  ) return "hourglass"

  // Inverted Triangle: shoulders significantly wider than hips
  if (shoulderToHip > 1.2) return "inverted triangle"

  // Pear: hips significantly wider than shoulders
  if (shoulderToHip < 0.85) return "pear"

  // Apple: wide waist relative to both
  if (waistToShoulder > 0.85 && waistToHip > 0.85) return "apple"

  // Rectangle: everything roughly equal
  return "rectangle"
}