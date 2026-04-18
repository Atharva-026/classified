/**
 * Segmentation Processor
 * Uses MediaPipe segmentation mask + pose landmarks to measure real body widths from silhouette
 */

/**
 * Extract body measurements from segmentation mask using pose landmarks
 * @param {Uint8ClampedArray} mask - Segmentation mask (0 = background, 255 = foreground/person)
 * @param {Array} landmarks - Pose landmarks (33 points with normalized x, y, z, visibility)
 * @param {number} width - Frame width in pixels
 * @param {number} height - Frame height in pixels
 * @returns {Object} { shoulderWidth, waistWidth, hipWidth } in pixels
 */
export function extractBodyMeasurementsFromSegmentation(mask, landmarks, width, height) {
  if (!mask || !landmarks || landmarks.length < 25) {
    return { shoulderWidth: 0, waistWidth: 0, hipWidth: 0, hipY: 0 }
  }

  // Defensive check - if mask is invalid, skip expensive processing
  if (!(mask instanceof Uint8ClampedArray) || mask.length === 0) {
    return { shoulderWidth: 0, waistWidth: 0, hipWidth: 0, hipY: 0 }
  }

  // Get shoulder and hip Y coordinates (normalized → pixel coordinates)
  const shoulderY = Math.round(landmarks[11].y * height)
  const hipJointY = Math.round(landmarks[23].y * height)
  
  // Calculate waist row as midpoint between shoulders and hips
  const waistY = Math.round((shoulderY + hipJointY) / 2)

  // Extract widths from mask at each row
  const shoulderWidth = getWidthAtRow(mask, shoulderY, width, height)
  const waistWidth = getWidthAtRow(mask, waistY, width, height)
  
  // Get real hip width using improved measurement
  const hipResult = getRealHipWidth(mask, landmarks, width, height)
  const hipWidth = hipResult.hipWidth
  const hipY = hipResult.hipY

  return { shoulderWidth, waistWidth, hipWidth, hipY }
}

/**
 * Get the visible body width at a specific row in the segmentation mask
 * Scans horizontally to find leftmost and rightmost body pixels
 * Optimized: scans from edges inward and skips pixels for speed
 * @param {Uint8ClampedArray} mask - Segmentation mask
 * @param {number} row - Row index (Y coordinate)
 * @param {number} width - Frame width
 * @param {number} height - Frame height
 * @returns {number} Width of visible body pixels at this row
 */
function getWidthAtRow(mask, row, width, height) {
  // Clamp row to valid range
  const y = Math.max(0, Math.min(row, height - 1))

  let leftmost = null
  let rightmost = null

  // Scan from left to find leftmost body pixel
  for (let x = 0; x < width; x++) {
    const pixelIndex = (y * width + x) * 4
    if (mask[pixelIndex] > 128) {
      leftmost = x
      break
    }
  }

  // If no left pixel found, return 0
  if (leftmost === null) return 0

  // Scan from right to find rightmost body pixel
  for (let x = width - 1; x >= leftmost; x--) {
    const pixelIndex = (y * width + x) * 4
    if (mask[pixelIndex] > 128) {
      rightmost = x
      break
    }
  }

  // If no right pixel found, return 0
  if (rightmost === null) return 0

  return rightmost - leftmost
}

/**
 * Get real hip width by finding the maximum width in the hip region
 * Scans from 0% to 25% below hip joints to find the widest part of hip silhouette
 * Optimized: uses step skip and early termination
 * @param {Uint8ClampedArray} mask - Segmentation mask
 * @param {Array} landmarks - Pose landmarks
 * @param {number} width - Frame width in pixels
 * @param {number} height - Frame height in pixels
 * @returns {Object} { hipWidth: number, hipY: number } - max width and its Y coordinate
 */
function getRealHipWidth(mask, landmarks, width, height) {
  // Get hip joint Y coordinate (average of left and right hips)
  const hipJointY = ((landmarks[23].y + landmarks[24].y) / 2) * height

  // Define scan range: 0% to 20% below hip joints (reduced from 25% for speed)
  const startY = Math.round(hipJointY)
  const endY = Math.round(hipJointY + height * 0.2)
  
  // Skip every other row for faster scanning (acceptable loss of precision)
  const scanStep = 2

  let maxWidth = 0
  let bestY = hipJointY

  // Scan with step skip for better performance
  for (let y = startY; y <= endY; y += scanStep) {
    const w = getWidthAtRow(mask, y, width, height)

    if (w > maxWidth) {
      maxWidth = w
      bestY = y
    }
  }

  return { hipWidth: maxWidth, hipY: bestY }
}

/**
 * Calculate pose landmarks width using joint positions
 * @param {Array} landmarks - Pose landmarks
 * @param {string} type - 'shoulder', 'waist', or 'hip'
 * @param {number} width - Frame width
 * @returns {number} Width in pixels
 */
function getLandmarkWidth(landmarks, type, width) {
  if (type === 'shoulder') {
    // Distance between left and right shoulders (landmarks 11 and 12)
    const left = landmarks[11]?.x ?? 0
    const right = landmarks[12]?.x ?? 0
    return Math.abs(right - left) * width
  } else if (type === 'waist') {
    // For waist, estimate from lower ribs or use average of shoulder and hip
    // Landmarks 23/24 are hips, so we'll estimate waist as ~60% between shoulder and hip
    const shoulderWidth = getLandmarkWidth(landmarks, 'shoulder', width)
    const hipWidth = getLandmarkWidth(landmarks, 'hip', width)
    return (shoulderWidth + hipWidth) / 2
  } else if (type === 'hip') {
    // Distance between left and right hips (landmarks 23 and 24)
    const left = landmarks[23]?.x ?? 0
    const right = landmarks[24]?.x ?? 0
    return Math.abs(right - left) * width
  }
  return 0
}

/**
 * Combine segmentation measurements with pose landmark measurements
 * Applies weighted blending for more robust body type classification
 * @param {Array} landmarks - Pose landmarks
 * @param {Object} segMeasurements - { shoulderWidth, waistWidth, hipWidth } from segmentation
 * @param {number} frameWidth - Frame width in pixels
 * @returns {Object} Final blended measurements { shoulderWidth, waistWidth, hipWidth }
 */
export function combineMeasurements(landmarks, segMeasurements, frameWidth) {
  if (!landmarks || !segMeasurements) {
    return { shoulderWidth: 0, waistWidth: 0, hipWidth: 0 }
  }

  // Get landmark-based measurements
  const landmarkShoulderWidth = getLandmarkWidth(landmarks, 'shoulder', frameWidth)
  const landmarkWaistWidth = getLandmarkWidth(landmarks, 'waist', frameWidth)
  const landmarkHipWidth = getLandmarkWidth(landmarks, 'hip', frameWidth)

  // Blend measurements: prioritize segmentation (more accurate silhouette)
  // but use landmarks as fallback when segmentation is unreliable
  const finalShoulder =
    segMeasurements.shoulderWidth > 0
      ? segMeasurements.shoulderWidth * 0.7 + landmarkShoulderWidth * 0.3
      : landmarkShoulderWidth

  const finalWaist =
    segMeasurements.waistWidth > 0
      ? segMeasurements.waistWidth * 0.75 + landmarkWaistWidth * 0.25
      : landmarkWaistWidth

  const finalHip =
    segMeasurements.hipWidth > 0
      ? segMeasurements.hipWidth * 0.8 + landmarkHipWidth * 0.2
      : landmarkHipWidth

  return {
    shoulderWidth: finalShoulder,
    waistWidth: finalWaist,
    hipWidth: finalHip
  }
}

/**
 * Calculate body type ratio from measurements
 * @param {Object} measurements - { shoulderWidth, waistWidth, hipWidth }
 * @returns {Object} { shoulderToHipRatio, waistToHipRatio, bodyType }
 */
export function calculateBodyTypeFromMeasurements(measurements) {
  const { shoulderWidth, waistWidth, hipWidth } = measurements

  // Avoid division by zero
  if (hipWidth === 0) {
    return { shoulderToHipRatio: 0, waistToHipRatio: 0, bodyType: 'unknown' }
  }

  const shoulderToHipRatio = shoulderWidth / hipWidth
  const waistToHipRatio = waistWidth / hipWidth

  // Improved classification logic using waist measurements

  // Hourglass → shoulders ≈ hips, narrow waist
  if (
    shoulderToHipRatio >= 0.9 &&
    shoulderToHipRatio <= 1.1 &&
    waistToHipRatio < 0.75
  ) {
    return {
      shoulderToHipRatio,
      waistToHipRatio,
      bodyType: 'hourglass'
    }
  }

  // Inverted triangle → shoulders clearly wider
  if (shoulderToHipRatio > 1.15) {
    return {
      shoulderToHipRatio,
      waistToHipRatio,
      bodyType: 'inverted_triangle'
    }
  }

  // Pear → hips clearly wider
  if (shoulderToHipRatio < 0.85) {
    return {
      shoulderToHipRatio,
      waistToHipRatio,
      bodyType: 'pear'
    }
  }

  // Rectangle → similar widths, no waist curve
  if (
    shoulderToHipRatio >= 0.85 &&
    shoulderToHipRatio <= 1.15 &&
    waistToHipRatio >= 0.75
  ) {
    return {
      shoulderToHipRatio,
      waistToHipRatio,
      bodyType: 'rectangle'
    }
  }

  // Apple → default fallback
  return {
    shoulderToHipRatio,
    waistToHipRatio,
    bodyType: 'apple'
  }
}
