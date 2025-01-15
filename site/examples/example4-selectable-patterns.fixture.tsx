import { AstarPatternPathFinder } from "lib/algos/AstarPatternPathFinder"
import { processObstacles } from "lib/algos/preprocessObstacles"
import {
  getPatternName,
  namedPatterns,
  singleLayerPatternSet,
} from "lib/patterns"
import type { SimpleRouteJson } from "lib/types/SimpleRouteJson"
import { useState } from "react"
import { InteractiveAutorouter } from "site/InteractiveAutorouter"
import type { PatternDefinition } from "lib/patterns"

const doAutorouting = (
  simpleRouteJson: SimpleRouteJson,
  maxSteps: number,
  enabledPatterns: PatternDefinition[],
) => {
  const autorouter = new AstarPatternPathFinder()
  autorouter.patternDefinitions = enabledPatterns

  autorouter.processedObstacles = processObstacles(simpleRouteJson.obstacles)
  autorouter.obstacleMask = autorouter.processedObstacles.map((_) => true)

  autorouter.init({
    A: simpleRouteJson.connections[0]!.pointsToConnect[0]!,
    B: simpleRouteJson.connections[0]!.pointsToConnect[1]!,
  })

  autorouter.patternDefinitions = enabledPatterns

  for (let i = 0; i < maxSteps; i++) {
    if (autorouter.solvedPattern) break
    autorouter.solveOneStep()
  }

  return {
    exploredPatterns: autorouter.exploredPatterns,
    solvedPattern: autorouter.solvedPattern,
    iterations: autorouter.iterations,
  }
}

export default () => {
  const [enabledPatterns, setEnabledPatterns] = useState<
    Record<number, boolean>
  >(
    Object.fromEntries(
      namedPatterns.map((pattern) => [getPatternName(pattern), true]),
    ),
  )

  const handlePatternToggle = (pattern: PatternDefinition) => {
    setEnabledPatterns((prev) => ({
      ...prev,
      [getPatternName(pattern)]: !prev[pattern],
    }))
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <InteractiveAutorouter
            defaultSimpleRouteJson={initialSimpleRouteJson}
            onTogglePattern={handlePatternToggle}
            doAutorouting={(json, maxSteps) =>
              doAutorouting(
                json,
                maxSteps,
                singleLayerPatternSet.filter((_, i) => enabledPatterns[i]),
              )
            }
          />
        </div>
      </div>
    </div>
  )
}

export const initialSimpleRouteJson: SimpleRouteJson = {
  bounds: {
    minX: -5,
    maxX: 5,
    minY: -3,
    maxY: 3,
  },
  obstacles: [],
  connections: [
    {
      name: "connectivity_net13",
      pointsToConnect: [
        {
          x: 4,
          y: 0,
          layer: "top",
        },
        {
          x: -4,
          y: 0,
          layer: "top",
        },
      ],
    },
  ],
  layerCount: 2,
  minTraceWidth: 0.1,
}
