import type { PointWithLayer2 } from "lib/types/SimpleRouteJson"

const addXYFlips = (obj: Record<string, any>) => [
  { yFlip: 1, xFlip: 1, ...obj },
  { yFlip: -1, xFlip: 1, ...obj },
  { yFlip: 1, xFlip: -1, ...obj },
  { yFlip: -1, xFlip: -1, ...obj },
]

/**
 * Pattern functions return a list of points from A to B that make
 * up the pattern using only orthogonal (0/90 deg) or 45-degree segments.
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

const presortAB =
  (fn: PatternFn) =>
  (A: PointWithLayer2, B: PointWithLayer2, variant?: any) => {
    if (A.x > B.x) {
      const res = fn(B, A, variant)
      return res ? [...res].reverse() : null
    }
    if (A.x === B.x && A.y > B.y) {
      const res = fn(B, A, variant)
      return res ? [...res].reverse() : null
    }
    return fn(A, B, variant)
  }

export const gapAndCorner45: PatternFnDefinition = {
  name: "gapAndCorner45",
  variants: [
    { cornerSizeFraction: 1 / 2, flipOrder: false },
    { cornerSizeFraction: 1 / 3, flipOrder: false },
    { cornerSizeFraction: 2 / 3, flipOrder: false },
    { cornerSizeFraction: 9 / 10, flipOrder: false },
    { cornerSizeFraction: 1 / 2, flipOrder: true },
    { cornerSizeFraction: 1 / 3, flipOrder: true },
  ],
  fn: presortAB((A, B, variant) => {
    const { cornerSizeFraction = 0.5, flipOrder = false } = variant ?? {}
    const dx = B.x - A.x
    const dy = B.y - A.y
    const adx = Math.abs(dx)
    const ady = Math.abs(dy)
    const sx = Math.sign(dx) || 1
    const sy = Math.sign(dy) || 1

    const shortestDist = Math.min(adx, ady)
    if (shortestDist === 0) return [A, B]
    const cornerSize = shortestDist * cornerSizeFraction

    if (!flipOrder) {
      return [
        A,
        { x: B.x - sx * cornerSize, y: A.y, l: A.l },
        { x: B.x, y: A.y + sy * cornerSize, l: A.l },
        B,
      ]
    }
    return [
      A,
      { x: A.x, y: B.y - sy * cornerSize, l: A.l },
      { x: A.x + sx * cornerSize, y: B.y, l: A.l },
      B,
    ]
  }),
}

export const singleBend45: PatternFnDefinition = {
  name: "singleBend45",
  variants: [{ offset: 0 }, { offset: -0.5 }, { offset: 0.5 }],
  fn: presortAB((A, B, variant) => {
    const { offset = 0 } = variant ?? {}
    const dx = B.x - A.x
    const dy = B.y - A.y
    const adx = Math.abs(dx)
    const ady = Math.abs(dy)
    const sx = Math.sign(dx) || 1
    const sy = Math.sign(dy) || 1

    if (adx >= ady) {
      const diag = ady
      const straight = adx - diag
      const shift = (0.5 - offset * 0.5) * straight
      const x1 = A.x + sx * shift
      const x2 = x1 + sx * diag
      return [A, { x: x1, y: A.y, l: A.l }, { x: x2, y: B.y, l: A.l }, B]
    }
    const diag = adx
    const straight = ady - diag
    const shift = (0.5 - offset * 0.5) * straight
    const y1 = A.y + sy * shift
    const y2 = y1 + sy * diag
    return [A, { x: A.x, y: y1, l: A.l }, { x: B.x, y: y2, l: A.l }, B]
  }),
}

export const corner45: PatternFnDefinition = {
  name: "corner45",
  variants: [{ dir: 1 }, { dir: -1 }],
  fn: presortAB((A, B, variant) => {
    const { dir = 1 } = variant ?? {}
    const dx = B.x - A.x
    const dy = B.y - A.y
    const adx = Math.abs(dx)
    const ady = Math.abs(dy)
    const sx = Math.sign(dx) || 1
    const sy = Math.sign(dy) || 1

    if (adx >= ady) {
      if (dir === 1) {
        return [A, { x: B.x - sx * ady, y: A.y, l: A.l }, B]
      }
      return [A, { x: A.x + sx * ady, y: B.y, l: A.l }, B]
    }
    if (dir === 1) {
      return [A, { x: A.x, y: B.y - sy * adx, l: A.l }, B]
    }
    return [A, { x: B.x, y: A.y + sy * adx, l: A.l }, B]
  }),
}

export const doubleBend45: PatternFnDefinition = {
  name: "doubleBend45",
  variants: [
    ...addXYFlips({ heightFraction: 1 / 4 }),
    ...addXYFlips({ heightFraction: 1 / 2 }),
  ],
  fn: (A, B, variant) => {
    const { yFlip = 1, heightFraction = 0.25 } = variant ?? {}
    const dx = B.x - A.x
    const dy = B.y - A.y
    const adx = Math.abs(dx)
    const ady = Math.abs(dy)

    if (adx >= ady) {
      const sx = Math.sign(dx) || 1
      const h = Math.max(adx * heightFraction, ady + 0.2) * yFlip
      const yMid = A.y + h
      const d1 = Math.abs(yMid - A.y)
      const d2 = Math.abs(yMid - B.y)
      if (d1 + d2 > adx) {
        return [A, { x: A.x, y: yMid, l: A.l }, { x: B.x, y: yMid, l: A.l }, B]
      }
      return [
        A,
        { x: A.x + sx * d1, y: yMid, l: A.l },
        { x: B.x - sx * d2, y: yMid, l: A.l },
        B,
      ]
    }
    const sy = Math.sign(dy) || 1
    const w = Math.max(ady * heightFraction, adx + 0.2) * yFlip
    const xMid = A.x + w
    const d1 = Math.abs(xMid - A.x)
    const d2 = Math.abs(xMid - B.x)
    if (d1 + d2 > ady) {
      return [A, { x: xMid, y: A.y, l: A.l }, { x: xMid, y: B.y, l: A.l }, B]
    }
    return [
      A,
      { x: xMid, y: A.y + sy * d1, l: A.l },
      { x: xMid, y: B.y - sy * d2, l: A.l },
      B,
    ]
  },
}

export const squareCorner45: PatternFnDefinition = {
  name: "squareCorner45",
  variants: [
    ...addXYFlips({ heightFraction: 3 / 4, cornerFraction: 1 / 2 }),
    ...addXYFlips({ heightFraction: 1 / 2, cornerFraction: 1 / 2 }),
    ...addXYFlips({ heightFraction: 1 / 4, cornerFraction: 1 / 2 }),
  ],
  fn: (A, B, variant) => {
    const {
      yFlip = 1,
      heightFraction = 0.5,
      cornerFraction = 0.5,
    } = variant ?? {}
    const dx = B.x - A.x
    const dy = B.y - A.y
    const adx = Math.abs(dx)
    const ady = Math.abs(dy)
    const dist = Math.max(adx, ady, 1)
    const height = dist * heightFraction
    const cornerSize = Math.min(height * cornerFraction, Math.max(adx, ady) / 3)

    if (adx >= ady) {
      const sx = Math.sign(dx) || 1
      const topY =
        (yFlip > 0 ? Math.max(A.y, B.y) : Math.min(A.y, B.y)) + yFlip * height
      if (adx < 2 * cornerSize) return null
      return [
        A,
        { x: A.x, y: topY - yFlip * cornerSize, l: A.l },
        { x: A.x + sx * cornerSize, y: topY, l: A.l },
        { x: B.x - sx * cornerSize, y: topY, l: A.l },
        { x: B.x, y: topY - yFlip * cornerSize, l: A.l },
        B,
      ]
    }
    const sy = Math.sign(dy) || 1
    const sideX =
      (yFlip > 0 ? Math.max(A.x, B.x) : Math.min(A.x, B.x)) + yFlip * height
    if (ady < 2 * cornerSize) return null
    return [
      A,
      { x: sideX - yFlip * cornerSize, y: A.y, l: A.l },
      { x: sideX, y: A.y + sy * cornerSize, l: A.l },
      { x: sideX, y: B.y - sy * cornerSize, l: A.l },
      { x: sideX - yFlip * cornerSize, y: B.y, l: A.l },
      B,
    ]
  },
}

export const overshoot45: PatternFnDefinition = {
  name: "overshoot45",
  variants: addXYFlips({}),
  fn: (A, B, variant) => {
    const { yFlip = 1 } = variant ?? {}
    const dx = B.x - A.x
    const dy = B.y - A.y
    const adx = Math.abs(dx)
    const ady = Math.abs(dy)
    const sx = Math.sign(dx) || 1
    const updist = Math.max(adx, ady) / 2
    const arrowTopY = A.y + yFlip * updist
    const remY = Math.abs(B.y - arrowTopY)
    return [
      A,
      { x: A.x + sx * updist, y: arrowTopY, l: A.l },
      { x: A.x + sx * (updist + remY), y: B.y, l: A.l },
      B,
    ]
  },
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

export const rotationVariantPatternFns: PatternFnDefinition[] = [
  corner45,
  singleBend45,
  gapAndCorner45,
  doubleBend45,
  squareCorner45,
  overshoot45,
]

/**
 * Verify if a segment between two points is strictly orthogonal (0/90 deg) or 45-degree
 */
export const isOrthogonalOr45Segment = (
  A: { x: number; y: number },
  B: { x: number; y: number },
  tolerance = 1e-5,
): boolean => {
  const adx = Math.abs(B.x - A.x)
  const ady = Math.abs(B.y - A.y)
  if (adx <= tolerance && ady <= tolerance) return true
  if (adx <= tolerance || ady <= tolerance) return true
  return Math.abs(adx - ady) <= tolerance
}

/**
 * Verify if every segment in a path is orthogonal or 45-degree
 */
export const isOrthogonalOr45Path = (
  path: Array<{ x: number; y: number }>,
  tolerance = 1e-5,
): boolean => {
  for (let i = 0; i < path.length - 1; i++) {
    if (!isOrthogonalOr45Segment(path[i]!, path[i + 1]!, tolerance)) {
      return false
    }
  }
  return true
}
