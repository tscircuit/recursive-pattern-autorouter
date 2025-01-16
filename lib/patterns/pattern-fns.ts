import type { PointWithLayer2 } from "lib/types/SimpleRouteJson"

/**
 * Pattern functions return a list of points from A to B that make
 * up the pattern.
 */
type PatternFn = (
  A: PointWithLayer2,
  B: PointWithLayer2,
  variant?: any,
) => PointWithLayer2[] | null

type PatternFnDefinition = {
  name: string

  variants?: any[]

  fn: PatternFn
}

/**
 * Makes sure A is always on left and B is always on right
 *
 * If vertical, A.y < B.y
 */
const presortAB =
  (fn: PatternFn) => (A: PointWithLayer2, B: PointWithLayer2) => {
    if (A.x > B.x) {
      return fn(B, A)
    }
    if (A.x === B.x) {
      if (A.y < B.y) {
        return fn(B, A)
      }
    }
    return fn(A, B)
  }

export const cornerPatternFn: PatternFnDefinition = {
  name: "corner45",

  variants: [{ cornerSizeFraction: 1 / 2 }, { cornerSizeFraction: 1 / 4 }],

  fn: presortAB((A, B, variant) => {
    const { cornerSizeFraction } = variant!
    const dx = B.x - A.x
    const dy = B.y - A.y

    const shortestDist = Math.min(Math.abs(dx), Math.abs(dy))

    return [
      A,
      { x: A.x + dx * (1 - cornerSize), y: A.y },

      B,
    ]
  }),
}
