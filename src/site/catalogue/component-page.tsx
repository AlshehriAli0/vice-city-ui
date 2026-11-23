import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useLayoutEffect, useRef } from "react";

import { Source } from "../code/component-source";
import { FrameCrop } from "../playground/crop-stage";
import { DemoBoundary } from "../playground/demo-boundary";
import { FitStage } from "../playground/fit-stage";
import { ControlsPanel, Examples, Usage } from "../playground/playground";
import { usePlayground } from "../playground/playground-state";
import { BY_ID, ENTRIES, sections, type Entry } from "./catalogue";
import { hrefOf } from "./hash-route";

const ComponentNav = ({ current }: { current: string }) => (
  <nav className="side-nav" aria-label="Components">
    {sections.map(section => (
      <div key={section.id} className="side-nav__group">
        <p className="side-nav__title">{section.title}</p>
        <ul>
          {section.entries.map(entry => (
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
);

const Pager = ({ entry }: { entry: Entry }) => {
  const index = ENTRIES.indexOf(entry);
  const prev = index > 0 ? ENTRIES[index - 1] : undefined;
  const next = ENTRIES.at(index + 1);
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
  );
};

const KeyTable = ({ keys }: { keys: [string, string][] }) => (
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
);

const DetailPage = ({ id }: { id: string }) => {
  const entry = BY_ID.get(id);
  return entry ? <DetailContent entry={entry} /> : <UnknownComponent />;
};

const UnknownComponent = (): null => {
  useEffect(() => window.location.replace("#/"), []);
  return null;
};

const DetailPlayground = ({ entry }: { entry: Entry }) => {
  const playground = usePlayground(entry);
  const fallback = entry.detailFrame ? (
    <div className="detail__frame-placeholder" data-phone={entry.detailFrame === "phone" || undefined} />
  ) : undefined;

  return (
    <>
      <Examples demo={entry} values={playground.values} apply={playground.apply} reset={playground.reset} />
      <div className="detail__stage">
        <DemoBoundary name={entry.name} fallback={fallback}>
          {entry.detailCrop ? (
            <FrameCrop crop={entry.detailCrop}>{entry.render(playground)}</FrameCrop>
          ) : (
            entry.render(playground)
          )}
        </DemoBoundary>
      </div>
      <ControlsPanel demo={entry} state={playground} />
      <p className="detail__notes">{entry.caption}</p>
      <Usage demo={entry} values={playground.values} />
    </>
  );
};

const DetailContent = ({ entry }: { entry: Entry }) => {
  const title = useRef<HTMLHeadingElement>(null);
  const side = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    title.current?.focus({ preventScroll: true });
    const current = side.current?.querySelector<HTMLElement>(`a[href="${hrefOf(entry.id)}"]`);
    if (side.current && current) side.current.scrollTop = current.offsetTop - side.current.clientHeight / 2;
  }, [entry.id]);

  return (
    <div className="detail">
      <aside className="detail__side" ref={side}>
        <ComponentNav current={entry.id} />
      </aside>
      <article key={entry.id} className="detail__main" aria-labelledby="detail-title">
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

        <DetailPlayground entry={entry} />

        {entry.states && entry.states.length > 0 && (
          <section className="detail__section" aria-labelledby="states-title">
            <h2 id="states-title">States</h2>
            <div className="states">
              {entry.states.map(state => (
                <figure key={state.label} className="states__item">
                  <div className="states__stage">
                    <div inert aria-hidden="true">
                      <DemoBoundary name={state.label}>
                        <FitStage width={520}>{state.render()}</FitStage>
                      </DemoBoundary>
                    </div>
                  </div>
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

        {entry.source && (
          <section className="detail__section" aria-labelledby="source-title">
            <h2 id="source-title">Source</h2>
            <Source source={entry.source} />
          </section>
        )}

        <Pager entry={entry} />
      </article>
    </div>
  );
};

export { DetailPage };
