import {
  AstarPatternPathFinder,
  type ProjectedPattern,
  type Segment,
} from "lib/algos/GeneralizedAstar2"
import { processObstacles } from "lib/algos/preprocessObstacles"
import { RecursivePatternAutorouter } from "lib/solvers/RecursivePatternAutorouter/RecursivePatternAutorouter"
import type {
  RouteWire,
  SimpleRouteJson,
  Trace,
} from "lib/types/SimpleRouteJson"
import { useEffect, useMemo, useState } from "react"
import { InteractiveAutorouter } from "site/InteractiveAutorouter"

function getAllSegmentsFromSolvedPattern(
  solvedPattern: ProjectedPattern,
): Segment[] {
  if (!solvedPattern) return []
  return [...solvedPattern.solvedSegments, ...solvedPattern.unsolvedSegments]
}

function convertSegmentsToTraces(segments: Segment[], color?: string): Trace[] {
  return segments.map((segment) => ({
    route: [segment.A, segment.B].map((p) => ({
      route_type: "wire" as const,
      x: p.x,
      y: p.y,
      width: 0.1,
      layer: "top",
    })),
    color,
  }))
}

export default () => {
  const [simpleRouteJson, setSimpleRouteJson] = useState(initialSimpleRouteJson)
  const [maxSteps, setMaxSteps] = useState(1)
  const [isAnimating, setIsAnimating] = useState(true)
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setFrame((f) => f + 1)
      }, 100)
      return () => clearInterval(interval)
    }
  }, [isAnimating])

  const { exploredPatterns, solvedPattern, autorouter } = useMemo(() => {
    const autorouter = new AstarPatternPathFinder()

    autorouter.processedObstacles = processObstacles(simpleRouteJson.obstacles)
    autorouter.obstacleMask = autorouter.processedObstacles.map((_) => true)

    autorouter.openSet.push({
      parentProjectedPattern: null,
      parentSegmentIndex: -1,

      unsolvedSegments: [
        {
          A: { ...simpleRouteJson.connections[0]!.pointsToConnect[0]!, l: 0 },
          B: { ...simpleRouteJson.connections[0]!.pointsToConnect[1]!, l: 0 },
          hasCollision: true,
          depth: 0,
        },
      ],
      solvedSegments: [],

      g: 0,
      h: 0,
      f: 0,
    })

    for (let i = 0; i < maxSteps; i++) {
      if (autorouter.solvedPattern) break
      autorouter.solveOneStep()
    }

    const solvedPattern = autorouter.solvedPattern
    return {
      exploredPatterns: autorouter.exploredPatterns,
      solvedPattern,
      autorouter,
    }
  }, [maxSteps, simpleRouteJson])

  const purplePattern = !isAnimating
    ? exploredPatterns[maxSteps - 1]
    : autorouter.exploredPatterns[frame % autorouter.exploredPatterns.length]

  const greenPattern = [...autorouter.exploredPatterns].sort(
    (a, b) => b.f! - a.f!,
  )[0]

  const traces: Trace[] = convertSegmentsToTraces(
    getAllSegmentsFromSolvedPattern(solvedPattern!),
  )

  traces.push(
    ...convertSegmentsToTraces(
      getAllSegmentsFromSolvedPattern(purplePattern!),
      "rgba(255,0,255,0.5)",
    ),
  )

  traces.push(
    ...convertSegmentsToTraces(
      getAllSegmentsFromSolvedPattern(greenPattern!),
      "rgba(0,255,0,0.5)",
    ),
  )

  console.log({
    solvedPattern,
    traces,
  })

  return (
    <>
      <InteractiveAutorouter
        simpleRouteJson={{ ...simpleRouteJson, traces }}
        onChangeSimpleRouteJson={(json) => {
          setSimpleRouteJson(json)
        }}
      />
      <div style={{ marginTop: 20 }}>
        <div className="p-2">Iterations: {autorouter.iterations}</div>
        <button
          className="border border-gray-300 rounded-md px-2 py-1"
          onClick={() => {
            if (maxSteps > 0) {
              setMaxSteps(maxSteps - 1)
            }
          }}
        >
          Decrease Max Steps
        </button>
        <span style={{ margin: "0 10px" }}>Max Steps: {maxSteps}</span>
        <button
          className="border border-gray-300 rounded-md px-2 py-1"
          onClick={() => {
            setMaxSteps(maxSteps + 1)
          }}
        >
          Max Steps + 1
        </button>
        <button
          className="border border-gray-300 rounded-md px-2 py-1"
          onClick={() => {
            setMaxSteps(maxSteps + 10)
          }}
        >
          Max Steps + 10
        </button>
        <button
          className="border border-gray-300 rounded-md px-2 py-1"
          onClick={() => {
            setIsAnimating(!isAnimating)
          }}
        >
          {isAnimating ? "Stop" : "Start"} Animating
        </button>
      </div>
    </>
  )
}

export const initialSimpleRouteJson: SimpleRouteJson = {
  bounds: {
    minX: -4.8,
    maxX: 4.8,
    minY: -1.3,
    maxY: 1.3,
  },
  obstacles: [
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 2.5,
        y: 0,
      },
      width: 0.6000000000000001,
      height: 0.6000000000000001,
      connectedTo: ["connectivity_net13"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 3.5,
        y: 0,
      },
      width: 0.6000000000000001,
      height: 0.6000000000000001,
      connectedTo: ["connectivity_net11"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -3.5,
        y: 0,
      },
      width: 0.6000000000000001,
      height: 0.6000000000000001,
      connectedTo: ["connectivity_net13"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -2.5,
        y: 0,
      },
      width: 0.6000000000000001,
      height: 0.6000000000000001,
      connectedTo: ["connectivity_net12"],
    },
  ],
  connections: [
    {
      name: "connectivity_net13",
      pointsToConnect: [
        {
          x: 2.5,
          y: 3,
          layer: "top",
        },
        {
          x: -3.5,
          y: 3,
          layer: "top",
        },
      ],
    },
  ],
  layerCount: 2,
  minTraceWidth: 0.1,
}
