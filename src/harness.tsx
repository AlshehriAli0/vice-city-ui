import { OverlayHost } from "@ui-sdk/react/overlays"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { LeonidaToasts } from "./leonida/mission-toast"
import { DemoBoundary } from "./site/boundary"
import { BY_ID, ENTRIES } from "./site/catalog"
import "./leonida/tokens.css"
import "./leonida/parts.css"
import { staticPlayground } from "./site/playground"
import "./site.css"

// Dev page for 1:1 comparisons: /harness.html?c=<id>&theme=day|sunset|night&still=1&bg=scene|plain|none&fill=0|1&values={"inCar":true}
// A demo root whose class names a scene (hd-scene, ov-scene…) always fills the viewport so 1080p geometry lands 1:1; fill=1 forces it for any root.
const params = new URLSearchParams(location.search)
const entry = BY_ID.get(params.get("c") ?? "")
const root = document.documentElement
root.dataset.theme = params.get("theme") ?? "sunset"
root.dataset.motion = params.get("still") ? "still" : "live"
const bg = params.get("bg") ?? (entry?.scene ? "scene" : "plain")
const fill = params.get("fill") === "1"
const values = JSON.parse(params.get("values") ?? "{}") as Record<string, string | number | boolean>

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <OverlayHost />
    <LeonidaToasts />
    {entry ? (
      <main className="harness" data-bg={bg} data-id={entry.id} data-fill={fill || undefined}>
        <DemoBoundary name={entry.name}>{entry.render(staticPlayground({ defaults: { ...entry.defaults, ...values } }))}</DemoBoundary>
      </main>
    ) : (
      <main className="harness-index">
        <h1>Harness</h1>
        <ul>
          {ENTRIES.map((item) => (
            <li key={item.id}>
              <a href={`?c=${item.id}`}>
                {item.label} {item.name}
              </a>{" "}
              <code>{item.id}</code>
            </li>
          ))}
        </ul>
      </main>
    )}
  </StrictMode>,
)
