import { coreDisplay } from "../../gallery/display/display-demos";
import { coreForms } from "../../gallery/forms/form-demos";
import { mountSite } from "../mount-site";
import { DemoBoundary } from "../playground/demo-boundary";
import { staticPlayground } from "../playground/playground-state";
import { SiteOverlays } from "../site-overlays";

const sets = new Map([
  ["core-forms", coreForms],
  ["core-display", coreDisplay],
]);
const params = new URLSearchParams(location.search);
const set = params.get("set") ?? "core-forms";
const demos = sets.get(set) ?? [];
const only = params.get("only");
mountSite(
  <>
    <SiteOverlays />
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
  </>
);
