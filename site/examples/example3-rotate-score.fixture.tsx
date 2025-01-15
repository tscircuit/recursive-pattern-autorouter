import { AstarPatternPathFinder } from "lib/algos/AstarPatternPathFinder"
import { distance } from "lib/algos/distance"
import { processObstacles } from "lib/algos/preprocessObstacles"
import { singleLayerPatternSet } from "lib/patterns"
import type { SimpleRouteJson } from "lib/types/SimpleRouteJson"
import { useReducer } from "react"
import { InteractiveAutorouter } from "site/InteractiveAutorouter"
import Patterns from "site/Patterns"

export default () => {
  const [wins, incWins] = useReducer(
    (state: number, action: void) => state + 1,
    0,
  )

  const [losses, incLosses] = useReducer(
    (state: number, action: void) => state + 1,
    0,
  )

  const outerPoints = [0, 5, 10, 12, 15, 20, 25, 30, 32, 35, 40, 45].map(
    (deg) => ({
      x: Math.cos(deg * (Math.PI / 180)) * 4,
      y: Math.sin(deg * (Math.PI / 180)) * 4,
    }),
  )

  const doAutorouting = (
    simpleRouteJson: SimpleRouteJson,
    maxSteps: number,
  ) => {
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

    if (autorouter.solvedPattern) {
      incWins()
    } else {
      incLosses()
    }

    return {
      exploredPatterns: autorouter.exploredPatterns,
      solvedPattern: autorouter.solvedPattern,
      iterations: autorouter.iterations,
    }
  }

  return (
    <div>
      <div className="p-4">
        Wins: {wins} / {wins + losses}
      </div>
      <div className="grid grid-cols-4">
        {outerPoints.map((point, index) => (
          <InteractiveAutorouter
            key={index}
            svgOnly
            svgSize={{ width: 300, height: 200 }}
            defaultMaxSteps={200}
            defaultSimpleRouteJson={{
              ...simpleRouteJson,
              connections: [
                {
                  name: `trace_${index}`,
                  pointsToConnect: [
                    { x: -0.8, y: -1.2, layer: "top" },
                    { ...point, layer: "top" },
                  ],
                },
              ],
            }}
            doAutorouting={doAutorouting}
          />
        ))}
      </div>
      <Patterns patterns={singleLayerPatternSet} />
    </div>
  )
}

const simpleRouteJson: SimpleRouteJson = {
  bounds: {
    minX: -4.2,
    maxX: 4.2,
    minY: -4.2,
    maxY: 4.2,
  },
  obstacles: [
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -2,
        y: 2,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_0", "connectivity_net72"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -1.2000000000000002,
        y: 2,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_1", "connectivity_net73"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -0.4,
        y: 2,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_2", "connectivity_net74"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 0.4,
        y: 2,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_3", "connectivity_net75"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 1.2000000000000002,
        y: 2,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_4", "connectivity_net76"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 2,
        y: 2,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_5", "connectivity_net77"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -2,
        y: 1.2000000000000002,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_6", "connectivity_net78"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -1.2000000000000002,
        y: 1.2000000000000002,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_7", "connectivity_net79"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -0.4,
        y: 1.2000000000000002,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_8", "connectivity_net80"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 0.4,
        y: 1.2000000000000002,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_9", "connectivity_net81"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 1.2000000000000002,
        y: 1.2000000000000002,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_10", "connectivity_net82"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 2,
        y: 1.2000000000000002,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_11", "connectivity_net83"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -2,
        y: 0.4,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_12", "connectivity_net84"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -1.2000000000000002,
        y: 0.4,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_13", "connectivity_net85"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -0.4,
        y: 0.4,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_14", "connectivity_net86"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 0.4,
        y: 0.4,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_15", "connectivity_net87"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 1.2000000000000002,
        y: 0.4,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_16", "connectivity_net88"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 2,
        y: 0.4,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_17", "connectivity_net89"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -2,
        y: -0.4,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_18", "connectivity_net90"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -1.2000000000000002,
        y: -0.4,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_19", "connectivity_net91"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -0.4,
        y: -0.4,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_20", "connectivity_net92"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 0.4,
        y: -0.4,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_21", "connectivity_net93"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 1.2000000000000002,
        y: -0.4,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_22", "connectivity_net94"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 2,
        y: -0.4,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_23", "connectivity_net95"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -2,
        y: -1.2000000000000002,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_24", "connectivity_net96"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -1.2000000000000002,
        y: -1.2000000000000002,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_25", "connectivity_net97"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -0.4,
        y: -1.2000000000000002,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_26", "connectivity_net98"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 0.4,
        y: -1.2000000000000002,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_27", "connectivity_net99"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 1.2000000000000002,
        y: -1.2000000000000002,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_28", "connectivity_net100"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 2,
        y: -1.2000000000000002,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_29", "connectivity_net101"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -2,
        y: -2,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_30", "connectivity_net102"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -1.2000000000000002,
        y: -2,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_31", "connectivity_net103"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -0.4,
        y: -2,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_32", "connectivity_net104"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 0.4,
        y: -2,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_33", "connectivity_net105"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 1.2000000000000002,
        y: -2,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_34", "connectivity_net106"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 2,
        y: -2,
      },
      width: 0.3779527559055118,
      height: 0.3779527559055118,
      connectedTo: ["pcb_smtpad_35", "connectivity_net107"],
    },
  ],
  connections: [],
  layerCount: 2,
  minTraceWidth: 0.1,
}
