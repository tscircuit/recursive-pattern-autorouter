import { expect, test } from "bun:test"
import { AstarPatternPathFinder } from "lib/algos/AstarPatternPathFinder"
import { AstarPatternPathFinderJumpCount } from "lib/algos/AstarPatternPathFinderJumpReq"
import { distance } from "lib/algos/distance"
import { processObstacles } from "lib/algos/preprocessObstacles"
import type { SimpleRouteJson } from "lib/types/SimpleRouteJson"
import { renderToString } from "react-dom/server"
import { InteractiveAutorouter } from "site/InteractiveAutorouter"

test("jumpcounter1", () => {
  expect(
    renderToString(
      <InteractiveAutorouter
        svgOnly
        defaultSimpleRouteJson={simpleRouteJson}
        doAutorouting={(simpleRouteJson, maxSteps) => {
          const autorouter = new AstarPatternPathFinderJumpCount()
          autorouter.openSet.push({
            parentProjectedPattern: null,
            parentSegmentIndex: -1,
            unsolvedSegments: [
              {
                A: {
                  ...simpleRouteJson.connections[0]!.pointsToConnect[0]!,
                  l: 0,
                },
                B: {
                  ...simpleRouteJson.connections[0]!.pointsToConnect[1]!,
                  l: 0,
                },
                hasCollision: true,
                depth: 0,
                distance: distance(
                  simpleRouteJson.connections[0]!.pointsToConnect[0]!,
                  simpleRouteJson.connections[0]!.pointsToConnect[1]!,
                ),
                jumpsFromA: 0,
              },
            ],
            solvedSegments: [],
            patternDefinitionsUsed: {},
            g: 0,
            h: 0,
            f: 0,
          })
          autorouter.processedObstacles = processObstacles(
            simpleRouteJson.obstacles,
          )
          autorouter.obstacleMask = autorouter.processedObstacles.map(
            (_) => true,
          )

          for (let i = 0; i < maxSteps; i++) {
            if (autorouter.solvedPattern) break
            autorouter.solveOneStep()
          }

          return autorouter
        }}
      />,
    ),
  ).toMatchSvgSnapshot(import.meta.path)
})

const simpleRouteJson: SimpleRouteJson = {
  bounds: {
    minX: -4.8,
    maxX: 4.8,
    minY: -3.15,
    maxY: 3.15,
  },
  obstacles: [
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 3.5,
        y: 0,
      },
      width: 0.6000000000000001,
      height: 0.6000000000000001,
      connectedTo: ["pcb_smtpad_1", "connectivity_net15"],
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
      connectedTo: ["pcb_smtpad_3", "connectivity_net16"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: -8.572527594031472e-17,
        y: -1.4,
      },
      width: 1.5,
      height: 1.5,
      connectedTo: ["pcb_smtpad_4", "connectivity_net17"],
    },
    {
      type: "rect",
      layers: ["top"],
      center: {
        x: 8.572527594031472e-17,
        y: 1.4,
      },
      width: 1.5,
      height: 1.5,
      connectedTo: ["pcb_smtpad_5", "connectivity_net18"],
    },
  ],
  connections: [
    {
      name: "connectivity_net19",
      pointsToConnect: [
        {
          x: 2.5,
          y: 0,
          layer: "top",
        },
        {
          x: -3.5,
          y: 0,
          layer: "top",
        },
      ],
    },
  ],
  layerCount: 2,
  minTraceWidth: 0.1,
}
