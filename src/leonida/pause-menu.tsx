import { Button } from "@ui-sdk/react/button";
import { Toolbar, ToolbarButton } from "@ui-sdk/react/toolbar";
import { useEffect, useEffectEvent, useRef, useState, type ReactElement } from "react";

import { cssVariables } from "../ui/css-variables";
import { ButtonPrompt, ButtonPrompts } from "./button-prompt";
import { GameMenu, type GameMenuProps } from "./game-menu";
import { GameScreen } from "./game-screen";
import { PAUSE_ROWS } from "./pause-menu.data";
import { PauseWorld } from "./pause-world";

import "./pause-menu.css";

type PauseMenuProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  chapter?: string;
  title?: string;
  onSelect?: (value: string) => void;
  onAction?: (action: "retry" | "restart") => void;
  onResume?: () => void;
  badges?: string[];
  game?: Omit<GameMenuProps, "onBack" | "autoFocus"> | false;
};

function Status({ chapter, title, onAction }: Pick<PauseMenuProps, "chapter" | "title" | "onAction">): ReactElement {
  return (
    <div className="ld-pause__status">
      <p className="ld-pause__chapter">{chapter}</p>
      <h2 className="ld-pause__title">{title}</h2>
      <div className="ld-pause__actions" role="group" aria-label="Mission">
        <Button className="ld-pause__action" onClick={() => onAction?.("retry")}>
          Retry Checkpoint
        </Button>
        <Button className="ld-pause__action" onClick={() => onAction?.("restart")}>
          Restart Mission
        </Button>
      </div>
    </div>
  );
}

function PauseMenu({
  value,
  defaultValue = "map",
  onValueChange,
  chapter = "Chapter 1",
  title = "Mission Title",
  onSelect,
  onAction,
  onResume,
  badges = [],
  game = {},
}: PauseMenuProps): ReactElement {
  const [ownValue, setOwnValue] = useState(defaultValue);
  const [closing, setClosing] = useState(false);
  const [page, setPage] = useState<"pause" | "game" | "back">("pause");
  const refocus = useRef(false);
  const current = value ?? ownValue;

  const resume = useEffectEvent(() => onResume?.());

  useEffect(() => {
    if (!closing) return undefined;
    const timer = setTimeout(() => resume(), 600);
    return () => clearTimeout(timer);
  }, [closing]);

  const point = (next: string) => {
    if (next === current) return;
    setOwnValue(next);
    onValueChange?.(next);
  };

  const open = (row: string) => {
    onSelect?.(row);
    if (row === "game" && game) setPage("game");
  };

  if (page === "game" && game) {
    return (
      <GameMenu
        {...game}
        autoFocus
        onBack={() => {
          refocus.current = true;
          setPage("back");
        }}
      />
    );
  }

  return (
    <GameScreen className="ld-pause" data-closing={closing || undefined} data-return={page === "back" || undefined}>
      <PauseWorld />
      <div className="ld-pause__body">
        <div className="ld-pause__panel">
          <span className="ld-pause__mark" aria-hidden="true">
            VC
          </span>
          <Toolbar
            ref={element => {
              if (!element || !refocus.current) return;
              refocus.current = false;
              element.querySelector<HTMLElement>("[data-current]")?.focus();
            }}
            className="ld-pause__list"
            orientation="vertical"
            aria-label="Pause menu"
          >
            {PAUSE_ROWS.map(({ value: row, label, Icon }, index) => (
              <ToolbarButton
                key={row}
                className="ld-pause__row"
                data-current={row === current || undefined}
                style={cssVariables({ "--i": index })}
                onFocus={() => point(row)}
                onClick={() => open(row)}
              >
                <span className="ld-pause__icon" data-icon={row} aria-hidden="true">
                  <Icon absoluteStrokeWidth strokeWidth={2.4} />
                  {badges.includes(row) && <span className="ld-pause__badge" />}
                </span>
                {label}
              </ToolbarButton>
            ))}
          </Toolbar>
        </div>
        <div className="ld-pause__right">
          <Status chapter={chapter} title={title} onAction={onAction} />
        </div>
      </div>
      <ButtonPrompts label="Pause menu prompts">
        <ButtonPrompt glyph="square" onClick={() => onSelect?.("photo")}>
          Photo Studio
        </ButtonPrompt>
        <ButtonPrompt glyph="cross" onClick={() => open(current)}>
          Select
        </ButtonPrompt>
        <ButtonPrompt glyph="circle" onClick={() => setClosing(true)}>
          Back
        </ButtonPrompt>
      </ButtonPrompts>
    </GameScreen>
  );
}

export { PauseMenu };
export type { PauseMenuProps };
