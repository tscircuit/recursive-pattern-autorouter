# recursive-pattern-autorouter

An autorouting algorithm that uses recursively applies patterns to find
the best low-complexity path.

Read more in [this article](https://blog.autorouting.com/p/the-recursive-pattern-pathfinder)

## Usage

```tsx
import { RecursivePatternAutorouter } from "recursive-pattern-autorouter"

const autorouter = new RecursivePatternAutorouter({
  simpleRouteJson,
  // Optional parameters
  patternPreset: "single-layer",
  maxDepth: 10,
})

const traces = autorouter.solveForTraces()
```

Simple Route JSON can be computed from Circuit JSON, you can also download it
directly from any circuit on [tscircuit.com](https://tscircuit.com)

```tsx
const simpleRouteJson = {
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
```
