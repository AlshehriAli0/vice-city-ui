import { useState } from "react"
import { MAP_CATEGORIES, MAP_MAX_ZOOM, MAP_TABS, MapScreen, type MapView } from "../leonida/map-screen"
import { PAUSE_ROWS, PauseMenu } from "../leonida/pause-menu"
import { RadioDial, STATIONS, type RadioSource } from "../leonida/radio-dial"
import { CATEGORIES, SettingsScreen } from "../leonida/settings-screen"
import { toast } from "../leonida/mission-toast"
import { WeaponWheel, type Weapon, type WheelTab } from "../leonida/weapon-wheel"
import "../leonida/game-ui.css"
import type { Demo, Playground } from "./types"
import { useAction } from "./use-action"

const WEAPONS: Weapon[] = [
  { value: "pistol", category: "Sidearm", name: "Pistol", kind: "Service pistol", icon: "pistol", paint: "gunmetal", clip: 15, reserve: 69, rarity: "teal", stats: { damage: 4.2, accuracy: 5.2, handling: 8.4, range: 4.4 } },
  { value: "compact", category: "Sidearm", name: "Compact pistol", kind: "Sub-compact", icon: "pistol2", paint: "gunmetal", clip: 7, reserve: 53, rarity: "yellow", stats: { damage: 3.1, accuracy: 4.6, handling: 9.0, range: 3.2 } },
  { value: "unarmed", category: "Unarmed", name: "Unarmed", icon: "fist", paint: "skin" },
  { value: "binoculars", category: "Equipment", name: "Binoculars", icon: "binoculars", paint: "gunmetal" },
  { value: "explosives", category: "Explosives" },
  { value: "knife", category: "Melee", name: "Knife", icon: "knife", paint: "steel" },
  { value: "rifle", category: "Longarm", name: "Small game rifle", kind: "Bolt-action", icon: "rifle", paint: "wood", clip: 11, reserve: 170, rarity: "yellow", stats: { damage: 1.5, accuracy: 8.4, handling: 5.4, range: 6.7 } },
  { value: "longarm", category: "Longarm" },
]

const ITEMS: Weapon[] = [
  { value: "item-1", category: "Item" },
  { value: "item-2", category: "Item" },
  { value: "cap", category: "Headwear", name: "Cap", icon: "cap", paint: "red", worn: false },
  { value: "outfit", category: "Outfit", name: "Outfit", icon: "hanger", paint: "gunmetal", equipped: true },
  { value: "item-5", category: "Item" },
  { value: "item-6", category: "Item" },
  { value: "shades", category: "Eyewear", name: "Sunglasses", icon: "sunglasses", paint: "red", worn: false },
  { value: "item-8", category: "Item" },
]

const SOURCES: { value: RadioSource; label: string }[] = [
  { value: "vehicle", label: "Vehicle" },
  { value: "radio", label: "Radio" },
  { value: "demand", label: "On demand" },
]

const options = <T extends { value: string; label: string }>(list: T[]) => list.map(({ value, label }) => ({ value, label }))
const labelOf = (list: { value: string; label: string }[], value: unknown) => list.find((item) => item.value === value)?.label ?? ""

// Re-mounting replays a screen's open animation; the playground keeps its values, so the screen opens where it was.
function useReplay(count: number | undefined): [number, () => void] {
  const [run, setRun] = useState(0)
  const replay = () => setRun((n) => n + 1)
  useAction(count, replay)
  return [run, replay]
}

function PauseDemo({ values, set, fired }: Playground) {
  const [run, replay] = useReplay(fired.replay)
  return (
    <PauseMenu
      key={run}
      value={String(values.row)}
      onValueChange={(row) => set("row", row)}
      chapter={String(values.chapter)}
      title={String(values.title)}
      onSelect={(row) => toast(`Opening ${labelOf(PAUSE_ROWS, row)}`)}
      onAction={(action) => toast(action === "retry" ? "Back to the last checkpoint" : "Mission restarted")}
      onResume={replay}
    />
  )
}

function MapDemo({ values, set, fired }: Playground) {
  const [run, replay] = useReplay(fired.replay)
  return (
    <MapScreen
      key={run}
      value={String(values.tab)}
      onValueChange={(tab) => set("tab", tab)}
      cash={Number(values.cash)}
      time={String(values.time)}
      zoom={Number(values.zoom)}
      onZoomChange={(zoom) => set("zoom", Math.round(zoom * 20) / 20)}
      destination={values.destination === "none" ? null : String(values.destination)}
      onDestinationChange={(destination) => set("destination", destination ?? "none")}
      view={values.view as MapView}
      onViewChange={(view) => set("view", view)}
      onExit={replay}
    />
  )
}

const menus: Demo[] = [
  {
    id: "pause-menu",
    file: "leonida/pause-menu",
    name: "Pause Menu",
    sdk: "Toolbar · Button",
    caption: "The pause menu at 1080p: blurred world, a 544px panel that slides in, the smear bar and filled icons. Back plays the unpause, then the 750ms open runs again.",
    wide: true,
    frame: false,
    keys: [
      ["↑ ↓", "Move the bar between Map, Game, Store, Help, Photo Studio and Settings"],
      ["Enter / Space", "Open the row with the bar"],
      ["Home / End", "First or last row"],
      ["Tab", "Into Retry Checkpoint, Restart Mission and the prompts"],
    ],
    controls: [
      { type: "select", name: "row", label: "Selected row", options: options(PAUSE_ROWS) },
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
    code: (v) => `<PauseMenu
  value="${v.row}"
  onValueChange={setRow}
  chapter="${v.chapter}"
  title="${v.title}"
  onSelect={openScreen}
  onAction={(action) => (action === "retry" ? retry() : restart())}
  onResume={resume}
/>`,
    render: (playground) => <PauseDemo {...playground} />,
  },
  {
    id: "settings-screen",
    file: "leonida/settings-screen",
    name: "Settings",
    sdk: "Tabs · Switch · Segmented Control · Slider · Radio Group",
    caption: "Eight categories on a 68px pitch: cycle, toggle, slider and radio rows, with the description and line-art preview on the right.",
    wide: true,
    frame: false,
    keys: [
      ["↑ ↓", "Move between rows, whatever control each holds"],
      ["← →", "Cycle an option, move a slider or flip a toggle"],
      ["L1 / R1", "Previous or next category"],
      ["Space", "Flip a toggle"],
    ],
    controls: [{ type: "select", name: "category", label: "Category", options: options(CATEGORIES) }],
    defaults: { category: "controller" },
    examples: [
      { label: "Controller", values: {} },
      { label: "Control Scheme", values: { category: "scheme" } },
      { label: "Display", values: { category: "display" } },
      { label: "Audio", values: { category: "audio" } },
    ],
    code: (v) => `<SettingsScreen
  value="${v.category}"
  onValueChange={setCategory}
  onBack={back}
/>`,
    render: ({ values, set }) => <SettingsScreen value={String(values.category)} onValueChange={(category) => set("category", category)} />,
  },
  {
    id: "map-screen",
    file: "leonida/map-screen",
    name: "Map",
    sdk: "Tabs · Radio Group · Button",
    caption: "The pause map: four tabs with a pink underline, a tilted map under a fixed centre cursor, cards with a pink top rule and the prompt stack. Drag or scroll the map; Set Destination draws the GPS route. Exit runs the open again.",
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
      { type: "number", name: "zoom", label: "Zoom", min: 0.7, max: MAP_MAX_ZOOM, step: 0.05 },
      { type: "select", name: "destination", label: "Destination", options: [{ value: "none", label: "None" }, ...MAP_CATEGORIES.filter((item) => item.value !== "nav").map(({ value, label }) => ({ value, label })), { value: "marker", label: "Your marker" }] },
      {
        type: "select",
        name: "view",
        label: "View",
        options: [
          { value: "3d", label: "3D" },
          { value: "2d", label: "2D" },
        ],
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
    code: (v) => `<MapScreen
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
    render: (playground) => <MapDemo {...playground} />,
  },
  {
    id: "weapon-wheel",
    file: "leonida/weapon-wheel",
    frame: false,
    name: "Weapon Wheel",
    sdk: "Radio Group · Tabs",
    wide: true,
    caption: "Eight square tiles round the centre over the blurred world. The frame jumps, the name follows a beat later; Escape or Enter equips and closes.",
    keys: [
      ["← → ↑ ↓", "Move round the wheel"],
      ["Pointer", "Aim from the centre to pick a slot"],
      ["Tab", "Weapons and Items tabs"],
      ["Enter", "Equip the slot and close"],
      ["Escape", "Equip and close, wherever focus is"],
    ],
    controls: [
      { type: "boolean", name: "open", label: "Open" },
      {
        type: "select",
        name: "tab",
        label: "Wheel tab",
        options: [
          { value: "weapons", label: "Weapons" },
          { value: "items", label: "Items" },
        ],
      },
      { type: "select", name: "inHand", label: "In hand", options: WEAPONS.filter((slot) => slot.name).map((slot) => ({ value: slot.value, label: slot.name! })) },
    ],
    defaults: { open: true, tab: "weapons", inHand: "unarmed" },
    examples: [
      { label: "Weapons", values: {} },
      { label: "Items", values: { tab: "items" } },
      { label: "Closed", values: { open: false } },
    ],
    code: (v) => `<WeaponWheel
  weapons={weapons}
  items={items}
  open={${v.open}}
  onOpenChange={setOpen}
  tab="${v.tab}"
  onTabChange={setTab}
  inHand="${v.inHand}"
  onEquip={setInHand}
/>`,
    render: ({ values, set }) => (
      <WeaponWheel
        weapons={WEAPONS}
        items={ITEMS}
        defaultValue="pistol"
        open={Boolean(values.open)}
        onOpenChange={(open) => set("open", open)}
        tab={values.tab as WheelTab}
        onTabChange={(tab) => set("tab", tab)}
        inHand={String(values.inHand)}
        onEquip={(slot) => set("inHand", slot)}
      />
    ),
  },
  {
    id: "radio-dial",
    file: "leonida/radio-dial",
    frame: false,
    name: "Radio",
    sdk: "Radio Group · Button",
    wide: true,
    caption: "One strip at the top: the focus frame stays put while the row slides. Tiles go grey when the radio is off.",
    keys: [
      ["← →", "Previous or next station"],
      ["Q / E", "Previous or next, like L1 and R1"],
      ["↑ ↓", "Vehicle, Radio or On Demand, on the rail"],
      ["Escape", "Close"],
    ],
    controls: [
      { type: "boolean", name: "open", label: "Open" },
      { type: "select", name: "source", label: "Source shown", options: SOURCES },
      { type: "boolean", name: "on", label: "Radio on" },
      { type: "select", name: "station", label: "Station", options: STATIONS.map(({ value, name }) => ({ value, label: name })) },
    ],
    defaults: { open: true, source: "radio", on: true, station: "flash" },
    examples: [
      { label: "Radio", values: {} },
      { label: "Vehicle", values: { source: "vehicle" } },
      { label: "On demand", values: { source: "demand" } },
      { label: "Off", values: { on: false } },
    ],
    code: (v) => `<RadioDial
  open={${v.open}}
  onOpenChange={setOpen}
  source="${v.source}"
  onSourceChange={setSource}
  on={${v.on}}
  onOnChange={setOn}
  value="${v.station}"
  onValueChange={setStation}
/>`,
    render: ({ values, set }) => (
      <RadioDial
        open={Boolean(values.open)}
        onOpenChange={(open) => set("open", open)}
        source={values.source as RadioSource}
        onSourceChange={(source) => set("source", source)}
        on={Boolean(values.on)}
        onOnChange={(on) => set("on", on)}
        value={String(values.station)}
        onValueChange={(station) => set("station", station)}
      />
    ),
  },
]

export { WEAPONS, menus }
