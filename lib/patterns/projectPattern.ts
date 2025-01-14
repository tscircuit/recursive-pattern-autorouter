import type { PointWithLayer2 } from "lib/types/SimpleRouteJson"
import type { PatternDefinition } from "."

export const projectPattern = (
  A: PointWithLayer2,
  B: PointWithLayer2,
  patternDefinition: PatternDefinition,
): Array<{ x: number; y: number; l: number }> => {
  const dist = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2)
  const unitVec = { x: (B.x - A.x) / dist, y: (B.y - A.y) / dist }
  const orthoVec = { x: -unitVec.y, y: unitVec.x }

  return patternDefinition.map((pat) => ({
    x: A.x + (pat.x * unitVec.x + pat.y * orthoVec.x) * dist,
    y: A.y + (pat.x * unitVec.y + pat.y * orthoVec.y) * dist,
    l: 0,
  }))
}
