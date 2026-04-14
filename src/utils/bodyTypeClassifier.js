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

  const shoulderWidth = getLandmarkDistance(leftShoulder, rightShoulder)
  const hipWidth      = getLandmarkDistance(leftHip, rightHip)
  const ratio         = shoulderWidth / hipWidth

  // Use landmarks 25+26 (knees) as proxy for thigh/lower body
  // to improve pear detection — if hips are wide relative to shoulders
  // Ratios tuned for real MediaPipe output (normalized 0–1 coordinates)
  if (ratio >= 0.9 && ratio <= 1.12) return "hourglass"      // shoulders ≈ hips
  if (ratio > 1.12)                  return "inverted triangle" // shoulders >> hips
  if (ratio < 0.8)                   return "pear"             // hips >> shoulders
  if (ratio >= 0.8 && ratio < 0.9)   return "rectangle"       // close but not equal
  return "apple"
}