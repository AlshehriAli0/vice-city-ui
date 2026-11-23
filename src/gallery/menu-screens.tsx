import { lazy, useState } from "react";

import { MAX_ZOOM } from "../leonida/map-screen.camera.geometry";
import { MAP_CATEGORIES, MAP_TABS } from "../leonida/map-screen.data";
import { toast } from "../leonida/mission-toast.store";
import { PAUSE_ROWS } from "../leonida/pause-menu.data";
import { CATEGORIES } from "../leonida/settings-screen.data";
import { optionValue, options as labeledOptions } from "./options";
import type { Demo, Playground } from "./types";
import { useAction } from "./use-action";

const MapScreen = lazy(() => import("../leonida/map-screen").then(module => ({ default: module.MapScreen })));
const PauseMenu = lazy(() => import("../leonida/pause-menu").then(module => ({ default: module.PauseMenu })));
const SettingsScreen = lazy(() =>
  import("../leonida/settings-screen").then(module => ({ default: module.SettingsScreen }))
);

const SCREEN_ROWS = new Set(["map", "game", "settings"]);

const MAP_VIEWS = labeledOptions(["3d", "3D"], ["2d", "2D"]);

const labelOf = (list: { value: string; label: string }[], value: unknown) =>
  list.find(item => item.value === value)?.label ?? "";

const useReplay = (subscribeAction: Playground["subscribeAction"]): [number, () => void] => {
  const [run, setRun] = useState(0);
  const replay = () => setRun(n => n + 1);
  useAction(subscribeAction, "replay", replay);
  return [run, replay];
};

const PauseDemo = ({ values, set, subscribeAction }: Playground) => {
  const [run, replay] = useReplay(subscribeAction);
  return (
    <PauseMenu
      key={run}
      value={String(values.row)}
      onValueChange={row => set("row", row)}
      chapter={String(values.chapter)}
      title={String(values.title)}
      onSelect={row => {
        if (!SCREEN_ROWS.has(row)) toast(`Opening ${labelOf(PAUSE_ROWS, row)}`);
      }}
      onAction={action => toast(action === "retry" ? "Back to the last checkpoint" : "Mission restarted")}
      onResume={replay}
    />
  );
};

const MapDemo = ({ values, set, subscribeAction }: Playground) => {
  const [run, replay] = useReplay(subscribeAction);
  return (
    <MapScreen
      key={run}
      value={String(values.tab)}
      onValueChange={tab => set("tab", tab)}
      cash={Number(values.cash)}
      time={String(values.time)}
      zoom={Number(values.zoom)}
      onZoomChange={zoom => set("zoom", Math.round(zoom * 20) / 20)}
      destination={values.destination === "none" ? null : String(values.destination)}
      onDestinationChange={destination => set("destination", destination ?? "none")}
      view={optionValue(values.view, MAP_VIEWS)}
      onViewChange={view => set("view", view)}
      onExit={replay}
    />
  );
};

const menuScreensDemos: Demo[] = [
  {
    id: "pause-menu",
    file: "leonida/pause-menu",
    name: "Pause Menu",
    sdk: "Toolbar · Button",
    caption:
      "The pause menu at 1080p: blurred world, a 544px panel that slides in, the smear bar and filled icons. Map, Game and Settings open their screens in place, and Back returns to the row. Back on the menu plays the unpause, then the 750ms open runs again.",
    wide: true,
    frame: false,
    keys: [
      ["↑ ↓", "Move the bar between Map, Game, Store, Help, Photo Studio and Settings"],
      ["Enter / Space", "Open the row with the bar: Map, Game and Settings open their screens"],
      ["Backspace", "Back from a screen to its row"],
      ["Home / End", "First or last row"],
      ["Tab", "Into Retry Checkpoint, Restart Mission and the prompts"],
    ],
    controls: [
      { type: "select", name: "row", label: "Selected row", options: PAUSE_ROWS },
      { type: "text", name: "chapter", label: "Chapter" },
      { type: "text", name: "title", label: "Mission title" },
    ],
    defaults: { row: "map", chapter: "Chapter 1", title: "Mission Title" },
    actions: [{ name: "replay", label: "Replay open animation" }],
    examples: [
      { label: "Map", values: {} },
      { label: "Store", values: { row: "store" } },
      { label: "Settings", values: { row: "settings" } },
    ],
    code: v => `<PauseMenu
  value="${v.row}"
  onValueChange={setRow}
  chapter="${v.chapter}"
  title="${v.title}"
  onSelect={openScreen} // Map, Game and Settings open in place; pass map={false} to handle one yourself
  onAction={(action) => (action === "retry" ? retry() : restart())}
  onResume={resume}
/>`,
    render: playground => <PauseDemo {...playground} />,
  },
  {
    id: "settings-screen",
    file: "leonida/settings-screen",
    name: "Settings",
    sdk: "Tabs · Switch · Segmented Control · Slider · Radio Group",
    caption:
      "Eight categories on a 68px pitch: cycle, toggle, slider and radio rows, with the description and line-art preview on the right.",
    wide: true,
    frame: false,
    keys: [
      ["↑ ↓", "Move between rows, whatever control each holds"],
      ["← →", "Cycle an option, move a slider or flip a toggle"],
      ["L1 / R1", "Previous or next category"],
      ["Space", "Flip a toggle"],
    ],
    controls: [{ type: "select", name: "category", label: "Category", options: CATEGORIES }],
    defaults: { category: "controller" },
    examples: [
      { label: "Controller", values: {} },
      { label: "Control Scheme", values: { category: "scheme" } },
      { label: "Display", values: { category: "display" } },
      { label: "Audio", values: { category: "audio" } },
    ],
    code: v => `<SettingsScreen
  value="${v.category}"
  onValueChange={setCategory}
  onBack={back}
/>`,
    render: ({ values, set }) => (
      <SettingsScreen value={String(values.category)} onValueChange={category => set("category", category)} />
    ),
  },
  {
    id: "map-screen",
    file: "leonida/map-screen",
    name: "Map",
    sdk: "Tabs · Radio Group · Button",
    caption:
      "The pause map: four tabs with a pink underline, a tilted map under a fixed centre cursor, cards with a pink top rule and the prompt stack. Drag or scroll the map; Set Destination draws the GPS route. Exit runs the open again.",
    wide: true,
    frame: false,
    keys: [
      ["Drag", "Pan the map, with a little inertia when you let go"],
      ["Wheel / pinch", "Zoom around the pointer"],
      ["← → ↑ ↓ / WASD", "Pan the focused map, like the left stick"],
      ["+ / −", "Hold to zoom at the cursor, like R2 and L2"],
      ["L1 / R1", "Previous or next tab"],
      ["↑ ↓", "Move through the legend rail; the camera glides to the blip"],
      ["Tab", "Into the legend and the prompts"],
    ],
    controls: [
      { type: "select", name: "tab", label: "Tab", options: MAP_TABS },
      { type: "number", name: "zoom", label: "Zoom", min: 0.7, max: MAX_ZOOM, step: 0.05 },
      {
        type: "select",
        name: "destination",
        label: "Destination",
        options: [
          { value: "none", label: "None" },
          ...MAP_CATEGORIES.filter(item => item.value !== "nav").map(({ value, label }) => ({ value, label })),
          { value: "marker", label: "Your marker" },
        ],
      },
      {
        type: "select",
        name: "view",
        label: "View",
        options: MAP_VIEWS,
      },
      { type: "number", name: "cash", label: "Cash", min: 0, max: 5000 },
      { type: "text", name: "time", label: "Clock" },
    ],
    defaults: { tab: "map", zoom: 1, destination: "none", view: "3d", cash: 601, time: "3:15 pm" },
    actions: [{ name: "replay", label: "Replay open animation" }],
    examples: [
      { label: "Map", values: {} },
      { label: "Route", values: { destination: "food" } },
      { label: "2D zoomed out", values: { view: "2d", zoom: 0.7 } },
      { label: "Brief", values: { tab: "brief" } },
    ],
    code: v => `<MapScreen
  value="${v.tab}"
  onValueChange={setTab}
  zoom={${Math.round(Number(v.zoom) * 100) / 100}}
  onZoomChange={setZoom}
  destination={${v.destination === "none" ? "null" : `"${v.destination}"`}}
  onDestinationChange={setDestination}
  view="${v.view}"
  onViewChange={setView}
  cash={${v.cash}}
  time="${v.time}"
  onExit={close}
/>`,
    render: playground => <MapDemo {...playground} />,
  },
];

export { menuScreensDemos };
