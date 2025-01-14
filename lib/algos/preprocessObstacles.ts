import type { Obstacle, PointWithLayer } from "lib/types/SimpleRouteJson"

export interface ProcessedObstacle {
  center: { x: number; y: number }
  width: number
  height: number
  halfWidth: number
  halfHeight: number
  left: number
  right: number
  top: number
  bottom: number
  connectedTo: string[]
}
/**
 * Preprocess obstacles to create optimized data structure
 * @param {Array<{center: {x: number, y: number}, width: number, height: number}>} obstacles
 * @returns {Array<Object>} Processed obstacles with precomputed values
 */
export const processObstacles = (
  obstacles: Obstacle[],
): ProcessedObstacle[] => {
  return obstacles.map((obs) => ({
    center: { x: obs.center.x, y: obs.center.y },
    width: obs.width,
    height: obs.height,
    // Precompute half dimensions and bounds
    halfWidth: obs.width / 2,
    halfHeight: obs.height / 2,
    left: obs.center.x - obs.width / 2,
    right: obs.center.x + obs.width / 2,
    top: obs.center.y - obs.height / 2,
    bottom: obs.center.y + obs.height / 2,
    connectedTo: obs.connectedTo,
  }))
}
