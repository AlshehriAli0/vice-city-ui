import { OverlayHost } from "@ui-sdk/react/overlays";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { coreDisplay } from "./gallery/core-display";
import { coreForms } from "./gallery/core-forms";
import { LeonidaToasts } from "./leonida/mission-toast";

import "./leonida/tokens.css";
import "./leonida/parts.css";
import { DemoBoundary } from "./site/boundary";
import { staticPlayground } from "./site/playground-state";

import "./site.css";

const sets = new Map([
  ["core-forms", coreForms],
  ["core-display", coreDisplay],
]);
const params = new URLSearchParams(location.search);
const set = params.get("set") ?? "core-forms";
const demos = sets.get(set) ?? [];
const only = params.get("only");
const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

createRoot(root).render(
  <StrictMode>
    <OverlayHost />
    <LeonidaToasts />
    <main className="section">
      <div className="grid">
        {demos
          .filter(demo => !only || demo.id === only)
          .map((demo, index) => (
            <article key={demo.id} className="card" id={demo.id} data-wide={demo.wide ?? undefined}>
              <header className="card__head">
                <span className="card__no">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="card__title">{demo.name}</h3>
                <span className="card__sdk">{demo.sdk}</span>
              </header>
              <div className="card__stage">
                <DemoBoundary name={demo.name}>{demo.render(staticPlayground(demo))}</DemoBoundary>
              </div>
              <p className="card__caption">{demo.caption}</p>
            </article>
          ))}
      </div>
    </main>
  </StrictMode>
);
