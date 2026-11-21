import { ArrowDown, ArrowRight } from "lucide-react"
import type { ReactElement } from "react"
import { Button } from "../ui/button"
import { ViceText } from "../ui/vice-text"
import { DemoBoundary } from "./boundary"
import { ENTRIES, entriesOf, sections, type Entry } from "./catalog"
import { CropStage } from "./crop-stage"
import { FitStage } from "./fit-stage"
import { staticPlayground } from "./playground"
import { hrefOf } from "./route"

function Masthead(): ReactElement {
  return (
    <header className="masthead">
      <p className="masthead__kicker">Grand Theft Auto VI design system</p>
      <ViceText render={<h1 className="masthead__title" id="home-title" tabIndex={-1} />}>Vice City UI</ViceText>
      <p className="masthead__lede">The menus, HUD and phone, as accessible React components.</p>
      <p className="masthead__intro">
        Built on Vercel UI SDK, which gives every control its keyboard, focus and ARIA. Each of the {ENTRIES.length} cards below is a live component.
      </p>
      <div className="masthead__actions">
        <Button render={<a href={`#${sections[0]?.id}`} />}>
          Browse components <ArrowDown aria-hidden="true" />
        </Button>
        <Button variant="outline" render={<a href="https://ui-sdk.dev" />}>
          UI SDK <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </header>
  )
}

function CatalogCard({ entry }: { entry: Entry }): ReactElement {
  return (
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
      <div className="cat-card__stage" data-scene={entry.scene ? "" : undefined}>
        <div className="cat-card__preview" inert aria-hidden="true">
          <DemoBoundary name={entry.name}>
            {entry.preview ? (
              <FitStage width={760}>{entry.preview()}</FitStage>
            ) : entry.crop ? (
              <CropStage crop={entry.crop}>{entry.render(staticPlayground(entry))}</CropStage>
            ) : (
              <FitStage width={entry.wide ? 860 : 600}>{entry.render(staticPlayground(entry))}</FitStage>
            )}
          </DemoBoundary>
        </div>
      </div>
      <p className="cat-card__caption">{entry.pitch}</p>
    </article>
  )
}

function HomePage(): ReactElement {
  return (
    <div className="home">
      <Masthead />
      <div className="catalogue" role="region" aria-label="Catalogue">
        {sections.map((section) => {
          const entries = entriesOf(section)
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
                {entries.map((entry) => (
                  <CatalogCard key={entry.id} entry={entry} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

export { HomePage }
