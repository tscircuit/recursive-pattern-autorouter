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
    Record<string, boolean>
  >(
    Object.fromEntries(
      Object.keys(namedPatterns).map((patternName) => [patternName, true]),
    ),
  )

  const handlePatternToggle = (pattern: PatternDefinition) => {
    setEnabledPatterns((prev) => ({
      ...prev,
      [getPatternName(pattern)!]: !prev[getPatternName(pattern)!],
    }))
  }

  return (
    <InteractiveAutorouter
      defaultSimpleRouteJson={initialSimpleRouteJson}
      onTogglePattern={handlePatternToggle}
      patternDefinitions={Object.values(namedPatterns)}
      doAutorouting={(json, maxSteps) =>
        doAutorouting(
          json,
          maxSteps,
          Object.values(namedPatterns).filter(
            (p) => enabledPatterns[getPatternName(p)!],
          ),
        )
      }
    />
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
