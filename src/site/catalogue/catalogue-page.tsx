import { ArrowDown, ArrowRight } from "lucide-react";
import { lazy } from "react";

import { ViceText } from "../../ui/display/vice-text";
import { Button } from "../../ui/forms/button";
import { DemoBoundary } from "../playground/demo-boundary";
import { ENTRIES, sections, type Entry } from "./catalogue";
import { hrefOf } from "./hash-route";

const Masthead = () => (
  <header className="masthead">
    <p className="masthead__kicker">Grand Theft Auto VI design system</p>
    <h1 className="masthead__title" id="home-title" tabIndex={-1}>
      <ViceText>Vice City UI</ViceText>
    </h1>
    <p className="masthead__lede">A complete design system, built with UI SDK.</p>
    <p className="masthead__intro">Open any of the {ENTRIES.length} components for its live demo.</p>
    <div className="masthead__actions">
      <Button render={<a href={`#${sections[0]?.id}`} aria-label="Browse components" />}>
        Browse components <ArrowDown aria-hidden="true" />
      </Button>
      <Button variant="outline" render={<a href="https://ui-sdk.dev" aria-label="UI SDK" />}>
        UI SDK <ArrowRight aria-hidden="true" />
      </Button>
    </div>
  </header>
);

const CAPTURING_PREVIEWS = typeof location !== "undefined" && new URLSearchParams(location.search).has("live");

const LivePreview = lazy(() => import("./live-card-preview"));

const CatalogCard = ({ entry }: { entry: Entry }) => (
  <article className="cat-card" data-id={entry.id}>
    <header className="cat-card__head">
      <span className="cat-card__no">{entry.label}</span>
      <h3 className="cat-card__name">
        <a className="cat-card__link" href={hrefOf(entry.id)}>
          {entry.name}
        </a>
      </h3>
      <span className="cat-card__rule" aria-hidden="true" />
    </header>
    <div className="cat-card__stage">
      {CAPTURING_PREVIEWS ? (
        <div className="cat-card__preview" inert aria-hidden="true">
          <DemoBoundary name={entry.name}>
            <LivePreview entry={entry} />
          </DemoBoundary>
        </div>
      ) : (
        <img
          className="cat-card__shot"
          src={`/previews/${entry.id}.webp`}
          alt=""
          width={722}
          height={420}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
    <p className="cat-card__caption">{entry.pitch}</p>
  </article>
);

const HomePage = () => (
  <div className="home">
    <Masthead />
    <div className="catalogue" role="region" aria-label="Catalogue">
      {sections.map(section => {
        const { entries } = section;
        return (
          <section key={section.id} className="family" id={section.id} aria-labelledby={`${section.id}-title`}>
            <header className="family__head">
              <h2 className="family__title" id={`${section.id}-title`}>
                {section.title}
              </h2>
              <span className="family__range">
                {entries[0]?.label}–{entries.at(-1)?.label}
              </span>
              <span className="family__rule" aria-hidden="true" />
            </header>
            <div className="family__grid">
              {entries.map(entry => (
                <CatalogCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  </div>
);

export { HomePage };
