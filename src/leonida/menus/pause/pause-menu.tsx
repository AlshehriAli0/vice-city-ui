import { Button } from "@ui-sdk/react/button";
import { useShortcut } from "@ui-sdk/react/shortcuts";
import { Toolbar, ToolbarButton } from "@ui-sdk/react/toolbar";
import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";

import { cssVariables } from "../../../shared/css-variables";
import { ButtonPrompt, ButtonPrompts } from "../../shared/button-prompt";
import { GameScreen } from "../../shared/game-screen";
import { GameMenu, type GameMenuProps } from "../game/game-menu";
import { MapScreen } from "../map/map-screen";
import type { MapScreenProps } from "../map/use-map-navigation";
import { SettingsScreen, type SettingsScreenProps } from "../settings/settings-screen";
import { PAUSE_ROWS } from "./pause-menu-rows";
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
  map?: Omit<MapScreenProps, "onExit"> | false;
  settings?: Omit<SettingsScreenProps, "onBack"> | false;
};

type Screen = "game" | "map" | "settings";
type Page = "pause" | Screen | "back";

const isScreen = (row: string): row is Screen => row === "game" || row === "map" || row === "settings";

const Status = ({ chapter, title, onAction }: Pick<PauseMenuProps, "chapter" | "title" | "onAction">) => (
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

const PauseMenu = ({
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
  map = {},
  settings = {},
}: PauseMenuProps) => {
  const [ownValue, setOwnValue] = useState(defaultValue);
  const [closing, setClosing] = useState(false);
  const [page, setPage] = useState<Page>("pause");
  const refocus = useRef(false);
  const entering = useRef(false);
  const screenRoot = useRef<HTMLDivElement | null>(null);
  const current = value ?? ownValue;
  const screens = { game, map, settings };

  const back = () => {
    refocus.current = true;
    setPage("back");
  };

  useShortcut("backspace", back, {
    when: () =>
      (page === "map" || page === "settings") && Boolean(screenRoot.current?.contains(document.activeElement)),
    description: "Back (Circle)",
  });

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
    point(row);
    onSelect?.(row);
    if (!isScreen(row) || !screens[row]) return;
    entering.current = true;
    setPage(row);
  };

  const inScreen = (screen: ReactNode) => (
    <div
      ref={element => {
        screenRoot.current = element;
        if (!element || !entering.current) return;
        entering.current = false;
        element.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus();
      }}
      className="ld-pause-screen"
    >
      {screen}
    </div>
  );

  if (page === "game" && game) return <GameMenu {...game} autoFocus onBack={back} />;
  if (page === "map" && map) return inScreen(<MapScreen {...map} onExit={back} />);
  if (page === "settings" && settings) return inScreen(<SettingsScreen {...settings} onBack={back} />);

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
};

export { PauseMenu };
export type { PauseMenuProps };
