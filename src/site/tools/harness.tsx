import type { Value, Values } from "../../gallery/demo";
import { BY_ID, ENTRIES } from "../catalogue/catalogue";
import { mountSite } from "../mount-site";
import { DemoBoundary } from "../playground/demo-boundary";
import { staticPlayground } from "../playground/playground-state";
import { SiteOverlays } from "../site-overlays";

const parseValues = (source: string): Values => {
  const parsed: unknown = JSON.parse(source);
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};

  return Object.fromEntries(
    Object.entries(parsed).flatMap<[string, Value]>(([key, value]: [string, unknown]) => {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return [[key, value]];
      return [];
    })
  );
};

const params = new URLSearchParams(location.search);
const entry = BY_ID.get(params.get("c") ?? "");
const root = document.documentElement;
root.dataset.motion = params.get("still") ? "still" : "live";
const bg = params.get("bg") ?? "plain";
const fill = params.get("fill") === "1";
const values = parseValues(params.get("values") ?? "{}");
mountSite(
  <>
    <SiteOverlays />
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
  </>
);
