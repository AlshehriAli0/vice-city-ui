import { coreDisplay } from "./core-display";
import { coreForms } from "./core-forms";
import { hud } from "./hud";
import { menus } from "./menus";
import { official } from "./official";
import { phone } from "./phone";
import type { Demo, Section } from "./types";

type Chapter = Omit<Section, "demos"> & { ids: string[] };

const CHAPTERS: Chapter[] = [
  {
    id: "hud",
    title: "HUD",
    theme: "night",
    kicker: "Everything on screen while you play",
    scene: true,
    ids: ["wanted-level", "hud-meters", "hint-tooltip", "button-prompt"],
  },
  {
    id: "menus",
    title: "Menus",
    theme: "dustyNeon",
    kicker: "Pause, settings and map",
    scene: true,
    ids: ["pause-menu", "settings-screen", "map-screen"],
  },
  {
    id: "wheel-radio",
    title: "Wheel & radio",
    theme: "hotSun",
    kicker: "Weapons and stations",
    scene: true,
    ids: ["weapon-wheel", "radio-dial"],
  },
  {
    id: "phone",
    title: "Phone",
    theme: "blueSky",
    kicker: "Calls, texts and the handset",
    scene: true,
    ids: ["phone-drawer", "mission-toast"],
  },
  { id: "leonida", title: "Leonida", theme: "swamp", kicker: "Places", ids: ["postcard-tabs"] },
  { id: "forms", title: "Forms", theme: "blueSky", kicker: "Everyday inputs with a Vice City finish", ids: [] },
  { id: "display", title: "Display", theme: "dustyNeon", kicker: "Cards, overlays and feedback", ids: [] },
];

const HOMES: [Demo[], string][] = [
  [hud, "hud"],
  [menus, "menus"],
  [phone, "phone"],
  [official, "leonida"],
  [coreForms, "forms"],
  [coreDisplay, "display"],
];

const byId = new Map(HOMES.flatMap(([demos]) => demos.map(demo => [demo.id, demo] as const)));
const named = new Set(CHAPTERS.flatMap(chapter => chapter.ids));

const sections: Section[] = CHAPTERS.map(({ ids, id, title, kicker, theme, scene }) => {
  const listed = ids.flatMap(demoId => byId.get(demoId) ?? []);
  const rest = HOMES.filter(([, home]) => home === id).flatMap(([demos]) => demos.filter(demo => !named.has(demo.id)));
  return { id, title, kicker, theme, scene, demos: [...listed, ...rest] };
}).filter(section => section.demos.length > 0);

export { sections };
