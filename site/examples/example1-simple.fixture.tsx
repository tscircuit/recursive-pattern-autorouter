import type { SimpleRouteJson } from "lib/types/SimpleRouteJson"
import { InteractiveAutorouter } from "site/InteractiveAutorouter"

export default () => {
  return <InteractiveAutorouter simpleRouteJson={simpleRouteJson} />
}

const simpleRouteJson: SimpleRouteJson = {
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
