import type { PointWithLayer, PointWithLayer2 } from "lib/types/SimpleRouteJson"
import { doesIntersect } from "./doesIntersect"
import type { ProcessedObstacle } from "./preprocessObstacles"
import { distance } from "./distance"
import {
  applyPatternFn,
  rotationVariantPatternFns,
  type PatternFnDefinition,
} from "lib/patterns/pattern-fns"
import type { ProjectedPattern, Segment } from "./AstarPatternPathFinder"

export class AstarPatternFnPathFinder {
  openSet: ProjectedPattern[] = []
  iterations = 0

  exploredPatterns: ProjectedPattern[] = []

  patternFns: PatternFnDefinition[] = rotationVariantPatternFns

  processedObstacles: ProcessedObstacle[] = []
  obstacleMask: boolean[] = []

  solvedPattern: ProjectedPattern | null = null

  goalStraightLineDistance = 0

  GREEDY_MULTIPLER = 1.2

  getNewCandidatePatterns(pat: ProjectedPattern): ProjectedPattern[] {
    const newPatterns: ProjectedPattern[] = []

    for (
      let parentSegmentIndex = 0;
      parentSegmentIndex < pat.unsolvedSegments.length;
      parentSegmentIndex++
    ) {
      const anchorSegment = pat.unsolvedSegments[parentSegmentIndex]!
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
          if (!projectedPoints) continue
          const patternName = patternFnDef.name

          const patternDefinitionsUsed = { ...pat.patternDefinitionsUsed }
          patternDefinitionsUsed[patternName] =
            (patternDefinitionsUsed[patternName] || 0) + 1

          const solvedSegments = [...pat.solvedSegments]
          const unsolvedSegments = [...unsolvedSegmentsWithoutAnchorSegment]

          for (let i = 0; i < projectedPoints.length - 1; i++) {
            const newA = projectedPoints[i]!
            const newB = projectedPoints[i + 1]!

            const segDist = distance(newA, newB)
            if (segDist < 1e-6) continue

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
              distance: segDist,
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

  computeG(pat: ProjectedPattern) {
    return pat.solvedSegments.reduce(
      (acc, segment) => acc + segment.distance,
      0,
    )
  }

  computeH(pat: ProjectedPattern) {
    return pat.unsolvedSegments.reduce((acc, segment) => {
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
    const startPt: PointWithLayer2 = { x: A!.x, y: A!.y, l: 0 }
    const endPt: PointWithLayer2 = { x: B!.x, y: B!.y, l: 0 }
    const initialCollision = doesIntersect(
      startPt,
      endPt,
      this.processedObstacles,
      this.obstacleMask,
    )

    const initialSegment: Segment = {
      A: startPt,
      B: endPt,
      hasCollision: initialCollision,
      depth: 0,
      distance: distance(startPt, endPt),
    }

    this.openSet.push({
      parentProjectedPattern: null,
      parentSegmentIndex: -1,
      unsolvedSegments: initialCollision ? [initialSegment] : [],
      solvedSegments: initialCollision ? [] : [initialSegment],
      patternDefinitionsUsed: {},
      g: initialCollision ? 0 : initialSegment.distance,
      h: initialCollision ? initialSegment.distance : 0,
      f: initialSegment.distance,
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
      if (this.openSet[mid]!.f! > neighborNode.f!) {
        right = mid - 1
      } else {
        left = mid + 1
      }
    }

    this.openSet.splice(left, 0, neighborNode)
  }
}
