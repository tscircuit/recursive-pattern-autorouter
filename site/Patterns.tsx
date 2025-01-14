import { singleLayerPatternSet, type PatternDefinition } from "lib/patterns"
import { projectPattern } from "lib/patterns/projectPattern"

const PatternPreview = ({
  pattern,
  index,
}: { pattern: PatternDefinition; index: number }) => {
  const start = { x: 30, y: 40, l: 0 }
  const end = { x: 120, y: 40, l: 0 }
  const projectedPoints = projectPattern(start, end, pattern)

  return (
    <div className="border rounded p-4">
      <div className="text-sm font-medium mb-2">Pattern {index}</div>
      <svg width="150" height="80">
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
}: { patterns: PatternDefinition[] }) => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Available Patterns</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {patterns.map((pattern, index) => (
          <PatternPreview key={index} pattern={pattern} index={index} />
        ))}
      </div>
    </div>
  )
}

export default Patterns
