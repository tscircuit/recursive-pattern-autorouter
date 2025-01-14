import React, { useState, useRef, useEffect } from "react"
const Card = ({ children }) => {
  return <div className="bg-white shadow-md rounded-lg p-4">{children}</div>
}

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

  // PathState type to track state during BFS
  class PathState {
    constructor(points, depth, collisions) {
      this.points = points // Array of points defining the path
      this.depth = depth // Current recursion depth
      this.collisions = collisions // Number of collisions in this path
    }
  }

  // Find path using pattern-checking BFS
  const findPath = (start, end) => {
    // Initialize queue with direct path
    const queue = [new PathState([start, end], 0, 0)]
    let bestPath = [start, end]
    let bestCollisions = Infinity

    while (queue.length > 0) {
      const currentState = queue.shift()

      // Skip if we're too deep
      if (currentState.depth >= 5) continue

      // Check total collisions in current path
      let totalCollisions = 0
      let hasCollisions = false

      // Check each segment for collisions
      for (let i = 0; i < currentState.points.length - 1; i++) {
        const segmentCollisions = obstacles.filter((obstacle) =>
          lineIntersectsRect(
            currentState.points[i],
            currentState.points[i + 1],
            obstacle,
          ),
        ).length

        if (segmentCollisions > 0) hasCollisions = true
        totalCollisions += segmentCollisions
      }

      // Update best path if this one has fewer collisions
      if (totalCollisions < bestCollisions) {
        bestCollisions = totalCollisions
        bestPath = currentState.points
      }

      // If no collisions, this branch is done
      if (!hasCollisions) continue

      // Try applying patterns to each segment
      for (let i = 0; i < currentState.points.length - 1; i++) {
        const segmentStart = currentState.points[i]
        const segmentEnd = currentState.points[i + 1]

        // Skip if this segment has no collisions
        if (
          !obstacles.some((obstacle) =>
            lineIntersectsRect(segmentStart, segmentEnd, obstacle),
          )
        )
          continue

        // Try each pattern on this segment
        patterns.forEach((pattern) => {
          const newSegment = pattern(segmentStart, segmentEnd)

          // Create new path with this segment replaced
          const newPoints = [
            ...currentState.points.slice(0, i),
            ...newSegment.slice(0, -1),
            ...currentState.points.slice(i + 1),
          ]

          // Add new state to queue
          queue.push(
            new PathState(newPoints, currentState.depth + 1, totalCollisions),
          )
        })
      }
    }

    return bestPath
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
