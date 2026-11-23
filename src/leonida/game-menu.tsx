import { useShortcut } from "@ui-sdk/react/shortcuts";
import { Toolbar, ToolbarButton } from "@ui-sdk/react/toolbar";
import { useEffect, useEffectEvent, useRef, useState, type RefObject } from "react";

import { ButtonPrompt, ButtonPrompts } from "./button-prompt";
import { GameConfirm } from "./game-confirm";
import { GameScreen } from "./game-screen";
import { PauseWorld } from "./pause-world";
import { SaveScreen, type SaveScreenProps } from "./save-screen";
import { calm } from "./save-screen.data";

import "./pause-menu.css";
import "./game-menu.css";

type GameMenuScreen = "menu" | "save" | "load";
type GameMenuRow = "save" | "load" | "new";

const GAME_ROWS: { value: GameMenuRow; label: string }[] = [
  { value: "save", label: "Save Game" },
  { value: "load", label: "Load Game" },
  { value: "new", label: "New Game" },
];

type GameMenuProps = Pick<
  SaveScreenProps,
  "saves" | "defaultSaves" | "onSavesChange" | "progress" | "slots" | "saving" | "now" | "onSave" | "onLoad"
> & {
  screen?: GameMenuScreen;
  defaultScreen?: GameMenuScreen;
  onScreenChange?: (screen: GameMenuScreen) => void;
  value?: GameMenuRow;
  defaultValue?: GameMenuRow;
  onValueChange?: (row: GameMenuRow) => void;
  slot?: string | null;
  defaultSlot?: string | null;
  onSlotChange?: (id: string) => void;
  saveDisabled?: boolean;
  build?: string;
  autoFocus?: boolean;
  onNewGame?: () => void;
  onBack?: () => void;
};

type PanelProps = {
  current: GameMenuRow;
  saveDisabled: boolean;
  build: string;
  refocusRef: RefObject<boolean>;
  onPoint: (row: GameMenuRow) => void;
  onChoose: (row: GameMenuRow) => void;
  onBack?: () => void;
};

const GameMenuPanel = ({ current, saveDisabled, build, refocusRef, onPoint, onChoose, onBack }: PanelProps) => (
  <>
    <div className="ld-pause__panel ld-game__panel">
      <h2 className="ld-game__title">Game</h2>
      <Toolbar
        ref={element => {
          if (!element || !refocusRef.current) return;
          refocusRef.current = false;
          element.querySelector<HTMLElement>("[data-current]")?.focus();
        }}
        className="ld-game__list"
        orientation="vertical"
        aria-label="Game menu"
      >
        {GAME_ROWS.map(row => (
          <ToolbarButton
            key={row.value}
            className="ld-game__row"
            data-current={row.value === current || undefined}
            disabled={row.value === "save" && saveDisabled}
            onFocus={() => onPoint(row.value)}
            onClick={() => onChoose(row.value)}
          >
            {row.label}
          </ToolbarButton>
        ))}
      </Toolbar>
      <p className="ld-game__build">{build}</p>
    </div>
    <ButtonPrompts label="Game menu prompts">
      <ButtonPrompt glyph="cross" onClick={() => onChoose(current)}>
        Select
      </ButtonPrompt>
      <ButtonPrompt glyph="circle" onClick={() => onBack?.()}>
        Back
      </ButtonPrompt>
    </ButtonPrompts>
  </>
);

const GameMenu = ({
  screen: screenProp,
  defaultScreen = "menu",
  onScreenChange,
  value,
  defaultValue = "save",
  onValueChange,
  slot,
  defaultSlot = null,
  onSlotChange,
  saveDisabled = false,
  build = "Build 1.00.000",
  autoFocus = false,
  onNewGame,
  onBack,
  ...saveProps
}: GameMenuProps) => {
  const root = useRef<HTMLDivElement>(null);
  const refocus = useRef(autoFocus);
  const [ownScreen, setOwnScreen] = useState(defaultScreen);
  const [ownValue, setOwnValue] = useState(defaultValue);
  const [ownSlot, setOwnSlot] = useState(defaultSlot);
  const [arrival, setArrival] = useState<"start" | "dip" | "return">("start");
  const [asking, setAsking] = useState(false);
  const [ending, setEnding] = useState(false);
  const screen = screenProp ?? ownScreen;
  const current = value ?? ownValue;

  const go = (next: GameMenuScreen, how: "dip" | "return") => {
    refocus.current = how === "return";
    setArrival(how);
    setOwnScreen(next);
    onScreenChange?.(next);
  };

  const point = (row: GameMenuRow) => {
    if (row === current) return;
    setOwnValue(row);
    onValueChange?.(row);
  };

  const choose = (row: GameMenuRow) => {
    if (row === "save" && saveDisabled) return;
    if (row === "new") setAsking(true);
    else go(row, "dip");
  };

  const end = useEffectEvent(() => onNewGame?.());
  useEffect(() => {
    if (!ending) return undefined;
    const timer = setTimeout(() => end(), calm() ? 0 : 300);
    return () => clearTimeout(timer);
  }, [ending]);

  const inside = () => Boolean(root.current?.contains(document.activeElement));
  useShortcut("backspace", () => onBack?.(), {
    when: () => screen === "menu" && !asking && inside(),
    description: "Back (Circle)",
  });

  return (
    <div ref={root} className="ld-game-root">
      <GameScreen
        className="ld-pause ld-game"
        role="region"
        aria-label="Game"
        data-screen={screen}
        data-arrival={arrival}
        data-ending={ending || undefined}
      >
        <PauseWorld />
        {screen === "menu" ? (
          <div className="ld-game__menu">
            <GameMenuPanel
              current={current}
              saveDisabled={saveDisabled}
              build={build}
              refocusRef={refocus}
              onPoint={point}
              onChoose={choose}
              onBack={onBack}
            />
            <GameConfirm
              open={asking}
              title="Start new game?"
              body="Any unsaved progress will be lost."
              consequence="Starts a new game and loses any unsaved progress"
              onAnswer={yes => {
                setAsking(false);
                if (yes) setEnding(true);
              }}
            />
          </div>
        ) : (
          <div className="ld-game__screen">
            <SaveScreen
              key={screen}
              {...saveProps}
              mode={screen}
              intro={arrival === "dip" ? "dip" : "fade"}
              value={slot === undefined ? ownSlot : slot}
              onValueChange={id => {
                setOwnSlot(id);
                onSlotChange?.(id);
              }}
              autoFocus
              onBack={() => go("menu", "return")}
            />
          </div>
        )}
        <div className="ld-game__end" aria-hidden="true" />
      </GameScreen>
    </div>
  );
};

export { GAME_ROWS, GameMenu };
export type { GameMenuProps, GameMenuRow, GameMenuScreen };
