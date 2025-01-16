import type { PointWithLayer2 } from "lib/types/SimpleRouteJson"

const addXYFlips = (obj: any) => [
  { yFlip: 1, xFlip: 1, ...obj },
  { yFlip: -1, xFlip: 1, ...obj },
  { yFlip: 1, xFlip: -1, ...obj },
  { yFlip: -1, xFlip: -1, ...obj },
]

/**
 * Pattern functions return a list of points from A to B that make
 * up the pattern.
 */
export type PatternFn = (
  A: PointWithLayer2,
  B: PointWithLayer2,
  variant?: any,
) => PointWithLayer2[] | null

export type PatternFnDefinition = {
  name: string

  variants?: any[]

  fn: PatternFn
}

/**
 * Makes sure A is always on left and B is always on right
 *
 * If vertical, A.y < B.y
 *
 * TODO this function should swap the X/Y of the return output
 * such that any function using this wrapper can always consider A
 * being in bottom left and B being in the top right
 */
const presortAB =
  (fn: PatternFn) =>
  (A: PointWithLayer2, B: PointWithLayer2, variant?: any) => {
    if (A.x > B.x) {
      return fn(B, A, variant)
    }
    if (A.x === B.x) {
      if (A.y < B.y) {
        return fn(B, A, variant)
      }
    }
    return fn(A, B, variant)
  }

const presortAB2 = (fn: PatternFn) => {
  const NormalizeALowerLeftBTopRight = (
    A: PointWithLayer2,
    B: PointWithLayer2,
    variant?: any,
  ) => {
    if (A.x < B.x && A.y < B.y) {
      return fn(A, B, variant)
    }
    if (A.x > B.x && A.y > B.y) {
      return fn(B, A, variant)
    }
    if (A.x < B.x && A.y > B.y) {
      const result = fn(
        { x: A.x, y: B.y, l: A.l },
        { x: B.x, y: A.y, l: B.l },
        variant,
      )
      if (!result) return null
      return result.map((p) => ({ x: p.x, y: A.y - (p.y - B.y), l: p.l }))
    }
    if (A.x > B.x && A.y < B.y) {
      const result = fn(
        { x: B.x, y: A.y, l: B.l },
        { x: A.x, y: B.y, l: A.l },
        variant,
      )
      if (!result) return null
      return result.map((p) => ({ x: p.x, y: B.y - (p.y - A.y), l: p.l }))
    }
    return null
  }

  return (A: PointWithLayer2, B: PointWithLayer2, variant?: any) => {
    let result: any[] | null = null
    console.log(variant)
    if (variant?.xFlip === 1) {
      result = NormalizeALowerLeftBTopRight(B, A, variant)
    } else if (variant?.xFlip === -1) {
      result = NormalizeALowerLeftBTopRight(
        {
          x: A.y,
          y: A.x,
          l: A.l,
        },
        {
          x: B.y,
          y: B.x,
          l: B.l,
        },
        variant,
      )
      if (!result) return null

      result = result.map((p) => ({
        x: p.y,
        y: p.x,
        l: p.l,
      }))
    }

    if (!result) return null

    if (variant?.yFlip === -1) {
      return result?.map((p) => ({
        x: A.x - (p.x - B.x),
        y: A.y - (p.y - B.y),
        l: p.l,
      }))
    }

    return result
  }
}

export const gapAndCorner45: PatternFnDefinition = {
  name: "gapAndCorner45",

  variants: [
    { cornerSizeFraction: 1 / 2 },
    { cornerSizeFraction: 1 / 3 },
    { cornerSizeFraction: 2 / 3 },
    { cornerSizeFraction: 9 / 10 },
  ],

  fn: presortAB((A, B, variant) => {
    const { cornerSizeFraction } = variant!
    const dx = B.x - A.x
    const dy = B.y - A.y

    const udy = Math.sign(dy)

    const shortestDist = Math.min(Math.abs(dx), Math.abs(dy))
    const cornerSize = shortestDist * cornerSizeFraction

    return [
      A,
      { x: B.x - cornerSize, y: A.y, l: 0 },
      { x: B.x, y: A.y + udy * cornerSize, l: 0 },
      B,
    ]
  }),
}

export const singleBend45: PatternFnDefinition = {
  name: "singleBend45",
  variants: [
    { xFlip: 1, yFlip: 1, offset: 0 },
    { xFlip: -1, yFlip: 1, offset: 0 },

    { xFlip: 1, yFlip: 1, offset: -0.5 },
    { xFlip: -1, yFlip: 1, offset: -0.5 },

    { xFlip: 1, yFlip: 1, offset: 0.5 },
    { xFlip: -1, yFlip: 1, offset: 0.5 },
  ],
  fn: presortAB2((A, B, { offset }) => {
    const dx = B.x - A.x
    const dy = B.y - A.y
    const udy = Math.sign(dy)

    if (dy > dx) return null

    const midpoint = {
      x: A.x + dx / 2,
      y: A.y + (udy * dx) / 2,
      l: 0,
    }

    const maxOffsetDist = A.x - (midpoint.x - dy / 2)

    return [
      A,
      { x: midpoint.x - dy / 2 - offset * maxOffsetDist, y: A.y, l: 0 },
      { x: midpoint.x + dy / 2 - offset * maxOffsetDist, y: B.y, l: 0 },
      B,
    ]
  }),
}

export const overshoot45: PatternFnDefinition = {
  name: "overshoot45",

  variants: addXYFlips({}),

  fn: presortAB2((A, B) => {
    const dx = B.x - A.x
    const dy = B.y - A.y

    if (dy > dx) return null

    const updist = dx / 2
    const arrowTopY = A.y + updist

    return [
      A,
      { x: A.x + updist, y: arrowTopY, l: 0 },
      { x: A.x + updist + Math.abs(B.y - arrowTopY), y: B.y, l: 0 },
      B,
    ]
  }),
}

export const corner45: PatternFnDefinition = {
  name: "corner45",
  variants: [{ dir: 1 }, { dir: -1 }],
  fn: presortAB((A, B, { dir }) => {
    const dx = B.x - A.x
    const dy = B.y - A.y
    const udy = Math.sign(dy)

    if (dir === 1) {
      return [
        A,
        {
          x: A.x + dy + (dx - dy) / 2,
          y: B.y + (dx - dy) / 2,
          l: 0,
        },
        B,
      ]
    }
    return [
      A,
      {
        x: A.x + (dx - dy) / 2,
        y: A.y - (dx - dy) / 2,
        l: 0,
      },
      B,
    ]
  }),
}

export const doubleBend45: PatternFnDefinition = {
  name: "doubleBend45",
  variants: [
    ...addXYFlips({ bendSizeFraction: 1 / 2 }),
    ...addXYFlips({ bendSizeFraction: 5 / 6 }),
  ],
  fn: presortAB2((A, B, { dir, bendSizeFraction }) => {
    const dx = B.x - A.x
    const dy = B.y - A.y
    const udy = Math.sign(dy)

    const cornerCenterX = A.x + dy + (dx - dy) / 2

    const plateauLength = bendSizeFraction * dx

    return [
      A,
      {
        x: cornerCenterX - plateauLength / 2,
        y: B.y + (dx - dy) / 2 - plateauLength / 2,
        l: 0,
      },
      {
        x: cornerCenterX + plateauLength / 2,
        y: B.y + (dx - dy) / 2 - plateauLength / 2,
        l: 0,
      },
      B,
    ]
  }),
}

export const squareCorner45: PatternFnDefinition = {
  name: "squareCorner45",
  variants: [
    ...addXYFlips({ heightFraction: 3 / 4, cornerFraction: 1 / 2 }),
    ...addXYFlips({ heightFraction: 1 / 2, cornerFraction: 2 / 3 }),
    ...addXYFlips({ heightFraction: 1 / 4, cornerFraction: 2 / 3 }),
    ...addXYFlips({ heightFraction: 1 / 8, cornerFraction: 2 / 3 }),
  ],
  fn: presortAB2((A, B, { dir, heightFraction, cornerFraction }) => {
    const dx = B.x - A.x
    const dy = B.y - A.y
    if (dy > dx) return null

    const dist = dx
    const height = dist * heightFraction
    const cornerSize = height * cornerFraction

    if (dy > cornerSize) return null

    if (B.y > A.y + height && B.y < A.y + height + cornerSize) {
      return null
    }

    const bCornerDir = B.y > A.y + height ? -1 : 1

    return [
      A,
      { x: A.x, y: A.y + height - cornerSize, l: 0 },
      { x: A.x + cornerSize, y: A.y + height, l: 0 },
      { x: B.x - cornerSize, y: A.y + height, l: 0 },
      { x: B.x, y: A.y + height - cornerSize * bCornerDir, l: 0 },
      B,
    ]
  }),
}

export type Path = PointWithLayer2[]

export const applyPatternFn = (
  patternFn: PatternFnDefinition,
  A: PointWithLayer2,
  B: PointWithLayer2,
): Path[] => {
  const paths: Path[] = []
  for (const variant of patternFn.variants ?? [null]) {
    const points = patternFn.fn(A, B, variant)
    if (points) {
      paths.push(points)
    }
  }
  return paths
}
