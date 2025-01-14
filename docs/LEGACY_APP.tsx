import React, { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"

// Utility functions
const getDist = (p1, p2) => {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

const getUnitVector = (p1, p2) => {
  const dist = getDist(p1, p2)
  return {
    x: (p2.x - p1.x) / dist,
    y: (p2.y - p1.y) / dist,
  }
}

const getMidPoint = (p1, p2) => ({
  x: (p1.x + p2.x) / 2,
  y: (p1.y + p2.y) / 2,
})

// Pattern definitions
const patterns = [
  // Direct line (base case)
  (A, B) => [A, B],

  // Pattern 1: Upper curve
  (A, B) => {
    const unitVector = getUnitVector(A, B)
    const dist = getDist(A, B)
    const middlePoint = getMidPoint(A, B)
    return [
      A,
      {
        x: middlePoint.x - (unitVector.y * dist) / 3,
        y: middlePoint.y + (unitVector.x * dist) / 3,
      },
      B,
    ]
  },

  // Pattern 2: Lower curve
  (A, B) => {
    const unitVector = getUnitVector(A, B)
    const dist = getDist(A, B)
    const middlePoint = getMidPoint(A, B)
    return [
      A,
      {
        x: middlePoint.x + (unitVector.y * dist) / 3,
        y: middlePoint.y - (unitVector.x * dist) / 3,
      },
      B,
    ]
  },

  // Pattern 3: Double bend
  (A, B) => {
    const third = getDist(A, B) / 3
    const unitVector = getUnitVector(A, B)
    return [
      A,
      {
        x: A.x + unitVector.x * third - unitVector.y * third,
        y: A.y + unitVector.y * third + unitVector.x * third,
      },
      {
        x: B.x - unitVector.x * third - unitVector.y * third,
        y: B.y - unitVector.y * third + unitVector.x * third,
      },
      B,
    ]
  },
]

// Component to visualize a single pattern
const PatternPreview = ({ pattern, index }) => {
  const start = { x: 30, y: 40 }
  const end = { x: 120, y: 40 }
  const path = pattern(start, end)

  return (
    <div className="border rounded p-4">
      <div className="text-sm font-medium mb-2">Pattern {index}</div>
      <svg width="150" height="80">
        {/* Draw the pattern path */}
        <path
          d={`M ${path.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
          stroke="#3B82F6"
          strokeWidth="2"
          fill="none"
        />

        {/* Draw start and end points */}
        <circle cx={start.x} cy={start.y} r="4" fill="#DC2626" />
        <circle cx={end.x} cy={end.y} r="4" fill="#16A34A" />
      </svg>
    </div>
  )
}

// Line segment intersection check
const lineIntersectsRect = (p1, p2, rect) => {
  const lines = [
    [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
    ],
    [
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
    ],
    [
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height },
    ],
    [
      { x: rect.x, y: rect.y + rect.height },
      { x: rect.x, y: rect.y },
    ],
  ]

  return lines.some(([r1, r2]) => {
    const denominator =
      (r2.y - r1.y) * (p2.x - p1.x) - (r2.x - r1.x) * (p2.y - p1.y)
    if (denominator === 0) return false

    const ua =
      ((r2.x - r1.x) * (p1.y - r1.y) - (r2.y - r1.y) * (p1.x - r1.x)) /
      denominator
    const ub =
      ((p2.x - p1.x) * (p1.y - r1.y) - (p2.y - p1.y) * (p1.x - r1.x)) /
      denominator

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1
  })
}

const PathFinder = () => {
  const [pointA, setPointA] = useState({ x: 50, y: 150 })
  const [pointB, setPointB] = useState({ x: 350, y: 150 })
  const [obstacles, setObstacles] = useState([])
  const [path, setPath] = useState([])
  const [draggedPoint, setDraggedPoint] = useState(null)
  const [isDrawingObstacle, setIsDrawingObstacle] = useState(false)
  const [obstacleStart, setObstacleStart] = useState(null)
  const canvasRef = useRef(null)

  // Find path using pattern-checking A*
  const findPath = (start, end, depth = 0) => {
    if (depth >= 5) return [start, end] // Max recursion depth

    // Check if direct path is clear
    const hasCollision = obstacles.some((obstacle) =>
      lineIntersectsRect(start, end, obstacle),
    )

    if (!hasCollision) return [start, end]

    // Try all patterns and evaluate their total path quality after recursive resolution
    let bestFinalPath = null
    let minTotalCollisions = Infinity

    patterns.forEach((pattern) => {
      const initialPath = pattern(start, end)

      // For each pattern, recursively resolve all its segments
      const resolvedSegments = []
      let totalCollisions = 0

      for (let i = 0; i < initialPath.length - 1; i++) {
        const segmentStart = initialPath[i]
        const segmentEnd = initialPath[i + 1]

        // Check if this segment has collisions
        const segmentCollisions = obstacles.filter((obstacle) =>
          lineIntersectsRect(segmentStart, segmentEnd, obstacle),
        ).length

        if (segmentCollisions > 0) {
          // Recursively resolve this segment
          const resolvedSegment = findPath(segmentStart, segmentEnd, depth + 1)
          resolvedSegments.push(
            ...(i === 0 ? resolvedSegment : resolvedSegment.slice(1)),
          )

          // Count remaining collisions after resolution
          for (let j = 0; j < resolvedSegment.length - 1; j++) {
            totalCollisions += obstacles.filter((obstacle) =>
              lineIntersectsRect(
                resolvedSegment[j],
                resolvedSegment[j + 1],
                obstacle,
              ),
            ).length
          }
        } else {
          // No collisions, keep segment as is
          resolvedSegments.push(
            ...(i === 0 ? [segmentStart, segmentEnd] : [segmentEnd]),
          )
        }
      }

      if (totalCollisions < minTotalCollisions) {
        minTotalCollisions = totalCollisions
        bestFinalPath = resolvedSegments
      }
    })

    return bestFinalPath || [start, end]
  }

  // Update path when points or obstacles change
  useEffect(() => {
    setPath(findPath(pointA, pointB))
  }, [pointA, pointB, obstacles])

  // Handle mouse events
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking near points A or B
    const clickRadius = 10
    if (getDist({ x, y }, pointA) < clickRadius) {
      setDraggedPoint("A")
      return
    }
    if (getDist({ x, y }, pointB) < clickRadius) {
      setDraggedPoint("B")
      return
    }

    // Start drawing obstacle
    setIsDrawingObstacle(true)
    setObstacleStart({ x, y })
  }

  const handleMouseMove = (e) => {
    if (!draggedPoint && !isDrawingObstacle) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (draggedPoint === "A") {
      setPointA({ x, y })
    } else if (draggedPoint === "B") {
      setPointB({ x, y })
    }
  }

  const handleMouseUp = (e) => {
    if (isDrawingObstacle && obstacleStart) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Create new obstacle
      const newObstacle = {
        x: Math.min(obstacleStart.x, x),
        y: Math.min(obstacleStart.y, y),
        width: Math.abs(x - obstacleStart.x),
        height: Math.abs(y - obstacleStart.y),
      }

      if (newObstacle.width > 5 && newObstacle.height > 5) {
        setObstacles([...obstacles, newObstacle])
      }
    }

    setDraggedPoint(null)
    setIsDrawingObstacle(false)
    setObstacleStart(null)
  }

  return (
    <>
      <Card className="p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            Pattern Checking A* Pathfinder
          </h2>
          <p className="text-sm text-gray-600">
            Drag points A and B to move them. Click and drag on the canvas to
            create obstacles.
          </p>
        </div>
        <svg
          ref={canvasRef}
          className="w-full border rounded"
          height="400"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Draw obstacles */}
          {obstacles.map((obstacle, i) => (
            <rect
              key={i}
              x={obstacle.x}
              y={obstacle.y}
              width={obstacle.width}
              height={obstacle.height}
              fill="#CBD5E1"
              stroke="#64748B"
            />
          ))}

          {/* Draw path */}
          {path.length > 1 && (
            <path
              d={`M ${path.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
              stroke="#3B82F6"
              strokeWidth="2"
              fill="none"
            />
          )}

          {/* Draw points A and B */}
          <circle cx={pointA.x} cy={pointA.y} r="6" fill="#DC2626" />
          <text x={pointA.x + 10} y={pointA.y} className="text-sm">
            A
          </text>

          <circle cx={pointB.x} cy={pointB.y} r="6" fill="#16A34A" />
          <text x={pointB.x + 10} y={pointB.y} className="text-sm">
            B
          </text>

          {/* Draw obstacle preview while dragging */}
          {isDrawingObstacle && obstacleStart && (
            <rect
              x={Math.min(obstacleStart.x, pointB.x)}
              y={Math.min(obstacleStart.y, pointB.y)}
              width={Math.abs(pointB.x - obstacleStart.x)}
              height={Math.abs(pointB.y - obstacleStart.y)}
              fill="none"
              stroke="#64748B"
              strokeDasharray="4"
            />
          )}
        </svg>
      </Card>

      {/* Pattern visualization card */}
      <Card className="p-4 mt-4">
        <h2 className="text-lg font-semibold mb-4">Available Patterns</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {patterns.map((pattern, index) => (
            <PatternPreview key={index} pattern={pattern} index={index} />
          ))}
        </div>
      </Card>
    </>
  )
}

export default PathFinder
