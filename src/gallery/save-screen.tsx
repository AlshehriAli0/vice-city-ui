import { lazy, useState } from "react";

import type { GameMenuScreen } from "../leonida/game-menu";
import { toast } from "../leonida/mission-toast.store";
import {
  SAVE_ART,
  SLOT_COUNT,
  SUMMARY,
  saveLabel,
  slotRows,
  toLocalIso,
  type SaveGame,
} from "../leonida/save-screen.data";
import { optionValue, options as labeledOptions } from "./options";
import type { Demo, Playground, Values } from "./types";

const GameMenu = lazy(() => import("../leonida/game-menu").then(module => ({ default: module.GameMenu })));

const SCREENS = labeledOptions(["menu", "Game menu"], ["save", "Save"], ["load", "Load"]);

const minutesBefore = (minutes: number) => toLocalIso(new Date(2026, 10, 20, 21, 16 - minutes));

const demoSaves = (used: number, autosave: boolean): SaveGame[] => {
  const manual = Array.from({ length: used }, (_, index) => {
    const chapter = used - index;
    return {
      id: `slot-${chapter}`,
      title: `Chapter ${chapter}`,
      completion: Math.round(chapter * 3.4),
      date: minutesBefore(index * 397),
      image: SAVE_ART[index % SAVE_ART.length],
      summary: SUMMARY,
    };
  });
  if (!autosave) return manual;
  const auto: SaveGame = manual[0]
    ? { ...manual[0], id: "autosave", autosave: true, date: minutesBefore(1) }
    : { id: "autosave", title: "Prologue", completion: 1, date: minutesBefore(1), autosave: true, image: SAVE_ART[0] };
  return [auto, ...manual];
};

const screenOf = (values: Values): GameMenuScreen => optionValue(values.screen, SCREENS) ?? "menu";

const GameMenuDemo = ({ values, set }: Playground) => {
  const used = Number(values.used);
  const autosave = Boolean(values.autosave);
  const [run, setRun] = useState(0);
  const [source, setSource] = useState({ used, autosave });
  const [saves, setSaves] = useState(() => demoSaves(used, autosave));
  if (source.used !== used || source.autosave !== autosave) {
    setSource({ used, autosave });
    setSaves(demoSaves(used, autosave));
  }
  const screen = screenOf(values);
  const rows = slotRows(screen === "load" ? "load" : "save", saves);
  const slot = rows[Math.min(rows.length, Number(values.slot)) - 1]?.id ?? null;

  const restart = (message: string) => {
    toast(message);
    set("screen", "menu");
    setRun(n => n + 1);
  };

  return (
    <GameMenu
      key={run}
      screen={screen}
      onScreenChange={next => set("screen", next)}
      saves={saves}
      onSavesChange={next => {
        const count = next.filter(save => !save.autosave).length;
        setSaves(next);
        setSource({ used: count, autosave });
        set("used", count);
      }}
      slot={slot}
      onSlotChange={id => set("slot", rows.findIndex(row => row.id === id) + 1)}
      saving={Boolean(values.saving)}
      saveDisabled={Boolean(values.mission)}
      onLoad={save => restart(`Loaded ${saveLabel(save)}`)}
      onNewGame={() => restart("Starting a new game")}
      onBack={() => toast("Back to the pause menu")}
    />
  );
};

const saveScreenDemos: Demo[] = [
  {
    id: "save-screen",
    file: "leonida/save-screen",
    name: "Save & Load",
    sdk: "Toolbar · Listbox · Alert Dialog · Button",
    caption:
      "Pause › Game at 1080p: Save Game, Load Game and New Game on the pause panel, then the plum GAME / SAVE list of 15 slots with the screenshot and summary of the focused save. Overwrite, Delete and New Game ask on a full-screen sunset; Load asks on a dark sheet. Saving is a flat plum hold, no spinner.",
    wide: true,
    frame: false,
    keys: [
      ["↑ ↓", "Move the bar. The slot list scrolls a row at a time past row 9"],
      ["Enter", "Select, Save into an empty slot, Overwrite or Load (Cross)"],
      ["X", "Delete the focused save (Square)"],
      ["Backspace", "Back, or No on a confirm (Circle)"],
    ],
    controls: [
      { type: "select", name: "screen", label: "Screen", options: SCREENS },
      { type: "number", name: "slot", label: "Selected slot", min: 1, max: SLOT_COUNT, step: 1 },
      { type: "number", name: "used", label: "Used slots", min: 0, max: SLOT_COUNT, step: 1 },
      { type: "boolean", name: "autosave", label: "Autosave" },
      { type: "boolean", name: "saving", label: "Saving" },
      { type: "boolean", name: "mission", label: "In a mission" },
    ],
    defaults: { screen: "menu", slot: 1, used: 6, autosave: true, saving: false, mission: false },
    examples: [
      { label: "Game", values: {} },
      { label: "Save", values: { screen: "save" } },
      { label: "Empty slot", values: { screen: "save", slot: 7 } },
      { label: "Load", values: { screen: "load", slot: 2 } },
      { label: "No saves", values: { screen: "load", used: 0, autosave: false } },
      { label: "Saving", values: { screen: "save", slot: 7, saving: true } },
    ],
    code: v => `<GameMenu
  screen="${screenOf(v)}"
  onScreenChange={setScreen}
  saves={saves}
  onSavesChange={setSaves}
  slot={slot}
  onSlotChange={setSlot}
  saving={${Boolean(v.saving)}}
  saveDisabled={${Boolean(v.mission)}}
  onLoad={(save) => loadGame(save)}
  onNewGame={startNewGame}
  onBack={closeGameMenu}
/>`,
    render: playground => <GameMenuDemo {...playground} />,
  },
];

export { saveScreenDemos };
