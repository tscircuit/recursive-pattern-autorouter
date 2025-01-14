import { AstarPatternPathFinder } from "lib/algos/AstarPatternPathFinder"
import { distance } from "lib/algos/distance"
import { processObstacles } from "lib/algos/preprocessObstacles"
import type { SimpleRouteJson } from "lib/types/SimpleRouteJson"
import { useState } from "react"
import { InteractiveSimpleRouteJson } from "site/InteractiveSimpleRouteJson"

const doAutorouting = (simpleRouteJson: SimpleRouteJson, maxSteps: number) => {
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
        // jumpsFromA: 0,
        depth: 0,
        distance: distance(
          simpleRouteJson.connections[0]!.pointsToConnect[0]!,
          simpleRouteJson.connections[0]!.pointsToConnect[1]!,
        ),
      },
    ],
    solvedSegments: [],
    patternDefinitionsUsed: {},
    g: 0,
    h: 0,
    f: 0,
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
    <InteractiveSimpleRouteJson
      simpleRouteJson={simpleRouteJson}
      onChangeSimpleRouteJson={setSimpleRouteJson}
    />
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
