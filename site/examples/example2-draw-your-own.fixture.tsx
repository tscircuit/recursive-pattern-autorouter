import { AstarPatternPathFinder } from "lib/algos/AstarPatternPathFinder"
import { distance } from "lib/algos/distance"
import { processObstacles } from "lib/algos/preprocessObstacles"
import type { SimpleRouteJson } from "lib/types/SimpleRouteJson"
import { useState } from "react"
import { InteractiveAutorouter } from "site/InteractiveAutorouter"
import { InteractiveSimpleRouteJson } from "site/InteractiveSimpleRouteJson"

const doAutorouting = (simpleRouteJson: SimpleRouteJson, maxSteps: number) => {
  const autorouter = new AstarPatternPathFinder()

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
  const [simpleRouteJson, setSimpleRouteJson] = useState(initialSimpleRouteJson)

  return (
    <InteractiveAutorouter
      defaultSimpleRouteJson={simpleRouteJson}
      doAutorouting={doAutorouting}
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
