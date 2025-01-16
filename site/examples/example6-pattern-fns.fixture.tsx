import { InteractiveSimpleRouteJson } from "site/InteractiveSimpleRouteJson"
import type { SimpleRouteJson } from "lib/types/SimpleRouteJson"
import {
  InteractiveAutorouter,
  type IAutorouterResult,
} from "site/InteractiveAutorouter"
import * as PatternFns from "lib/patterns/pattern-fns"
import { distance } from "lib/algos/distance"
import { useState } from "react"

const simpleRouteJson: SimpleRouteJson = {
  obstacles: [],
  connections: [
    {
      name: "main_connection",
      pointsToConnect: [
        { x: -2, y: -0.5, layer: "top" },
        { x: 2, y: 0.5, layer: "top" },
      ],
    },
  ],
  bounds: {
    minX: -5,
    minY: -3,
    maxX: 5,
    maxY: 3,
  },
  layerCount: 1,
  minTraceWidth: 0.05,
}

const availablePatterns = Object.keys(PatternFns).filter(
  (k) => k !== "applyPatternFn",
)

export default () => {
  const [selectedPattern, setSelectedPattern] = useState<string>("doubleBend45")

  return (
    <div>
      <div className="flex p-2">
        Select a pattern function:
        <select
          value={selectedPattern}
          onChange={(e) => setSelectedPattern(e.target.value)}
        >
          {availablePatterns.map((p) => (
            <option value={p}>{p}</option>
          ))}
        </select>
      </div>
      <InteractiveAutorouter
        defaultSimpleRouteJson={simpleRouteJson}
        svgOnly
        enabledPatternNames={[selectedPattern]}
        showAvailablePatterns={false}
        exploredPatternColor="rgba(0,255,0,1)"
        doAutorouting={(srj, maxSteps) => {
          const [A, B] = srj.connections[0].pointsToConnect as any

          const paths = PatternFns.applyPatternFn(
            PatternFns[selectedPattern as keyof typeof PatternFns] as any,
            A,
            B,
          )

          return {
            iterations: 1,
            exploredPatterns: paths.map((path) => ({
              parentProjectedPattern: null,
              parentSegmentIndex: 0,
              unsolvedSegments: path.flatMap((p, i) => {
                if (i === 0) return []
                return [
                  {
                    A: p,
                    B: path[i - 1],
                    distance: distance(p, path[i - 1]),
                    depth: 0,
                    hasCollision: false,
                  },
                ]
              }),
              solvedSegments: [],
              patternDefinitionsUsed: {},
            })),
            solvedPattern: null,
          } as IAutorouterResult
        }}
      />
    </div>
  )
}
