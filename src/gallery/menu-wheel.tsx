import { lazy } from "react";

import type { RadioSource } from "../leonida/radio-dial";
import { STATIONS } from "../leonida/radio-dial.data";
import { WEAPONS, ITEMS } from "./menu-equipment";
import { optionValue, options as labeledOptions } from "./options";
import type { Demo } from "./types";

const RadioDial = lazy(() => import("../leonida/radio-dial").then(module => ({ default: module.RadioDial })));
const WeaponWheel = lazy(() => import("../leonida/weapon-wheel").then(module => ({ default: module.WeaponWheel })));

const WHEEL_TABS = labeledOptions(["weapons", "Weapons"], ["items", "Items"]);

const SOURCES: { value: RadioSource; label: string }[] = [
  { value: "vehicle", label: "Vehicle" },
  { value: "radio", label: "Radio" },
  { value: "demand", label: "On demand" },
];

const menuWheelDemos: Demo[] = [
  {
    id: "weapon-wheel",
    file: "leonida/weapon-wheel",
    frame: false,
    name: "Weapon Wheel",
    sdk: "Radio Group · Tabs",
    wide: true,
    caption:
      "Eight square tiles round the centre over the blurred world. The frame jumps, the name follows a beat later; Escape or Enter equips and closes.",
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
        options: WHEEL_TABS,
      },
      {
        type: "select",
        name: "inHand",
        label: "In hand",
        options: WEAPONS.flatMap(({ value, name }) => (name ? [{ value, label: name }] : [])),
      },
    ],
    defaults: { open: true, tab: "weapons", inHand: "unarmed" },
    examples: [
      { label: "Weapons", values: {} },
      { label: "Items", values: { tab: "items" } },
      { label: "Closed", values: { open: false } },
    ],
    code: v => `<WeaponWheel
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
        onOpenChange={open => set("open", open)}
        tab={optionValue(values.tab, WHEEL_TABS)}
        onTabChange={tab => set("tab", tab)}
        inHand={String(values.inHand)}
        onEquip={slot => set("inHand", slot)}
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
    caption:
      "One strip at the top: the focus frame stays put while the row slides. Tiles go grey when the radio is off.",
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
      {
        type: "select",
        name: "station",
        label: "Station",
        options: STATIONS.map(({ value, name }) => ({ value, label: name })),
      },
    ],
    defaults: { open: true, source: "radio", on: true, station: "flash" },
    examples: [
      { label: "Radio", values: {} },
      { label: "Vehicle", values: { source: "vehicle" } },
      { label: "On demand", values: { source: "demand" } },
      { label: "Off", values: { on: false } },
    ],
    code: v => `<RadioDial
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
        onOpenChange={open => set("open", open)}
        source={optionValue(values.source, SOURCES)}
        onSourceChange={source => set("source", source)}
        on={Boolean(values.on)}
        onOnChange={on => set("on", on)}
        value={String(values.station)}
        onValueChange={station => set("station", station)}
      />
    ),
  },
];

export { menuWheelDemos };
