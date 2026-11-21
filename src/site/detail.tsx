import { ArrowLeft, ArrowRight } from "lucide-react"
import { useEffect, useRef, type ReactElement } from "react"
import { BY_ID, ENTRIES, entriesOf, sections, type Entry } from "./catalog"
import { DemoBoundary } from "./boundary"
import { FrameCrop } from "./crop-stage"
import { FitStage } from "./fit-stage"
import { hrefOf } from "./route"
import { Source } from "./source"
import { ControlsPanel, Examples, Usage, usePlayground } from "./playground"
import { Stage } from "./stage"

function ComponentNav({ current }: { current: string }): ReactElement {
  return (
    <nav className="side-nav" aria-label="Components">
      {sections.map((section) => (
        <div key={section.id} className="side-nav__group">
          <p className="side-nav__title">{section.title}</p>
          <ul>
            {entriesOf(section).map((entry) => (
              <li key={entry.id}>
                <a href={hrefOf(entry.id)} aria-current={entry.id === current ? "page" : undefined}>
                  <span className="side-nav__no">{entry.label}</span>
                  {entry.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function Pager({ entry }: { entry: Entry }): ReactElement {
  const index = ENTRIES.indexOf(entry)
  const prev = ENTRIES[index - 1]
  const next = ENTRIES[index + 1]
  return (
    <nav className="pager" aria-label="Previous and next component">
      {prev ? (
        <a className="pager__link" href={hrefOf(prev.id)} rel="prev">
          <span className="pager__dir">
            <ArrowLeft aria-hidden="true" />
            Previous
          </span>{" "}
          {prev.name}
        </a>
      ) : (
        <span />
      )}
      {next && (
        <a className="pager__link pager__link--next" href={hrefOf(next.id)} rel="next">
          <span className="pager__dir">
            Next
            <ArrowRight aria-hidden="true" />
          </span>{" "}
          {next.name}
        </a>
      )}
    </nav>
  )
}

function KeyTable({ keys }: { keys: [string, string][] }): ReactElement {
  return (
    <table className="keys">
      <thead>
        <tr>
          <th scope="col">Keys</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        {keys.map(([combo, action]) => (
          <tr key={combo}>
            <td>
              {combo.split(" / ").map((key, index) => (
                <span key={key}>
                  {index > 0 && <span className="keys__or"> or </span>}
                  <kbd>{key}</kbd>
                </span>
              ))}
            </td>
            <td>{action}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function DetailPage({ id }: { id: string }): ReactElement | null {
  const entry = BY_ID.get(id)
  const playground = usePlayground(entry ?? ENTRIES[0])
  const title = useRef<HTMLHeadingElement>(null)
  const side = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!entry) {
      window.location.replace("#/")
      return
    }
    window.scrollTo(0, 0)
    title.current?.focus({ preventScroll: true })
    const current = side.current?.querySelector<HTMLElement>('[aria-current="page"]')
    if (side.current && current) side.current.scrollTop = current.offsetTop - side.current.clientHeight / 2
  }, [entry])

  if (!entry) return null
  return (
    <div className="detail">
      <aside className="detail__side" ref={side}>
        <ComponentNav current={entry.id} />
      </aside>
      <article className="detail__main" aria-labelledby="detail-title">
        <header className="detail__head">
          <p className="detail__eyebrow">
            <span className="detail__no">{entry.label}</span> {entry.section.title}
          </p>
          <h1 className="detail__title" id="detail-title" tabIndex={-1} ref={title}>
            {entry.name}
          </h1>
          <p className="detail__base">UI SDK · {entry.sdk}</p>
          <p className="detail__pitch">{entry.pitch}</p>
        </header>

        <Examples demo={entry} state={playground} />
        <Stage className="detail__stage" scene={entry.scene}>
          <DemoBoundary name={entry.name}>
            {entry.stageCrop ? <FrameCrop crop={entry.stageCrop}>{entry.render(playground)}</FrameCrop> : entry.render(playground)}
          </DemoBoundary>
        </Stage>
        <ControlsPanel demo={entry} state={playground} />
        <p className="detail__notes">{entry.caption}</p>
        <Usage demo={entry} values={playground.values} />

        {entry.states && entry.states.length > 0 && (
          <section className="detail__section" aria-labelledby="states-title">
            <h2 id="states-title">States</h2>
            <div className="states">
              {entry.states.map((state) => (
                <figure key={state.label} className="states__item">
                  <Stage className="states__stage" scene={entry.scene}>
                    <div inert aria-hidden="true">
                      <DemoBoundary name={state.label}>
                        <FitStage width={520}>{state.render()}</FitStage>
                      </DemoBoundary>
                    </div>
                  </Stage>
                  <figcaption>{state.label}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {entry.keys && entry.keys.length > 0 && (
          <section className="detail__section" aria-labelledby="keys-title">
            <h2 id="keys-title">Keyboard</h2>
            <KeyTable keys={entry.keys} />
          </section>
        )}

        {entry.file && (
          <section className="detail__section" aria-labelledby="source-title">
            <h2 id="source-title">Source</h2>
            <Source file={entry.file} />
          </section>
        )}

        <Pager entry={entry} />
      </article>
    </div>
  )
}

export { DetailPage }
