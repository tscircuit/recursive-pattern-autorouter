import {
  getPatternName,
  singleLayerPatternSet,
  type PatternDefinition,
} from "lib/patterns"
import { projectPattern } from "lib/patterns/projectPattern"
import type { PointWithLayer, PointWithLayer2 } from "lib/types/SimpleRouteJson"
import { hasJSDocParameterTags } from "typescript"
import { doesIntersect } from "./doesIntersect"
import type { ProcessedObstacle } from "./preprocessObstacles"
import { distance } from "./distance"
import {
  applyPatternFn,
  type PatternFn,
  type PatternFnDefinition,
} from "lib/patterns/pattern-fns"

export interface Segment {
  A: PointWithLayer2
  B: PointWithLayer2
  distance: number
  depth: number
  hasCollision: boolean
}

export interface ProjectedPattern {
  parentProjectedPattern: ProjectedPattern | null
  parentSegmentIndex: number

  patternDefinitionsUsed: Record<string, number>

  solvedSegments: Segment[]
  unsolvedSegments: Segment[]

  /**
   * Cost of the path considering all segments without collisions
   */
  g?: number

  /**
   * Estimated cost of the path considering all segments with collisions
   */
  h?: number

  /**
   * Estimated total cost of path (g + h)
   */
  f?: number
}

export class AstarPatternFnPathFinder {
  openSet: ProjectedPattern[] = []
  iterations: number = 0

  exploredPatterns: ProjectedPattern[] = []

  patternFns: PatternFnDefinition[] = []

  processedObstacles: ProcessedObstacle[] = []
  obstacleMask: boolean[] = []

  solvedPattern: ProjectedPattern | null = null

  goalStraightLineDistance: number = 0

  GREEDY_MULTIPLER = 1.2

  /**
   * Find all patterns that can be reached from the current pattern, excluding
   * segments that don't have collisions
   */
  getNewCandidatePatterns(pat: ProjectedPattern): ProjectedPattern[] {
    // Generate new candidate patterns
    const newPatterns: ProjectedPattern[] = []

    for (
      let parentSegmentIndex = 0;
      parentSegmentIndex < pat.unsolvedSegments.length;
      parentSegmentIndex++
    ) {
      const anchorSegment = pat.unsolvedSegments[parentSegmentIndex]
      const unsolvedSegmentsWithoutAnchorSegment = [
        ...pat.unsolvedSegments.slice(0, parentSegmentIndex),
        ...pat.unsolvedSegments.slice(parentSegmentIndex + 1),
      ]
      for (const patternFnDef of this.patternFns) {
        const projectedPointVariants = applyPatternFn(
          patternFnDef,
          anchorSegment.A,
          anchorSegment.B,
        )

        for (const projectedPoints of projectedPointVariants) {
          const patternName = patternFnDef.name

          const patternDefinitionsUsed = { ...pat.patternDefinitionsUsed }
          patternDefinitionsUsed[patternName] =
            (patternDefinitionsUsed[patternName] || 0) + 1

          const solvedSegments = [...pat.solvedSegments]
          const unsolvedSegments = [...unsolvedSegmentsWithoutAnchorSegment]

          for (let i = 0; i < projectedPoints.length - 1; i++) {
            const newA = projectedPoints[i]
            const newB = projectedPoints[i + 1]

            const hasCollision = doesIntersect(
              newA,
              newB,
              this.processedObstacles,
              this.obstacleMask,
            )

            const newSegment: Segment = {
              A: newA,
              B: newB,
              hasCollision,
              distance: distance(newA, newB),
              depth: anchorSegment.depth + 1,
            }

            if (!hasCollision) {
              solvedSegments.push(newSegment)
            } else {
              unsolvedSegments.push(newSegment)
            }
          }

          const newPattern: ProjectedPattern = {
            parentProjectedPattern: pat,
            parentSegmentIndex,
            patternDefinitionsUsed,
            solvedSegments,
            unsolvedSegments,
          }

          newPattern.g = this.computeG(newPattern)
          newPattern.h = this.computeH(newPattern)
          newPattern.f = newPattern.g! + newPattern.h! * this.GREEDY_MULTIPLER

          newPatterns.push(newPattern)
        }
      }
    }

    return newPatterns
  }

  /**
   * Cost of the path so far
   */
  computeG(pat: ProjectedPattern) {
    return pat.solvedSegments.reduce(
      (acc, segment) => acc + segment.distance,
      0,
    )
  }

  /**
   * Estimated remaining cost
   */
  computeH(pat: ProjectedPattern) {
    return pat.unsolvedSegments.reduce((acc, segment) => {
      // This is the simplest heuristic. It has no penalty for depth, meaning
      // you can get into a situation where a small segment grows
      // increasingly complex
      // return acc + segment.distance

      // Only penalize depth, scale by goal distance to be compatible with G
      // This will lead to less complex paths, but much longer as we avoid
      // shortcuts that would increase complexity
      // return acc + (segment.depth * this.goalStraightLineDistance) / 10

      return (
        acc +
        segment.distance +
        (1 + segment.depth / 10) * this.goalStraightLineDistance
      )
    }, 0)
  }

  init({
    A,
    B,
  }: {
    A?: PointWithLayer | PointWithLayer2
    B?: PointWithLayer | PointWithLayer2
  }) {
    this.goalStraightLineDistance = distance(A, B)

    this.openSet.push({
      parentProjectedPattern: null,
      parentSegmentIndex: -1,

      unsolvedSegments: [
        {
          A: { ...A!, l: 0 },
          B: { ...B!, l: 0 },
          hasCollision: true,
          depth: 0,
          distance: distance(A!, B!),
        },
      ],
      solvedSegments: [],
      patternDefinitionsUsed: {},
      g: 0,
      h: 0,
      f: 0,
    })
  }

  solve() {
    while (
      this.iterations < 1000 &&
      this.openSet.length > 0 &&
      !this.solvedPattern
    ) {
      this.solveOneStep()
    }
    return this.solvedPattern
  }

  solveOneStep() {
    this.iterations++
    const current = this.openSet.shift()
    if (!current) return
    this.exploredPatterns.push(current)

    if (current.unsolvedSegments.length === 0) {
      this.solvedPattern = current
      return
    }

    // There is at least one collision in our current pattern

    const newCandidates = this.getNewCandidatePatterns(current)
    for (const newCandidate of newCandidates) {
      this._binarySearchOpenSetInsert(newCandidate)
    }
  }

  _binarySearchOpenSetInsert(neighborNode: ProjectedPattern) {
    let left = 0
    let right = this.openSet.length - 1

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      if (this.openSet[mid].f! > neighborNode.f!) {
        right = mid - 1
      } else {
        left = mid + 1
      }
    }

    this.openSet.splice(left, 0, neighborNode)
  }
}
