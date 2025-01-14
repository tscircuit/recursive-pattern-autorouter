import { singleLayerPatternSet, type PatternDefinition } from "lib/patterns"
import { projectPattern } from "lib/patterns/projectPattern"
import type { PointWithLayer2 } from "lib/types/SimpleRouteJson"
import { hasJSDocParameterTags } from "typescript"
import { doesIntersect } from "./doesIntersect"
import type { ProcessedObstacle } from "./preprocessObstacles"

export interface Segment {
  A: PointWithLayer2
  B: PointWithLayer2
  hasCollision: boolean
}

export interface ProjectedPattern {
  parentProjectedPattern: ProjectedPattern | null
  segments: Segment[]

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

export class GeneralizedAstar {
  openSet: ProjectedPattern[] = []
  iterations: number = -1

  patternDefinitions: PatternDefinition[] = singleLayerPatternSet

  processedObstacles: ProcessedObstacle[] = []
  obstacleMask: boolean[] = []

  solvedPattern: ProjectedPattern | null = null

  /**
   * Find all patterns that can be reached from the current pattern
   */
  getNewCandidatePatterns(pat: ProjectedPattern): ProjectedPattern[] {
    // Generate new candidate patterns

    const newPatterns: ProjectedPattern[] = []

    for (const segment of pat.segments) {
      for (const patternDefinition of this.patternDefinitions) {
        const segments = projectPattern(segment.A, segment.B, patternDefinition)

        for (let i = 0; i < segments.length - 1; i++) {
          const newA = segments[i]
          const newB = segments[i + 1]

          const newPattern: ProjectedPattern = {
            parentProjectedPattern: pat,
            segments: [
              {
                A: newA,
                B: newB,
                hasCollision: doesIntersect(
                  newA,
                  newB,
                  this.processedObstacles,
                  this.obstacleMask,
                ),
              },
            ],
          }

          newPattern.g = this.computeG(newPattern)
          newPattern.h = this.computeH(newPattern)
          newPattern.f = newPattern.g! + newPattern.h!

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
    const parentG = pat.parentProjectedPattern?.g ?? 0

    // Lots of opportunity to compute g differently!
    return parentG + pat.segments.filter((s) => !s.hasCollision).length
  }

  /**
   * Estimated remaining cost
   */
  computeH(pat: ProjectedPattern) {
    // Equally as much opportunity!
    return pat.segments.filter((s) => s.hasCollision).length
  }

  solveOneStep() {
    const current = this.openSet.shift()
    if (!current) return

    if (current.segments.every((s) => !s.hasCollision)) {
      this.solvedPattern = current
      return
    }

    // There is at least one collision in our current pattern

    const newCandidates = this.getNewCandidatePatterns(current)
    for (const newCandidate of newCandidates) {
      this._binarySearchOpenSetInsert(newCandidate)
    }

    this.iterations++
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
