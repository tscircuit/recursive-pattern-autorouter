// All patterns are projected onto the line between A -> B
export const straightLinePattern = [
  { x: 0, y: 0, l: 0 },
  { x: 1, y: 0, l: 0 },
]

export const wideArrow = [
  { x: 0, y: 0, l: 0 },
  { x: 1 / 2, y: 1 / 3, l: 0 },
  { x: 1, y: 0, l: 0 },
]

export const doubleBend = [
  { x: 0, y: 0, l: 0 },
  { x: 1 / 3, y: 1 / 3, l: 0 },
  { x: 2 / 3, y: 1 / 3, l: 0 },
  { x: 1, y: 0, l: 0 },
]

const flip = (pattern: Array<{ x: number; y: number; l: number }>) => {
  return pattern.map((point) => ({ ...point, x: point.x, y: -point.y }))
}

export const singleLayerPatternSet = [
  straightLinePattern,
  wideArrow,
  flip(wideArrow),
  doubleBend,
  flip(doubleBend),
]
