import {
  type ProjectedPattern,
  type Segment,
} from "lib/algos/AstarPatternPathFinder"
import { useEffect, useMemo, useState } from "react"
import type { SimpleRouteJson, Trace } from "lib/types/SimpleRouteJson"
import { singleLayerPatternSet, type PatternDefinition } from "lib/patterns"
import Patterns from "./Patterns"
import { InteractiveSimpleRouteJson } from "./InteractiveSimpleRouteJson"

export interface IAutorouterResult {
  exploredPatterns: ProjectedPattern[]
  solvedPattern: ProjectedPattern | null
  iterations: number
}

interface Props {
  defaultSimpleRouteJson: SimpleRouteJson
  doAutorouting?: (json: SimpleRouteJson, maxSteps: number) => IAutorouterResult
  svgOnly?: boolean
  defaultMaxSteps?: number
  patternDefinitions?: PatternDefinition[]
  svgSize?: { width: number; height: number }
  showAvailablePatterns?: boolean
  onTogglePattern?: (pattern: PatternDefinition) => void
  enabledPatternNames?: string[]
  exploredPatternColor?: string
}

function getAllSegmentsFromSolvedPattern(
  solvedPattern: ProjectedPattern,
): Segment[] {
  if (!solvedPattern) return []
  return [...solvedPattern.solvedSegments, ...solvedPattern.unsolvedSegments]
}

function convertSegmentsToTraces(segments: Segment[], color?: string): Trace[] {
  return segments.map((segment) => ({
    route: [segment.A, segment.B].map((p) => ({
      route_type: "wire" as const,
      x: p.x,
      y: p.y,
      width: 0.1,
      layer: "top",
    })),
    color,
  }))
}

export const InteractiveAutorouter: React.FC<Props> = ({
  defaultSimpleRouteJson: defaultSimpleRouteJson,
  defaultMaxSteps = 100,
  doAutorouting,
  svgOnly,
  onTogglePattern,
  patternDefinitions,
  enabledPatternNames,
  showAvailablePatterns = true,
  svgSize,
  exploredPatternColor,
}) => {
  const [maxSteps, setMaxSteps] = useState(defaultMaxSteps)
  const [isAnimating, setIsAnimating] = useState(false)
  const [frame, setFrame] = useState(0)
  const [simpleRouteJson, setSimpleRouteJson] = useState(defaultSimpleRouteJson)

  const autorouterResult = useMemo(() => {
    if (!doAutorouting) return null
    return doAutorouting(simpleRouteJson, maxSteps)
  }, [maxSteps, simpleRouteJson, enabledPatternNames])

  useEffect(() => {
    if (isAnimating && autorouterResult) {
      const interval = setInterval(() => {
        setFrame((f) => f + 1)
      }, 1000 / autorouterResult.iterations)
      return () => clearInterval(interval)
    }
  }, [isAnimating, autorouterResult?.iterations])

  if (!doAutorouting) {
    return "Please provide a doAutorouting function"
  }

  const { exploredPatterns, solvedPattern } = autorouterResult!

  const purplePattern = !isAnimating
    ? exploredPatterns[maxSteps - 1]
    : exploredPatterns[
        frame % (exploredPatterns.length - (solvedPattern ? 1 : 0))
      ]

  const bluePattern = [...exploredPatterns].sort((a, b) => b.f! - a.f!)[0]

  const traces: Trace[] = []

  for (const pattern of exploredPatterns) {
    traces.push(
      ...convertSegmentsToTraces(
        getAllSegmentsFromSolvedPattern(pattern),
        exploredPatternColor ?? "rgba(255,255,0,0.3)",
      ),
    )
  }

  if (solvedPattern) {
    traces.push(
      ...convertSegmentsToTraces(
        getAllSegmentsFromSolvedPattern(solvedPattern),
        "rgba(0,220,0, 1)",
      ),
    )
  }

  if (purplePattern) {
    traces.push(
      ...convertSegmentsToTraces(
        getAllSegmentsFromSolvedPattern(purplePattern),
        "rgba(255,0,255,0.5)",
      ),
    )
  }

  if (!solvedPattern && bluePattern) {
    traces.push(
      ...convertSegmentsToTraces(
        getAllSegmentsFromSolvedPattern(bluePattern),
        "rgba(0,0,255,0.5)",
      ),
    )
  }

  return (
    <>
      <InteractiveSimpleRouteJson
        svgSize={svgSize}
        iterations={autorouterResult?.iterations}
        simpleRouteJson={{ ...simpleRouteJson, traces }}
        onChangeSimpleRouteJson={setSimpleRouteJson}
      />
      {!svgOnly && (
        <>
          <div style={{ marginTop: 20 }}>
            <div className="p-2">
              Iterations: {autorouterResult?.iterations}
            </div>
            <button
              className="border border-gray-300 rounded-md px-2 py-1"
              onClick={() => {
                if (maxSteps > 0) {
                  setMaxSteps(maxSteps - 10)
                }
              }}
            >
              Max Steps - 10
            </button>
            <span style={{ margin: "0 10px" }}>Max Steps: {maxSteps}</span>
            <button
              className="border border-gray-300 rounded-md px-2 py-1"
              onClick={() => {
                setMaxSteps(maxSteps + 1)
              }}
            >
              Max Steps + 1
            </button>
            <button
              className="border border-gray-300 rounded-md px-2 py-1"
              onClick={() => {
                setMaxSteps(maxSteps + 10)
              }}
            >
              Max Steps + 10
            </button>
            <button
              className="border border-gray-300 rounded-md px-2 py-1"
              onClick={() => {
                setIsAnimating(!isAnimating)
              }}
            >
              {isAnimating ? "Stop" : "Start"} Animating
            </button>
          </div>
          {!showAvailablePatterns && (
            <Patterns
              enabledPatternNames={enabledPatternNames}
              patterns={patternDefinitions ?? singleLayerPatternSet}
              patternDefinitionsUsed={
                solvedPattern?.patternDefinitionsUsed ??
                bluePattern?.patternDefinitionsUsed
              }
              onTogglePattern={onTogglePattern}
            />
          )}
        </>
      )}
    </>
  )
}
