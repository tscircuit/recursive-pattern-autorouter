import type { PointWithLayer, PointWithLayer2 } from "lib/types/SimpleRouteJson"
import type { ProcessedObstacle } from "./preprocessObstacles"

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
  // Line segment parameters
  const dx = B.x - A.x
  const dy = B.y - A.y

  for (let i = 0; i < obstacles.length; i++) {
    if (!mask[i]) continue

    const obs = obstacles[i]

    // Quick AABB test
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

    // Check intersection using Separating Axis Theorem (SAT)

    // Get the line segment vector and normalize it
    const segmentLength = Math.sqrt(dx * dx + dy * dy)
    const normalizedDx = dx / segmentLength
    const normalizedDy = dy / segmentLength

    // Calculate perpendicular vector to line segment
    const perpDx = -normalizedDy
    const perpDy = normalizedDx

    // Project rectangle corners onto perpendicular axis
    const rectHalfWidth = obs.halfWidth
    const rectHalfHeight = obs.halfHeight
    const rectProjection =
      Math.abs(rectHalfWidth * perpDx) + Math.abs(rectHalfHeight * perpDy)

    // Project vector from line start to rectangle center onto perpendicular axis
    const centerVecX = obs.center.x - A.x
    const centerVecY = obs.center.y - A.y
    const centerProjection = Math.abs(centerVecX * perpDx + centerVecY * perpDy)

    // If projections don't overlap, there's no intersection
    if (centerProjection > rectProjection) {
      continue
    }

    // Project rectangle onto line segment axis
    const rectProjectionOnLine =
      Math.abs(rectHalfWidth * normalizedDx) +
      Math.abs(rectHalfHeight * normalizedDy)
    const centerProjectionOnLine =
      centerVecX * normalizedDx + centerVecY * normalizedDy

    // Check if line segment overlaps with rectangle projection
    if (
      centerProjectionOnLine + rectProjectionOnLine < 0 ||
      centerProjectionOnLine - rectProjectionOnLine > segmentLength
    ) {
      continue
    }

    return true
  }

  return false
}
