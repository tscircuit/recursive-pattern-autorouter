import React from "react"
import Patterns from "./Patterns"
import Example1 from "./examples/example1-simple.fixture"
import Example2 from "./examples/example2-astar.fixture"

const App = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PCB Autorouter Visualization</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Pattern Library</h2>
        <Patterns />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Example 1: Simple Routing</h2>
        <Example1 />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Example 2: A* Pattern Routing</h2>
        <Example2 />
      </div>
    </div>
  )
}

export default App
