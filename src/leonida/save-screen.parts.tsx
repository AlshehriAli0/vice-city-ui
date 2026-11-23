import { Listbox, ListboxItem } from "@ui-sdk/react/listbox";
import { useRef } from "react";

import { cssVariables } from "../ui/css-variables";
import { ButtonPrompt, ButtonPrompts } from "./button-prompt";
import { VISIBLE_ROWS, autosaveOf, saveLabel, stamp, type SaveGame, type SlotRow } from "./save-screen.data";
import type { Confirm, SaveScreenState } from "./save-screen.state";

const confirmCopy = ({ kind, save }: Confirm, saves: SaveGame[]) => {
  const label = saveLabel(save);
  const when = stamp(save.date, " ");
  if (kind === "overwrite") {
    return {
      title: "Overwrite saved game?",
      body: `"${label}" (${when}) will be permanently overwritten with your new save.`,
      consequence: `Overwrites ${label} with your current progress`,
    };
  }
  if (kind === "delete") {
    return {
      title: "Delete saved game?",
      body: `"${label}" (${when}) will be permanently deleted.`,
      consequence: `Deletes ${label}`,
    };
  }
  const auto = autosaveOf(saves);
  const lost = auto && auto.id !== save.id ? ` and "${saveLabel(auto)}"` : "";
  return {
    title: "Load saved game?",
    body: `Loading this save will cause any unsaved progress from your current session${lost} to be lost.`,
    consequence: `Loads ${label} and loses unsaved progress`,
  };
};

const Detail = ({ row }: { row: SlotRow | null }) => {
  const save = row?.save;
  return (
    <section className="ld-save__detail" aria-label="Slot details" aria-live="polite">
      <h3 className="ld-save__heading">{save ? saveLabel(save) : "Empty Slot"}</h3>
      <div className="ld-save__shotbox">{save?.image && <img className="ld-save__shot" src={save.image} alt="" />}</div>
      <p className="ld-save__summary">{save ? save.summary : "Save your progress in a new slot."}</p>
    </section>
  );
};

const SlotList = ({ state, autoFocus }: { state: SaveScreenState; autoFocus: boolean }) => {
  const { mode, rows, current, top } = state;
  const pending = useRef(autoFocus);
  const vars = cssVariables({ "--scroll": top, "--rows": rows.length });

  return (
    <>
      <div className="ld-save__view" data-more-below={top + VISIBLE_ROWS < rows.length || undefined} style={vars}>
        <Listbox
          ref={element => {
            if (!element || !pending.current) return;
            pending.current = false;
            element.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
          }}
          className="ld-save__list"
          aria-label={mode === "save" ? "Save slots" : "Saved games"}
          value={current?.id ?? null}
          onValueChange={next => {
            if (typeof next === "string") state.select(next);
          }}
          onKeyDown={event => {
            if (event.key !== "Enter" || event.defaultPrevented) return;
            event.preventDefault();
            state.primary();
          }}
          loop={false}
        >
          {rows.map(row => {
            const label = row.save ? saveLabel(row.save) : "Empty Slot";
            return (
              <ListboxItem
                key={row.id}
                value={row.id}
                label={label}
                className="ld-save__row"
                data-empty={row.save ? undefined : true}
                onClick={() => {
                  if (row.id === current?.id) state.primary();
                }}
              >
                <span className="ld-save__label">{label}</span>
                {row.save && (
                  <time className="ld-save__date" dateTime={row.save.date}>
                    {stamp(row.save.date)}
                  </time>
                )}
              </ListboxItem>
            );
          })}
        </Listbox>
      </div>
      {rows.length > VISIBLE_ROWS && <div className="ld-save__scrollbar" aria-hidden="true" style={vars} />}
      {mode === "save" && (
        <p className="ld-save__count">
          <b>{state.index + 1}</b> / {state.slots}
        </p>
      )}
    </>
  );
};

const SavePrompts = ({ state }: { state: SaveScreenState }) => {
  const { mode, current } = state;
  const filled = Boolean(current?.save);
  const action = filled ? "Overwrite" : "Save";
  return (
    <ButtonPrompts label={mode === "save" ? "Save prompts" : "Load prompts"}>
      {filled && (
        <ButtonPrompt glyph="square" onClick={state.remove}>
          Delete
        </ButtonPrompt>
      )}
      {(filled || mode === "save") && (
        <ButtonPrompt glyph="cross" onClick={state.primary}>
          {mode === "load" ? "Load" : action}
        </ButtonPrompt>
      )}
      <ButtonPrompt glyph="circle" onClick={state.back}>
        Back
      </ButtonPrompt>
    </ButtonPrompts>
  );
};

export { Detail, SavePrompts, SlotList, confirmCopy };
