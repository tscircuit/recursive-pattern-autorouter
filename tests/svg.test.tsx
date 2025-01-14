import { expect, test } from "bun:test"
import { renderToString } from "react-dom/server"

const TestSvg = () => (
  <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" stroke="black" strokeWidth="3" fill="red" />
  </svg>
)

test("svg snapshot example", async () => {
  // First run will create the snapshot
  // Subsequent runs will compare against the saved snapshot
  await expect(renderToString(<TestSvg />)).toMatchSvgSnapshot(import.meta.path)
})
