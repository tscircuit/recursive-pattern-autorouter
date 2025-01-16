import { InteractiveSimpleRouteJson } from "site/InteractiveSimpleRouteJson"
import type { SimpleRouteJson } from "lib/types/SimpleRouteJson"
import { InteractiveAutorouter } from "site/InteractiveAutorouter"
import * as PatternFns from "lib/patterns/pattern-fns"

const simpleRouteJson: SimpleRouteJson = {
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
  minTraceWidth: 0.1,
}

export default () => {
  return (
    <InteractiveAutorouter
      defaultSimpleRouteJson={simpleRouteJson}
      svgOnly
      doAutorouting={(srj, maxSteps) => {
        // Draw the target pattern using the pattern fn

        return {
          iterations: 1,
          exploredPatterns: [],
          solvedPattern: null,
        }
      }}
    />
  )
}
