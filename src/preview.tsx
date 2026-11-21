import { OverlayHost } from "@ui-sdk/react/overlays"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import type { Demo } from "./gallery/types"
import { LeonidaToasts } from "./leonida/mission-toast"
import "./leonida/tokens.css"
import "./leonida/parts.css"
import { staticPlayground } from "./site/playground"
import "./site.css"

// Dev-only page that renders one gallery set: /preview.html?set=core-forms&theme=day
const sets = import.meta.glob<Record<string, unknown>>("./gallery/core-*.tsx", { eager: true })
const params = new URLSearchParams(location.search)
const set = params.get("set") ?? "core-forms"
document.documentElement.dataset.theme = params.get("theme") ?? "sunset"
const module = sets[`./gallery/${set}.tsx`] ?? {}
const demos = (Object.values(module).find(Array.isArray) ?? []) as Demo[]
const only = params.get("only")

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <OverlayHost />
    <LeonidaToasts />
    <main className="section">
      <div className="grid">
        {demos
          .filter((demo) => !only || demo.id === only)
          .map((demo, index) => (
            <article key={demo.id} className="card" id={demo.id} data-wide={demo.wide || undefined}>
              <header className="card__head">
                <span className="card__no">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="card__title">{demo.name}</h3>
                <span className="card__sdk">{demo.sdk}</span>
              </header>
              <div className="card__stage">{demo.render(staticPlayground(demo))}</div>
              <p className="card__caption">{demo.caption}</p>
            </article>
          ))}
      </div>
    </main>
  </StrictMode>,
)
