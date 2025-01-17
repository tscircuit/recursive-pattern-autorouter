import type { PointWithLayer, PointWithLayer2 } from "lib/types/SimpleRouteJson"
import type { ProcessedObstacle } from "lib/algos/preprocessObstacles"
import type { PatternDefinition } from "lib/patterns"
import type { Trace } from "lib/types/SimpleRouteJson"
import { doesIntersect } from "lib/algos/doesIntersect"

type Line = Array<PointWithLayer2>

export const solveForLineRecursive = (
  A: PointWithLayer2,
  B: PointWithLayer2,
  ctx: {
    processedObstacles: ProcessedObstacle[]
    obstacleMask: boolean[]
    patterns: PatternDefinition[]
  },
): Line | null => {
  if (!doesIntersect(A, B, ctx.processedObstacles, ctx.obstacleMask)) {
    return [A, B]
  }

  const dist = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2)
  const unitVec = { x: (B.x - A.x) / dist, y: (B.y - A.y) / dist }
  const orthoVec = { x: -unitVec.y, y: unitVec.x }

  for (const pattern of ctx.patterns) {
    const segmentPoints = pattern.map((pat) => ({
      x: A.x + (pat.x * unitVec.x + pat.y * orthoVec.x) * dist,
      y: A.y + (pat.x * unitVec.y + pat.y * orthoVec.y) * dist,
      l: 0,
    }))

    const segments = segmentPoints.slice(0, -1).map((seg, i) => ({
      start: seg,
      end: segmentPoints[i + 1],
    }))

    if (
      segments.every(
        ({ start, end }) =>
          !doesIntersect(start, end, ctx.processedObstacles, ctx.obstacleMask),
      )
    ) {
      return segmentPoints
    }
  }

  return null
}
