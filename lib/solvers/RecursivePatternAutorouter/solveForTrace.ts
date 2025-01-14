import { doesIntersect } from "lib/algos/doesIntersect"
import type { ProcessedObstacle } from "lib/algos/preprocessObstacles"
import type { Pattern } from "lib/patterns"
import type { PointWithLayer, Trace } from "lib/types/SimpleRouteJson"
import { solveForLineRecursive } from "./solveForLineRecursive"

export const solveForTrace = (params: {
  startPoint: PointWithLayer
  endPoint: PointWithLayer
  processedObstacles: ProcessedObstacle[]
  existingTraces: Trace[]
  patterns: Pattern[]
  connectionName: string
}): Trace | null => {
  const start = { ...params.startPoint, l: 0 }
  const end = { ...params.endPoint, l: 0 }

  const line = solveForLineRecursive(start, end, {
    processedObstacles: params.processedObstacles,
    obstacleMask: params.processedObstacles.map((obstacle) => {
      return obstacle.connectedTo.includes(params.connectionName)
    }),
    patterns: params.patterns,
  })

  if (!line) return null

  return {
    route: line.map((point) => ({
      x: point.x,
      y: point.y,
      layer: "top",
      route_type: "wire",
      width: 0.1,
    })),
  }
}
