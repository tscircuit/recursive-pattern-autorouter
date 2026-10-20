import type { PointWithLayer, PointWithLayer2 } from "lib/types/SimpleRouteJson"
import type { ProcessedObstacle } from "./preprocessObstacles"

export interface IntersectionObstacleInfo {
  width: number
  height: number
  maxDimension: number
  perpendicularExtent: number
  obstacle: ProcessedObstacle
}

/**
 * Compute the first applicable obstacle intersected by line segment AB and return its size info
 */
export const getIntersectionObstacleSize = (
  A: PointWithLayer2,
  B: PointWithLayer2,
  obstacles: ProcessedObstacle[],
  mask: boolean[],
): IntersectionObstacleInfo | null => {
  const dx = B.x - A.x
  const dy = B.y - A.y
  const segmentLength = Math.sqrt(dx * dx + dy * dy)

  for (let i = 0; i < obstacles.length; i++) {
    if (!mask[i]) continue

    const obs = obstacles[i]

    const minX = Math.min(A.x, B.x)
    const maxX = Math.max(A.x, B.x)
    const minY = Math.min(A.y, B.y)
    const maxY = Math.max(A.y, B.y)

    if (
      maxX < obs.left ||
      minX > obs.right ||
      maxY < obs.top ||
      minY > obs.bottom
    ) {
      continue
    }

    if (segmentLength === 0) {
      return {
        width: obs.width,
        height: obs.height,
        maxDimension: Math.max(obs.width, obs.height),
        perpendicularExtent: Math.max(obs.halfWidth, obs.halfHeight),
        obstacle: obs,
      }
    }

    const normalizedDx = dx / segmentLength
    const normalizedDy = dy / segmentLength

    const perpDx = -normalizedDy
    const perpDy = normalizedDx

    const rectHalfWidth = obs.halfWidth
    const rectHalfHeight = obs.halfHeight
    const rectProjection =
      Math.abs(rectHalfWidth * perpDx) + Math.abs(rectHalfHeight * perpDy)

    const centerVecX = obs.center.x - A.x
    const centerVecY = obs.center.y - A.y
    const centerProjection = Math.abs(centerVecX * perpDx + centerVecY * perpDy)

    if (centerProjection > rectProjection) {
      continue
    }

    const rectProjectionOnLine =
      Math.abs(rectHalfWidth * normalizedDx) +
      Math.abs(rectHalfHeight * normalizedDy)
    const centerProjectionOnLine =
      centerVecX * normalizedDx + centerVecY * normalizedDy

    if (
      centerProjectionOnLine + rectProjectionOnLine < 0 ||
      centerProjectionOnLine - rectProjectionOnLine > segmentLength
    ) {
      continue
    }

    const requiredClearance = rectProjection - centerProjection
    return {
      width: obs.width,
      height: obs.height,
      maxDimension: Math.max(obs.width, obs.height),
      perpendicularExtent: Math.max(
        requiredClearance,
        Math.min(obs.halfWidth, obs.halfHeight),
      ),
      obstacle: obs,
    }
  }

  return null
}

/**
 * Filter helper to check whether a pattern's lateral excursion can overcome an intersected obstacle
 */
export const canPatternOvercomeObstacle = (
  pattern: Array<{ x: number; y: number; l: number }>,
  segmentLength: number,
  intersection: IntersectionObstacleInfo | null,
): boolean => {
  if (!intersection) return true
  const maxPatternOffset = pattern.reduce(
    (maxY, pt) => Math.max(maxY, Math.abs(pt.y) * segmentLength),
    0,
  )
  return maxPatternOffset >= intersection.perpendicularExtent
}

/**
 * Check if line segment AB intersects any applicable obstacles
 * @param {{x: number, y: number}} A Start point
 * @param {{x: number, y: number}} B End point
 * @param {Array<Object>} obstacles Preprocessed obstacles
 * @param {Array<boolean>} mask Indicates which obstacles are applicable
 * @returns {boolean} True if there's an intersection
 */
export const doesIntersect = (
  A: PointWithLayer2,
  B: PointWithLayer2,
  obstacles: ProcessedObstacle[],
  mask: boolean[],
) => {
  return getIntersectionObstacleSize(A, B, obstacles, mask) !== null
}
