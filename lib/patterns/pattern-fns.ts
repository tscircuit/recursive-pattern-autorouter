import type { PointWithLayer2 } from "lib/types/SimpleRouteJson"

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
    const result = NormalizeALowerLeftBTopRight(B, A, variant)

    if (variant?.dir === -1) {
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

export const overshoot45: PatternFnDefinition = {
  name: "overshoot45",

  fn: presortAB((A, B) => {
    const dx = B.x - A.x
    const dy = B.y - A.y

    const udy = Math.sign(dy)

    const updist = dx / 2
    const arrowTopY = A.y + updist * udy

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
    { dir: 1, bendSizeFraction: 1 / 2 },
    { dir: -1, bendSizeFraction: 1 / 2 },
    { dir: 1, bendSizeFraction: 2 / 3 },
    { dir: -1, bendSizeFraction: 2 / 3 },
    { dir: 1, bendSizeFraction: 1 / 6 },
    { dir: -1, bendSizeFraction: 1 / 6 },
  ],
  fn: presortAB((A, B, { dir, bendSizeFraction }) => {
    const dx = B.x - A.x
    const dy = B.y - A.y
    const udy = Math.sign(dy)

    const cornerCenterX =
      dir === 1 ? A.x + dy + (dx - dy) / 2 : A.x + (dx - dy) / 2

    const plateauLength = bendSizeFraction * dx

    if (dir === 1) {
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
    }
    return [
      A,
      {
        x: cornerCenterX - plateauLength / 2,
        y: A.y - (dx - dy) / 2 + plateauLength / 2,
        l: 0,
      },
      {
        x: cornerCenterX + plateauLength / 2,
        y: A.y - (dx - dy) / 2 + plateauLength / 2,
        l: 0,
      },
      B,
    ]
  }),
}

export const squareCorner45: PatternFnDefinition = {
  name: "squareCorner45",
  variants: [
    { dir: 1, heightFraction: 1 / 2, cornerFraction: 1 / 4 },
    { dir: -1, heightFraction: 1 / 2, cornerFraction: 1 / 4 },
    { dir: 1, heightFraction: 1 / 4, cornerFraction: 1 / 4 },
    { dir: -1, heightFraction: 1 / 4, cornerFraction: 1 / 4 },
    { dir: 1, heightFraction: 1 / 2, cornerFraction: 1 / 2 },
    { dir: -1, heightFraction: 1 / 2, cornerFraction: 1 / 2 },
    { dir: 1, heightFraction: 3 / 4, cornerFraction: 1 / 2 },
    { dir: -1, heightFraction: 3 / 4, cornerFraction: 1 / 2 },
  ],
  fn: presortAB2((A, B, { dir, heightFraction, cornerFraction }) => {
    const dx = B.x - A.x
    const dy = B.y - A.y

    const dist = dx
    const height = dist * heightFraction
    const cornerSize = height * cornerFraction

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
