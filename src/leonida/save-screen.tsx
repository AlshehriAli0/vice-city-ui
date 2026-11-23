import { useShortcut } from "@ui-sdk/react/shortcuts";
import { useRef } from "react";

import { GameConfirm } from "./game-confirm";
import { GameScreen } from "./game-screen";
import { Detail, SavePrompts, SlotList, confirmCopy } from "./save-screen.parts";
import { useSaveScreen, type SaveScreenProps } from "./save-screen.state";

import "./save-screen.css";

const SaveScreen = (props: SaveScreenProps) => {
  const root = useRef<HTMLDivElement>(null);
  const state = useSaveScreen(props);
  const { mode, phase, confirm, asking, busy } = state;
  const forced = props.saving ? { phase: "saving", stage: "hold" } : null;

  const inside = () => Boolean(root.current?.contains(document.activeElement));
  useShortcut("x", state.remove, { when: () => inside() && !busy, description: "Delete (Square)" });
  useShortcut("backspace", state.back, { when: () => inside() && !busy, description: "Back (Circle)" });

  const copy = confirm ? confirmCopy(confirm, state.saves) : null;

  return (
    <div ref={root} className="ld-save-root">
      <GameScreen
        className="ld-save"
        role="region"
        aria-label={mode === "save" ? "Save game" : "Load game"}
        aria-busy={busy || undefined}
        data-mode={mode}
        data-intro={props.intro ?? "fade"}
        data-phase={forced?.phase ?? phase.kind}
        data-stage={forced?.stage ?? (phase.kind === "saving" ? phase.stage : undefined)}
        data-confirm={asking?.kind}
      >
        <div className="ld-save__bg" aria-hidden="true">
          <img className="ld-save__palms" src="/vc/ui-palms.webp" alt="" />
        </div>
        <div className="ld-save__content" data-hidden={state.hidden || undefined}>
          <header className="ld-save__crumb">
            <p className="ld-save__parent">Game /</p>
            <h2 className="ld-save__title">{mode === "save" ? "Save" : "Load"}</h2>
          </header>
          {state.rows.length > 0 && <SlotList state={state} autoFocus={Boolean(props.autoFocus)} />}
          <Detail row={state.current} />
          <SavePrompts state={state} />
        </div>
        <div className="ld-save__hold" aria-hidden="true" />
        {confirm && copy && (
          <GameConfirm
            open={confirm.open}
            variant={confirm.kind === "load" ? "sheet" : "screen"}
            title={copy.title}
            body={copy.body}
            consequence={copy.consequence}
            onAnswer={state.answer}
          />
        )}
      </GameScreen>
    </div>
  );
};

export { SaveScreen };
export type { SaveChangeReason, SaveScreenProps } from "./save-screen.state";
