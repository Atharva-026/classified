function getLandmarkDistance(a, b) {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) +
    Math.pow(a.y - b.y, 2)
  )
}

function hasVisibleLandmarks(landmarks, indices) {
  return indices.every(index => landmarks[index] && (landmarks[index].visibility ?? 1) > 0.5)
}

export function classifyBodyType(landmarks, combinedMeasurements) {
  const required = [11, 12, 23, 24]
  if (!landmarks || landmarks.length < 25 || !hasVisibleLandmarks(landmarks, required)) {
    return null
  }

  let shoulderWidth
  let waistWidth
  let hipWidth

  if (combinedMeasurements?.hipWidth) {
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

  if (!shoulderWidth || !waistWidth || !hipWidth) return null

  const shoulderToHipRatio = shoulderWidth / hipWidth
  const waistToHipRatio = waistWidth / hipWidth

  if (
    shoulderToHipRatio >= 0.92 &&
    shoulderToHipRatio <= 1.08 &&
    waistToHipRatio < 0.75
  ) {
    return "hourglass"
  }

  if (shoulderToHipRatio > 1.12) return "inverted triangle"
  if (shoulderToHipRatio < 0.88) return "pear"

  if (
    shoulderToHipRatio >= 0.88 &&
    shoulderToHipRatio <= 1.12 &&
    waistToHipRatio >= 0.75
  ) {
    return "rectangle"
  }

  return "apple"
}
