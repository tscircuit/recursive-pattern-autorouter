import { expect, test } from "bun:test"
import type { SimpleRouteJson } from "lib/types/SimpleRouteJson"
import { renderToString } from "react-dom/server"
import { InteractiveAutorouter } from "site/InteractiveAutorouter"

test("jumpcounter1", () => {
  expect(
    renderToString(<InteractiveAutorouter simpleRouteJson={simpleRouteJson} />),
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
        x: 2.5,
        y: 0,
      },
      width: 0.6000000000000001,
      height: 0.6000000000000001,
      connectedTo: ["pcb_smtpad_0", "connectivity_net19"],
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
      connectedTo: ["pcb_smtpad_1", "connectivity_net15"],
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
      connectedTo: ["pcb_smtpad_2", "connectivity_net19"],
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
