import type { PatternDefinition } from "./index"

const flipPattern = (
  pattern: Array<{ x: number; y: number; l: number }>,
): PatternDefinition => {
  return pattern.map((point) => ({ ...point, x: point.x, y: -point.y }))
}

const wideArrow: PatternDefinition = [
  { x: 0, y: 0, l: 0 },
  { x: 1 / 2, y: 1 / 3, l: 0 },
  { x: 1, y: 0, l: 0 },
]
const flippedWideArrow = flipPattern(wideArrow)

const ultraWideArrow: PatternDefinition = [
  { x: 0, y: 0, l: 0 },
  { x: 1 / 2, y: 1 / 8, l: 0 },
  { x: 1, y: 0, l: 0 },
]
const flippedUltraWideArrow = flipPattern(ultraWideArrow)

const doubleBend: PatternDefinition = [
  { x: 0, y: 0, l: 0 },
  { x: 1 / 4, y: 1 / 3, l: 0 },
  { x: 3 / 4, y: 1 / 3, l: 0 },
  { x: 1, y: 0, l: 0 },
]
const flippedDoubleBend = flipPattern(doubleBend)

const asymDoubleBend2: PatternDefinition = [
  { x: 0, y: 0, l: 0 },
  { x: 1 / 4, y: 2 / 3, l: 0 },
  { x: 1, y: 1 / 3, l: 0 },
  { x: 1, y: 0, l: 0 },
]
const flippedAsymDoubleBend2 = flipPattern(asymDoubleBend2)

const hardLeft: PatternDefinition = [
  { x: 0, y: 0, l: 0 },
  { x: 0, y: 1 / 3, l: 0 },
  { x: 1, y: 0, l: 0 },
]
const flippedHardLeft = flipPattern(hardLeft)

const overtake1: PatternDefinition = [
  { x: 0, y: 0, l: 0 },
  { x: 1.25, y: 0.25, l: 0 },
  { x: 1, y: 0, l: 0 },
]
const flippedOvertake1 = flipPattern(overtake1)

const overtake2: PatternDefinition = [
  { x: 0, y: 0, l: 0 },
  { x: 0, y: 0.5, l: 0 },
  { x: 1, y: 0.5, l: 0 },
  { x: 1, y: 0, l: 0 },
]
const flippedOvertake2 = flipPattern(overtake2)

export const fineWideArrow: PatternDefinition = [
  { x: 0, y: 0, l: 0 },
  { x: 1 / 2, y: 1 / 2, l: 0 },
  { x: 1, y: 0, l: 0 },
]
export const flippedFineWideArrow = flipPattern(fineWideArrow)

export const fineDoubleBend: PatternDefinition = [
  { x: 0, y: 0, l: 0 },
  { x: 1 / 5, y: 1 / 2, l: 0 },
  { x: 4 / 5, y: 1 / 2, l: 0 },
  { x: 1, y: 0, l: 0 },
]
export const flippedFineDoubleBend = flipPattern(fineDoubleBend)

export const shallowDoubleBend: PatternDefinition = [
  { x: 0, y: 0, l: 0 },
  { x: 1 / 4, y: 1 / 8, l: 0 },
  { x: 3 / 4, y: 1 / 8, l: 0 },
  { x: 1, y: 0, l: 0 },
]
export const flippedShallowDoubleBend = flipPattern(shallowDoubleBend)

export const smallScalePatternSet: PatternDefinition[] = [
  fineWideArrow,
  flippedFineWideArrow,
  fineDoubleBend,
  flippedFineDoubleBend,
  wideArrow,
  flippedWideArrow,
  hardLeft,
  flippedHardLeft,
  overtake1,
  flippedOvertake1,
  overtake2,
  flippedOvertake2,
]

export const mediumScalePatternSet: PatternDefinition[] = [
  wideArrow,
  flippedWideArrow,
  doubleBend,
  flippedDoubleBend,
  ultraWideArrow,
  flippedUltraWideArrow,
  asymDoubleBend2,
  flippedAsymDoubleBend2,
]

export const largeScalePatternSet: PatternDefinition[] = [
  ultraWideArrow,
  flippedUltraWideArrow,
  shallowDoubleBend,
  flippedShallowDoubleBend,
  wideArrow,
  flippedWideArrow,
  doubleBend,
  flippedDoubleBend,
]

export interface ScaleVariantOptions {
  smallScaleThreshold?: number
  largeScaleThreshold?: number
}

/**
 * Return a pattern set calibrated to the current segment distance scale.
 * As segments get smaller, patterns with larger relative lateral excursion
 * and tighter bends are prioritized to route around nearby pads/obstacles.
 */
export const getScaleVariantPatterns = (
  segmentDistance: number,
  options: ScaleVariantOptions = {},
): PatternDefinition[] => {
  const smallThreshold = options.smallScaleThreshold ?? 1.5
  const largeThreshold = options.largeScaleThreshold ?? 5.0

  if (segmentDistance <= smallThreshold) {
    return smallScalePatternSet
  }
  if (segmentDistance >= largeThreshold) {
    return largeScalePatternSet
  }
  return mediumScalePatternSet
}
