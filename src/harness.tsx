import { OverlayHost } from "@ui-sdk/react/overlays";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import type { Value, Values } from "./gallery/types";
import { LeonidaToasts } from "./leonida/mission-toast";
import { DemoBoundary } from "./site/boundary";
import { BY_ID, ENTRIES } from "./site/catalog";

import "./leonida/tokens.css";
import "./leonida/parts.css";
import { staticPlayground } from "./site/playground-state";

import "./site.css";

function parseValues(source: string): Values {
  const parsed: unknown = JSON.parse(source);
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};

  return Object.fromEntries(
    Object.entries(parsed).flatMap<[string, Value]>(([key, value]: [string, unknown]) => {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return [[key, value]];
      return [];
    })
  );
}

const params = new URLSearchParams(location.search);
const entry = BY_ID.get(params.get("c") ?? "");
const root = document.documentElement;
root.dataset.theme = params.get("theme") ?? "sunset";
root.dataset.motion = params.get("still") ? "still" : "live";
const bg = params.get("bg") ?? (entry?.scene ? "scene" : "plain");
const fill = params.get("fill") === "1";
const values = parseValues(params.get("values") ?? "{}");
const container = document.getElementById("root");
if (!container) throw new Error("Missing #root");

createRoot(container).render(
  <StrictMode>
    <OverlayHost />
    <LeonidaToasts />
    {entry ? (
      <main className="harness" data-bg={bg} data-id={entry.id} data-fill={fill || undefined}>
        <DemoBoundary name={entry.name}>
          {entry.render(staticPlayground({ defaults: { ...entry.defaults, ...values } }))}
        </DemoBoundary>
      </main>
    ) : (
      <main className="harness-index">
        <h1>Harness</h1>
        <ul>
          {ENTRIES.map(item => (
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
  </StrictMode>
);
