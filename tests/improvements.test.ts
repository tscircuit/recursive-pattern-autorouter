import { expect, test } from "bun:test"
import { AstarPatternFnPathFinder } from "lib/algos/AstarPatternFnPathFinder"
import { AstarPatternPathFinder } from "lib/algos/AstarPatternPathFinder"
import {
  canPatternOvercomeObstacle,
  getIntersectionObstacleSize,
} from "lib/algos/doesIntersect"
import { processObstacles } from "lib/algos/preprocessObstacles"
import {
  applyPatternFn,
  getScaleVariantPatterns,
  isOrthogonalOr45Path,
  isOrthogonalOr45Segment,
  largeScalePatternSet,
  mediumScalePatternSet,
  rotationVariantPatternFns,
  smallScalePatternSet,
  ultraWideArrow,
  wideArrow,
} from "lib/patterns"

test("returns obstacle size on intersection and filters patterns that cannot overcome it", () => {
  const obstacles = processObstacles([
    {
      type: "rect",
      layers: ["top"],
      center: { x: 0, y: 0 },
      width: 2.0,
      height: 2.0,
      connectedTo: ["net1"],
    },
  ])
  const mask = [true]
  const A = { x: -3, y: 0, l: 0 }
  const B = { x: 3, y: 0, l: 0 }

  const info = getIntersectionObstacleSize(A, B, obstacles, mask)
  expect(info).not.toBeNull()
  expect(info!.width).toBe(2.0)
  expect(info!.height).toBe(2.0)
  expect(info!.maxDimension).toBe(2.0)
  expect(info!.perpendicularExtent).toBe(1.0)

  // Segment length is 6:
  // ultraWideArrow has y = 1/8 -> max offset = 6 * 0.125 = 0.75 < 1.0 (cannot overcome)
  // wideArrow has y = 1/3 -> max offset = 6 * (1/3) = 2.0 >= 1.0 (can overcome)
  expect(canPatternOvercomeObstacle(ultraWideArrow, 6, info)).toBe(false)
  expect(canPatternOvercomeObstacle(wideArrow, 6, info)).toBe(true)

  const pathFinder = new AstarPatternPathFinder()
  pathFinder.processedObstacles = obstacles
  pathFinder.obstacleMask = mask
  pathFinder.filterByObstacleSize = true
  pathFinder.init({ A, B })
  const solved = pathFinder.solve()
  expect(solved).not.toBeNull()
  expect(solved!.unsolvedSegments.length).toBe(0)
})

test("selects scale-variant pattern sets based on segment distance", () => {
  expect(getScaleVariantPatterns(0.8)).toBe(smallScalePatternSet)
  expect(getScaleVariantPatterns(3.0)).toBe(mediumScalePatternSet)
  expect(getScaleVariantPatterns(8.0)).toBe(largeScalePatternSet)

  const obstacles = processObstacles([
    {
      type: "rect",
      layers: ["top"],
      center: { x: 0, y: 0 },
      width: 0.4,
      height: 0.4,
      connectedTo: ["net1"],
    },
  ])
  const pathFinder = new AstarPatternPathFinder()
  pathFinder.processedObstacles = obstacles
  pathFinder.obstacleMask = [true]
  pathFinder.useScaleVariantPatterns = true
  pathFinder.init({
    A: { x: -0.6, y: 0, l: 0 },
    B: { x: 0.6, y: 0, l: 0 },
  })
  const solved = pathFinder.solve()
  expect(solved).not.toBeNull()
})

test("rotation-variant pattern functions and AstarPatternFnPathFinder only output orthogonal or 45-degree traces", () => {
  const A = { x: -3, y: -0.5, l: 0 }
  const B = { x: 3, y: 1.5, l: 0 }

  for (const patternFn of rotationVariantPatternFns) {
    const paths = applyPatternFn(patternFn, A, B)
    expect(paths.length).toBeGreaterThan(0)
    for (const path of paths) {
      expect(isOrthogonalOr45Path(path)).toBe(true)
    }
  }

  const obstacles = processObstacles([
    {
      type: "rect",
      layers: ["top"],
      center: { x: 0, y: 0 },
      width: 1.0,
      height: 1.0,
      connectedTo: ["obs1"],
    },
  ])

  const fnFinder = new AstarPatternFnPathFinder()
  fnFinder.processedObstacles = obstacles
  fnFinder.obstacleMask = [true]
  fnFinder.init({
    A: { x: -3, y: 0, l: 0 },
    B: { x: 3, y: 0, l: 0 },
  })
  const solved = fnFinder.solve()
  expect(solved).not.toBeNull()
  expect(solved!.unsolvedSegments.length).toBe(0)
  for (const seg of solved!.solvedSegments) {
    expect(isOrthogonalOr45Segment(seg.A, seg.B)).toBe(true)
  }
})
