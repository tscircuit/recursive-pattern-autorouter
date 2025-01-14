// All patterns are projected onto the line between A -> B

export const flip = (pattern: Array<{ x: number; y: number; l: number }>) => {
  return pattern.map((point) => ({ ...point, x: point.x, y: -point.y }))
}

export const straightLinePattern = [
  { x: 0, y: 0, l: 0 },
  { x: 1, y: 0, l: 0 },
]

export const wideArrow = [
  { x: 0, y: 0, l: 0 },
  { x: 1 / 2, y: 1 / 3, l: 0 },
  { x: 1, y: 0, l: 0 },
]

export const flippedWideArrow = flip(wideArrow)

export const ultraWideArrow = [
  { x: 0, y: 0, l: 0 },
  { x: 1 / 2, y: 1 / 6, l: 0 },
  { x: 1, y: 0, l: 0 },
]

export const asymmetricSharpArrow = [
  { x: 0, y: 0, l: 0 },
  { x: 1 / 3, y: 2 / 3, l: 0 },
  { x: 1, y: 0, l: 0 },
]

export const doubleBend = [
  { x: 0, y: 0, l: 0 },
  { x: 1 / 4, y: 1 / 3, l: 0 },
  { x: 3 / 4, y: 1 / 3, l: 0 },
  { x: 1, y: 0, l: 0 },
]
export const flippedDoubleBend = flip(doubleBend)

export const hardLeft = [
  { x: 0, y: 0, l: 0 },
  { x: 0, y: 1 / 3, l: 0 },
  { x: 1, y: 0, l: 0 },
]
export const flippedHardLeft = flip(hardLeft)
export const namedPatterns = {
  straightLinePattern,
  wideArrow,
  ultraWideArrow,
  doubleBend,
  hardLeft,
  flippedWideArrow,
  flippedHardLeft,
  flippedDoubleBend,
}

export type PatternDefinition = Array<{ x: number; y: number; l: number }>

export const getPatternName = (pattern: PatternDefinition) => {
  return Object.keys(namedPatterns).find(
    (key) => namedPatterns[key as keyof typeof namedPatterns] === pattern,
  )
}

export const singleLayerPatternSet: PatternDefinition[] = [
  // we omit the straight line pattern, it has some special handling
  // straightLinePattern,

  wideArrow,
  flippedWideArrow,

  // doubleBend,
  // flippedDoubleBend,

  // hardLeft,
  // flippedHardLeft,
]
