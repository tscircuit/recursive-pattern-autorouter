import type { PointWithLayer, PointWithLayer2 } from "lib/types/SimpleRouteJson"
import type { ProcessedObstacle } from "lib/algos/preprocessObstacles"
import type { PatternDefinition } from "lib/patterns"
import type { Trace } from "lib/types/SimpleRouteJson"
import {
  canPatternOvercomeObstacle,
  doesIntersect,
  getIntersectionObstacleSize,
} from "lib/algos/doesIntersect"
import { getScaleVariantPatterns } from "lib/patterns/scale-variant-patterns"

type Line = Array<PointWithLayer2>

export const solveForLineRecursive = (
  A: PointWithLayer2,
  B: PointWithLayer2,
  ctx: {
    processedObstacles: ProcessedObstacle[]
    obstacleMask: boolean[]
    patterns: PatternDefinition[]
    filterByObstacleSize?: boolean
    useScaleVariantPatterns?: boolean
  },
): Line | null => {
  const intersectionInfo = getIntersectionObstacleSize(
    A,
    B,
    ctx.processedObstacles,
    ctx.obstacleMask,
  )
  if (!intersectionInfo) {
    return [A, B]
  }

  const dist = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2)
  const unitVec = { x: (B.x - A.x) / dist, y: (B.y - A.y) / dist }
  const orthoVec = { x: -unitVec.y, y: unitVec.x }

  const candidatePatterns = ctx.useScaleVariantPatterns
    ? getScaleVariantPatterns(dist)
    : ctx.patterns

  for (const pattern of candidatePatterns) {
    if (
      ctx.filterByObstacleSize &&
      !canPatternOvercomeObstacle(pattern, dist, intersectionInfo)
    ) {
      continue
    }

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
