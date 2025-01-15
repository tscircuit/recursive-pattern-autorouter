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

const wideArrowVariants = [1 / 16, 1 / 8, 1 / 4, 1 / 2].map((y) => [
  { x: 0, y: 0, l: 0 },
  { x: 1 / 2, y, l: 0 },
  { x: 1, y: 0, l: 0 },
])
const flippedWideArrowVariants = wideArrowVariants.map(flip)

export const ultraWideArrow = [
  { x: 0, y: 0, l: 0 },
  { x: 1 / 2, y: 1 / 8, l: 0 },
  { x: 1, y: 0, l: 0 },
]
const flippedUltraWideArrow = flip(ultraWideArrow)

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

const doubleBendVariants = [1 / 16, 1 / 8, 1 / 4].map((y) => [
  { x: 0, y: 0, l: 0 },
  { x: 1 / 4, y, l: 0 },
  { x: 3 / 4, y, l: 0 },
  { x: 1, y: 0, l: 0 },
])
const flippedDoubleBendVariants = doubleBendVariants.map(flip)

export const hardLeft = [
  { x: 0, y: 0, l: 0 },
  { x: 0, y: 1 / 3, l: 0 },
  { x: 1, y: 0, l: 0 },
]
export const flippedHardLeft = flip(hardLeft)

export const overtake1 = [
  { x: 0, y: 0, l: 0 },
  { x: 1.25, y: 0.25, l: 0 },
  { x: 1, y: 0, l: 0 },
]
export const flippedOvertake1 = flip(overtake1)

export const overtake2 = [
  { x: 0, y: 0, l: 0 },
  { x: 0, y: 0.5, l: 0 },
  { x: 1, y: 0.5, l: 0 },
  { x: 1, y: 0, l: 0 },
]
export const flippedOvertake2 = flip(overtake2)

export const arrow1 = [
  { x: 0, y: 0, l: 0 },
  { x: 1 / 2, y: 1, l: 0 },
  { x: 1, y: 0, l: 0 },
]
export const flippedArrow1 = flip(arrow1)

export const arrow2 = [
  { x: 0, y: 0, l: 0 },
  { x: 1 / 2, y: 1, l: 0 },
  { x: 1.5, y: 0.5, l: 0 },
  { x: 1, y: 0, l: 0 },
]
export const flippedArrow2 = flip(arrow2)

export const arrow3 = [
  { x: 0, y: 0, l: 0 },
  { x: 0.5, y: 1, l: 0 },
  { x: 1.5, y: 1, l: 0 },
  { x: 1.5, y: 0.25, l: 0 },
  { x: 1, y: 0, l: 0 },
]
export const flippedArrow3 = flip(arrow3)

export const arrow4 = [
  { x: 0, y: 0, l: 0 },
  { x: -0.5, y: 0.25, l: 0 },
  { x: -0.5, y: 1.5, l: 0 },
  { x: 1.5, y: 1.5, l: 0 },
  { x: 1.5, y: 1.5, l: 0 },
  { x: 1.5, y: 0.25, l: 0 },
  { x: 1, y: 0, l: 0 },
]
export const flippedArrow4 = flip(arrow4)

export const namedPatterns = {
  straightLinePattern,
  wideArrow,
  ultraWideArrow,
  doubleBend,
  hardLeft,
  flippedWideArrow,
  flippedHardLeft,
  flippedDoubleBend,
  flippedUltraWideArrow,
  overtake1,
  overtake2,
  flippedOvertake1,
  flippedOvertake2,
  arrow1,
  flippedArrow1,
  arrow2,
  flippedArrow2,
  arrow3,
  flippedArrow3,
  arrow4,
  flippedArrow4,
}
export const allNamedPatterns = [...Object.values(namedPatterns)]

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

  doubleBend,
  flippedDoubleBend,

  ultraWideArrow,
  flippedUltraWideArrow,

  // arrow1,
  // flippedArrow1,

  // arrow2,
  // flippedArrow2,

  // arrow3,
  // flippedArrow3,

  // arrow4,
  // flippedArrow4,

  // overtake1,
  // flippedOvertake1,

  // overtake2,
  // flippedOvertake2,

  // hardLeft,
  // flippedHardLeft,

  // ...wideArrowVariants,
  // ...flippedWideArrowVariants,

  // ...doubleBendVariants,
  // ...flippedDoubleBendVariants,
]
