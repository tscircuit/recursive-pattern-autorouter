import { processObstacles } from "lib/algos/preprocessObstacles"
import type { SimpleRouteJson, Trace } from "lib/types/SimpleRouteJson"
import { solveForTrace } from "./solveForTrace"
import { singleLayerPatternSet } from "lib/patterns"

export class RecursivePatternAutorouter {
  constructor(public simpleRouteJson: SimpleRouteJson) {}

  public solveForTraces(): Trace[] {
    const traces: Trace[] = []

    const processedObstacles = processObstacles(this.simpleRouteJson.obstacles)

    const connections = this.simpleRouteJson.connections

    for (const connection of connections) {
      const startPoint = connection.pointsToConnect[0]!
      const endPoint = connection.pointsToConnect[1]!

      const trace = solveForTrace({
        startPoint,
        endPoint,
        processedObstacles,
        existingTraces: traces,
        connectionName: connection.name,
        patterns: singleLayerPatternSet,
      })

      if (!trace) continue

      traces.push(trace)
    }

    return traces
  }
}
