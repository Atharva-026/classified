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

  // Approximate waist using midpoint between shoulders & hips
  const waistLeft = {
    x: (landmarks[11].x + landmarks[23].x) / 2,
    y: (landmarks[11].y + landmarks[23].y) / 2
  }

  const waistRight = {
    x: (landmarks[12].x + landmarks[24].x) / 2,
    y: (landmarks[12].y + landmarks[24].y) / 2
  }

  const shoulderWidth = getLandmarkDistance(leftShoulder, rightShoulder)
  const hipWidth      = getLandmarkDistance(leftHip, rightHip)
  const waistWidth    = getLandmarkDistance(waistLeft, waistRight)

  const shoulderHipRatio = shoulderWidth / hipWidth
  const waistHipRatio    = waistWidth / hipWidth

  // Improved classification logic using waist measurements

  // Hourglass → shoulders ≈ hips, narrow waist
  if (
    shoulderHipRatio >= 0.9 &&
    shoulderHipRatio <= 1.1 &&
    waistHipRatio < 0.75
  ) return "hourglass"

  // Inverted triangle → shoulders clearly wider
  if (shoulderHipRatio > 1.15) return "inverted triangle"

  // Pear → hips clearly wider
  if (shoulderHipRatio < 0.85) return "pear"

  // Rectangle → similar widths, no waist curve
  if (
    shoulderHipRatio >= 0.85 &&
    shoulderHipRatio <= 1.15 &&
    waistHipRatio >= 0.75
  ) return "rectangle"

  return "apple"
}