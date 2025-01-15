import Example1 from "./example1-grid.fixture"

export default () => {
  return (
    <div>
      <div className="p-4 gap-2 flex flex-col">
        <h2 className="text-2xl font-bold">
          The Recursive Pattern Path Finder
        </h2>
        <a href="https://github.com/tscircuit/recursive-pattern-autorouter">
          <img
            src="https://img.shields.io/github/stars/tscircuit/recursive-pattern-autorouter?style=social"
            alt="GitHub stars"
          />
        </a>
        <div>
          What if you tried to find a path from A to B by repeatedly applying
          patterns whenever you hit an obstacle? That's exactly what this
          algorithm does.
        </div>
        <div>
          Grid-based path-finding has issues as your area gets larger, but this
          path finder uses intersection math, so it doesn't matter how large the
          area is, only the number of obstacles and complexity of the acceptable
          paths impact its runtime.
        </div>
        <div>
          If you scroll to the bottom of the page, you can see the patterns that
          are repeatedly applied whenever there's an intersection
        </div>
        <div className="font-bold">
          Create obstacles by dragging the mouse over the interactive area. Drag
          the <span className="text-green-500">Green</span> and{" "}
          <span className="text-red-500">Red</span> points to change the start
          and end points.
        </div>
        <div>
          Use the sidebar to see different examples of this path finder. And{" "}
          <a
            className="text-blue-500"
            href="https://blog.autorouting.com/p/the-recursive-pattern-pathfinder"
          >
            read this blog post
          </a>{" "}
          to learn more about the algorithm.
        </div>
      </div>
      <Example1 />
    </div>
  )
}
