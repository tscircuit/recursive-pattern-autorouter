import { useRef, useState } from "react"
import { compose, applyToPoint, scale, translate } from "transformation-matrix"
import type { PointWithLayer, SimpleRouteJson } from "lib/types/SimpleRouteJson"

interface Props {
  simpleRouteJson: SimpleRouteJson
  onChangeSimpleRouteJson?: (json: SimpleRouteJson) => void
  svgSize?: { width: number; height: number }
  iterations?: number
}

export const InteractiveSimpleRouteJson = ({
  simpleRouteJson,
  onChangeSimpleRouteJson,
  svgSize,
  iterations,
}: Props) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [draggedPoint, setDraggedPoint] = useState<{
    connectionIndex: number
    pointIndex: number
  } | null>(null)
  const [isDrawingObstacle, setIsDrawingObstacle] = useState(false)
  const [obstacleStart, setObstacleStart] = useState<{
    x: number
    y: number
  } | null>(null)

  // Calculate SVG viewport and transforms
  const padding = 20
  const boundsWidth = simpleRouteJson.bounds.maxX - simpleRouteJson.bounds.minX
  const boundsHeight = simpleRouteJson.bounds.maxY - simpleRouteJson.bounds.minY

  // Target SVG dimensions
  const svgWidth = svgSize?.width ?? 800
  const svgHeight = svgSize?.height ?? 500

  // Calculate scale to fit bounds in SVG while maintaining aspect ratio
  const scale_factor = Math.min(
    (svgWidth - padding * 2) / boundsWidth,
    (svgHeight - padding * 2) / boundsHeight,
  )

  // Create transform matrices
  const toSvgSpace = compose(
    translate(padding, svgHeight - padding),
    scale(scale_factor, -scale_factor),
    translate(-simpleRouteJson.bounds.minX, -simpleRouteJson.bounds.minY),
  )

  const toPcbSpace = compose(
    translate(simpleRouteJson.bounds.minX, simpleRouteJson.bounds.minY),
    scale(1 / scale_factor, -1 / scale_factor),
    translate(-padding, -svgHeight + padding),
  )

  // Transform helpers
  const transformPoint = (point: { x: number; y: number }) => {
    const transformed = applyToPoint(toSvgSpace, point)
    return transformed
  }

  const untransformPoint = (point: { x: number; y: number }) => {
    const transformed = applyToPoint(toPcbSpace, point)
    return transformed
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!svgRef.current) return

    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking near any connection points
    const clickRadius = 10
    for (let i = 0; i < simpleRouteJson.connections.length; i++) {
      const connection = simpleRouteJson.connections[i]
      for (let j = 0; j < connection.pointsToConnect.length; j++) {
        const point = connection.pointsToConnect[j]
        const transformedPoint = transformPoint(point)
        if (
          Math.hypot(x - transformedPoint.x, y - transformedPoint.y) <
          clickRadius
        ) {
          setDraggedPoint({ connectionIndex: i, pointIndex: j })
          return
        }
      }
    }

    // If not dragging a point, start drawing obstacle
    if (!draggedPoint) {
      setIsDrawingObstacle(true)
      setObstacleStart({ x, y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!svgRef.current || (!draggedPoint && !isDrawingObstacle)) return

    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (draggedPoint) {
      const newJson = { ...simpleRouteJson }
      const point = untransformPoint({ x, y })
      newJson.connections[draggedPoint.connectionIndex].pointsToConnect[
        draggedPoint.pointIndex
      ] = {
        ...newJson.connections[draggedPoint.connectionIndex].pointsToConnect[
          draggedPoint.pointIndex
        ],
        x: point.x,
        y: point.y,
      }
      onChangeSimpleRouteJson?.(newJson)
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDrawingObstacle && obstacleStart && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Create new obstacle
      const start = untransformPoint(obstacleStart)
      const end = untransformPoint({ x, y })
      const width = Math.abs(end.x - start.x)
      const height = Math.abs(end.y - start.y)

      if (width > 0.1 && height > 0.1) {
        const newObstacle = {
          type: "rect" as const,
          layers: ["top"],
          center: {
            x: (start.x + end.x) / 2,
            y: (start.y + end.y) / 2,
          },
          width,
          height,
          connectedTo: [], // Add required property
        }

        onChangeSimpleRouteJson?.({
          ...simpleRouteJson,
          obstacles: [...simpleRouteJson.obstacles, newObstacle],
        })
      }
    }

    setDraggedPoint(null)
    setIsDrawingObstacle(false)
    setObstacleStart(null)
  }

  return (
    <svg
      ref={svgRef}
      width={svgWidth}
      height={svgHeight}
      className="border rounded"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
    >
      <text
        x={10}
        y={20}
        fontSize={12}
        style={{
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        Iterations: {iterations}
      </text>
      {/* Draw obstacles */}
      {simpleRouteJson.obstacles.map((obstacle, i) => {
        if (obstacle.type === "rect") {
          const topLeft = transformPoint({
            x: obstacle.center.x - obstacle.width / 2,
            y: obstacle.center.y + obstacle.height / 2,
          })
          return (
            <rect
              key={i}
              x={topLeft.x}
              y={topLeft.y}
              width={obstacle.width * scale_factor}
              height={obstacle.height * scale_factor}
              fill={
                obstacle.connectedTo.some((id) =>
                  simpleRouteJson.connections.some((conn) => conn.name === id),
                )
                  ? "#86efac"
                  : "#fca5a5"
              }
              stroke={
                obstacle.connectedTo.some((id) =>
                  simpleRouteJson.connections.some((conn) => conn.name === id),
                )
                  ? "#22c55e"
                  : "#dc2626"
              }
            />
          )
        }
        return null
      })}

      {/* Draw traces */}
      {simpleRouteJson.traces?.map((trace, i) => (
        <g key={i}>
          {trace.route.map((segment, j) => {
            if (segment.route_type === "wire") {
              const start = transformPoint({ x: segment.x, y: segment.y })
              const next = trace.route[j + 1]
              if (next && next.route_type === "wire") {
                const end = transformPoint({ x: next.x, y: next.y })
                return (
                  <line
                    key={j}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={(trace as any).color ?? "#3B82F6"}
                    strokeWidth={segment.width * scale_factor}
                    strokeOpacity={0.5}
                  />
                )
              }
            } else if (segment.route_type === "via") {
              const pos = transformPoint({ x: segment.x, y: segment.y })
              return (
                <circle
                  key={j}
                  cx={pos.x}
                  cy={pos.y}
                  r={simpleRouteJson.minTraceWidth * scale_factor}
                  fill="#9333EA"
                />
              )
            }
            return null
          })}
        </g>
      ))}

      {/* Draw connections */}
      {simpleRouteJson.connections.map((connection, i) => (
        <g key={i}>
          {connection.pointsToConnect.map((point, j) => {
            const transformedPoint = transformPoint(point)
            return (
              <circle
                key={j}
                cx={transformedPoint.x}
                cy={transformedPoint.y}
                r="4"
                fill={j === 0 ? "#DC2626" : "#16A34A"}
              />
            )
          })}
          {connection.pointsToConnect.length === 2 && (
            <line
              x1={transformPoint(connection.pointsToConnect[0]).x}
              y1={transformPoint(connection.pointsToConnect[0]).y}
              x2={transformPoint(connection.pointsToConnect[1]).x}
              y2={transformPoint(connection.pointsToConnect[1]).y}
              stroke="#3B82F6"
              opacity={0.5}
              strokeWidth="3"
              strokeDasharray="4"
            />
          )}
        </g>
      ))}

      {/* Draw obstacle preview while dragging */}
      {isDrawingObstacle && obstacleStart && (
        <rect
          x={Math.min(
            obstacleStart.x,
            transformPoint(
              untransformPoint({ x: obstacleStart.x, y: obstacleStart.y }),
            ).x,
          )}
          y={Math.min(
            obstacleStart.y,
            transformPoint(
              untransformPoint({ x: obstacleStart.x, y: obstacleStart.y }),
            ).y,
          )}
          width={Math.abs(
            obstacleStart.x -
              transformPoint(
                untransformPoint({ x: obstacleStart.x, y: obstacleStart.y }),
              ).x,
          )}
          height={Math.abs(
            obstacleStart.y -
              transformPoint(
                untransformPoint({ x: obstacleStart.x, y: obstacleStart.y }),
              ).y,
          )}
          fill="none"
          stroke="#64748B"
          strokeDasharray="4"
        />
      )}
    </svg>
  )
}
