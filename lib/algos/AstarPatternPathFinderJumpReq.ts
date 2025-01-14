import {
  getPatternName,
  singleLayerPatternSet,
  type PatternDefinition,
} from "lib/patterns"
import { projectPattern } from "lib/patterns/projectPattern"
import type { PointWithLayer2 } from "lib/types/SimpleRouteJson"
import { hasJSDocParameterTags } from "typescript"
import { doesIntersect } from "./doesIntersect"
import type { ProcessedObstacle } from "./preprocessObstacles"
import { distance } from "./distance"

export interface Segment {
  A: PointWithLayer2
  B: PointWithLayer2
  distance: number
  depth: number
  jumpsFromA: number
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

export class AstarPatternPathFinderJumpCount {
  openSet: ProjectedPattern[] = []
  iterations: number = 0

  exploredPatterns: ProjectedPattern[] = []

  patternDefinitions: PatternDefinition[] = singleLayerPatternSet

  processedObstacles: ProcessedObstacle[] = []
  obstacleMask: boolean[] = []

  solvedPattern: ProjectedPattern | null = null

  GREEDY_MULTIPLER = 1.1

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
      for (const patternDefinition of this.patternDefinitions) {
        const projectedPoints = projectPattern(
          anchorSegment.A,
          anchorSegment.B,
          patternDefinition,
        )

        const patternName = getPatternName(patternDefinition) ?? "unknown"

        const patternDefinitionsUsed = { ...pat.patternDefinitionsUsed }
        patternDefinitionsUsed[patternName] =
          (patternDefinitionsUsed[patternName] || 0) + 1

        const newSolvedSegments: Segment[] = []
        const newUnsolvedSegments: Segment[] = []

        for (let i = 0; i < projectedPoints.length - 1; i++) {
          const newA = projectedPoints[i]
          const newB = projectedPoints[i + 1]

          const jumpsFromA = anchorSegment.jumpsFromA + i

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
            jumpsFromA,
            distance: distance(newA, newB),
            depth: anchorSegment.depth + 1,
          }

          if (!hasCollision) {
            newSolvedSegments.push(newSegment)
          } else {
            newUnsolvedSegments.push(newSegment)
          }
        }

        const insertAtSolvedSegmentIndex = pat.solvedSegments.findIndex(
          (s) => s.jumpsFromA > anchorSegment.jumpsFromA,
        )

        const segmentsAdded =
          newSolvedSegments.length + newUnsolvedSegments.length

        const solvedSegments = [
          ...pat.solvedSegments.slice(0, insertAtSolvedSegmentIndex),
          ...newSolvedSegments,
          ...pat.solvedSegments.slice(insertAtSolvedSegmentIndex).map((s) => ({
            ...s,
            jumpsFromA: s.jumpsFromA + segmentsAdded - 1,
          })),
        ]

        const unsolvedSegments = [
          ...pat.unsolvedSegments.slice(0, parentSegmentIndex),
          ...newUnsolvedSegments,
          ...pat.unsolvedSegments.slice(parentSegmentIndex + 1).map((s) => ({
            ...s,
            jumpsFromA: s.jumpsFromA + segmentsAdded - 1,
          })),
        ]

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

    return newPatterns
  }

  /**
   * Cost of the path so far
   */
  computeG(pat: ProjectedPattern) {
    const solvedDistance = pat.solvedSegments.reduce(
      (acc, segment) => acc + segment.distance,
      0,
    )

    return solvedDistance

    let solvedDirectJumpsFromADist = 0
    for (let i = 0; i < pat.solvedSegments.length; i++) {
      if (pat.solvedSegments[i].jumpsFromA !== i) break
      solvedDirectJumpsFromADist += pat.solvedSegments[i].distance
    }

    return solvedDistance * 0.9 + solvedDirectJumpsFromADist * 0.1
  }

  /**
   * Estimated remaining cost
   */
  computeH(pat: ProjectedPattern) {
    return pat.unsolvedSegments.reduce(
      (acc, segment) => acc + segment.distance,
      0,
    )
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
