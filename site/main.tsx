import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import LegacyApp from "docs/LEGACY_APP"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LegacyApp />
  </React.StrictMode>,
)
