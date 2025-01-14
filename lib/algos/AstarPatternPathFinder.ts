import { singleLayerPatternSet, type PatternDefinition } from "lib/patterns"
import { projectPattern } from "lib/patterns/projectPattern"
import type { PointWithLayer2 } from "lib/types/SimpleRouteJson"
import { hasJSDocParameterTags } from "typescript"
import { doesIntersect } from "./doesIntersect"
import type { ProcessedObstacle } from "./preprocessObstacles"

export interface Segment {
  A: PointWithLayer2
  B: PointWithLayer2
  depth: number
  hasCollision: boolean
}

export interface ProjectedPattern {
  parentProjectedPattern: ProjectedPattern | null
  parentSegmentIndex: number

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

export class AstarPatternPathFinder {
  openSet: ProjectedPattern[] = []
  iterations: number = 0

  exploredPatterns: ProjectedPattern[] = []

  patternDefinitions: PatternDefinition[] = singleLayerPatternSet

  processedObstacles: ProcessedObstacle[] = []
  obstacleMask: boolean[] = []

  solvedPattern: ProjectedPattern | null = null

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
      for (const patternDefinition of this.patternDefinitions) {
        const projectedPoints = projectPattern(
          anchorSegment.A,
          anchorSegment.B,
          patternDefinition,
        )

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
          solvedSegments,
          unsolvedSegments,
        }

        newPattern.g = this.computeG(newPattern)
        newPattern.h = this.computeH(newPattern)
        newPattern.f = newPattern.g! + newPattern.h!

        newPatterns.push(newPattern)
      }
    }

    return newPatterns
  }

  /**
   * Cost of the path so far
   */
  computeG(pat: ProjectedPattern) {
    const parentG = pat.parentProjectedPattern?.g ?? 0

    // Lots of opportunity to compute g differently!
    return parentG + pat.solvedSegments.length
  }

  /**
   * Estimated remaining cost
   */
  computeH(pat: ProjectedPattern) {
    // Equally as much opportunity!
    return pat.unsolvedSegments.length
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
