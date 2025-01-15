import {
  getPatternName,
  singleLayerPatternSet,
  type PatternDefinition,
} from "lib/patterns"
import { projectPattern } from "lib/patterns/projectPattern"

const PatternPreview = ({
  pattern,
  name,
  timesUsed,
  onToggle,
}: {
  pattern: PatternDefinition
  name: string
  timesUsed: number
  onToggle?: (pattern: PatternDefinition) => void
}) => {
  const start = { x: 60, y: 40, l: 0 }
  const end = { x: 90, y: 40, l: 0 }
  const projectedPoints = projectPattern(start, end, pattern)

  return (
    <div className="border rounded p-1 cursor-pointer">
      <div className="text-sm font-medium mb-2">
        {onToggle ? (
          <input
            type="checkbox"
            defaultChecked
            onChange={() => onToggle?.(pattern)}
          />
        ) : null}
        {name} ({timesUsed})
      </div>
      <svg className="mt-[-16px]" width="150" height="80">
        {/* Draw the pattern path */}
        <path
          d={`M ${projectedPoints.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
          stroke="#3B82F6"
          strokeWidth="2"
          fill="none"
        />

        {/* Draw start and end points */}
        <circle cx={start.x} cy={start.y} r="4" fill="#DC2626" />
        <circle cx={end.x} cy={end.y} r="4" fill="#16A34A" />
      </svg>
    </div>
  )
}

const Patterns = ({
  patterns = singleLayerPatternSet,
  patternDefinitionsUsed,
  onTogglePattern,
}: {
  patterns: PatternDefinition[]
  patternDefinitionsUsed?: Record<string, number>
  onTogglePattern?: (pattern: PatternDefinition) => void
}) => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Available Patterns</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {patterns.map((pattern, index) => (
          <PatternPreview
            key={index}
            pattern={pattern}
            name={getPatternName(pattern) ?? "unknown"}
            timesUsed={
              patternDefinitionsUsed?.[getPatternName(pattern) ?? ""] ?? 0
            }
            onToggle={onTogglePattern}
          />
        ))}
      </div>
    </div>
  )
}

export default Patterns
