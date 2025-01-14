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

  // Normalized direction vector
  const len = Math.sqrt(dx * dx + dy * dy)
  const dirX = dx / len
  const dirY = dy / len

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

    // Check intersection using closest point on line segment approach
    const t = Math.max(
      0,
      Math.min(
        1,
        ((obs.center.x - A.x) * dx + (obs.center.y - A.y) * dy) /
          (dx * dx + dy * dy),
      ),
    )

    const closestX = A.x + t * dx
    const closestY = A.y + t * dy

    // Find distance from closest point to rectangle center
    const distX = Math.abs(closestX - obs.center.x)
    const distY = Math.abs(closestY - obs.center.y)

    // Check if closest point is within rectangle bounds
    if (distX <= obs.halfWidth && distY <= obs.halfHeight) {
      return true
    }
  }

  return false
}
