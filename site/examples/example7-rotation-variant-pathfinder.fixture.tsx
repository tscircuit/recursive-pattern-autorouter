import { InteractiveSimpleRouteJson } from "site/InteractiveSimpleRouteJson"
import type { SimpleRouteJson } from "lib/types/SimpleRouteJson"
import {
  InteractiveAutorouter,
  type IAutorouterResult,
} from "site/InteractiveAutorouter"
import * as PatternFns from "lib/patterns/pattern-fns"
import { distance } from "lib/algos/distance"
import { useState } from "react"
import { AstarPatternFnPathFinder } from "lib/algos/AstarPatternFnPathFinder"
import { processObstacles } from "lib/algos/preprocessObstacles"
import useLocalStorageState from "use-local-storage-state"

const initialSimpleRouteJson: SimpleRouteJson = {
  obstacles: [],
  connections: [
    {
      name: "main_connection",
      pointsToConnect: [
        { x: -4, y: 0, layer: "top" },
        { x: 4, y: 0, layer: "top" },
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
  const [simpleRouteJson, setSimpleRouteJson] = useLocalStorageState("srj", {
    defaultValue: initialSimpleRouteJson,
  })
  return (
    <div>
      <InteractiveAutorouter
        defaultSimpleRouteJson={simpleRouteJson}
        onChangeSimpleRouteJson={setSimpleRouteJson}
        defaultMaxSteps={100}
        showAvailablePatterns={false}
        // enabledPatternNames={[selectedPattern]}
        doAutorouting={(srj, maxSteps) => {
          const autorouter = new AstarPatternFnPathFinder()
          autorouter.patternFns = [
            PatternFns.corner45,
            PatternFns.doubleBend45,
            PatternFns.squareCorner45,
            // PatternFns.overshoot45,
            PatternFns.singleBend45,
            PatternFns.gapAndCorner45,
          ]

          autorouter.processedObstacles = processObstacles(srj.obstacles)
          autorouter.obstacleMask = autorouter.processedObstacles.map(
            (_) => true,
          )

          autorouter.init({
            A: srj.connections[0]!.pointsToConnect[0]!,
            B: srj.connections[0]!.pointsToConnect[1]!,
          })

          for (let i = 0; i < maxSteps; i++) {
            if (autorouter.solvedPattern) break
            autorouter.solveOneStep()
          }

          return {
            exploredPatterns: autorouter.exploredPatterns,
            solvedPattern: autorouter.solvedPattern,
            iterations: autorouter.iterations,
          }
        }}
      />
    </div>
  )
}
