type SaveGame = {
  id: string;
  title: string;
  completion: number;
  date: string;
  autosave?: boolean;
  image?: string;
  summary?: string;
};

type SaveProgress = Pick<SaveGame, "title" | "completion" | "image" | "summary">;

type SaveMode = "save" | "load";

type SlotRow = { id: string; save: SaveGame | null };

const SLOT_COUNT = 15;
const VISIBLE_ROWS = 10;

const SAVE_ART = [
  "/vc/shot-sea-sunset.jpg",
  "/vc/ue-grotti-cheetah.jpg",
  "/vc/art-vice-city.jpg",
  "/vc/art-leonida-keys.jpg",
  "/vc/art-port-gellhorn.jpg",
  "/vc/art-ambrosia.jpg",
];

const SUMMARY = "Mission summary. One or two lines about where this save picks up.";

const DEMO_SAVES: SaveGame[] = [
  { id: "c6", title: "Chapter 6", completion: 21, date: "2026-11-20T21:16", image: SAVE_ART[0], summary: SUMMARY },
  { id: "c5", title: "Chapter 5", completion: 17, date: "2026-11-20T16:49", image: SAVE_ART[1], summary: SUMMARY },
  { id: "c4", title: "Chapter 4", completion: 12, date: "2026-11-19T19:44", image: SAVE_ART[2], summary: SUMMARY },
  { id: "c3", title: "Chapter 3", completion: 9, date: "2026-11-19T02:39", image: SAVE_ART[3], summary: SUMMARY },
  { id: "c2", title: "Chapter 2", completion: 6, date: "2026-11-18T21:58", image: SAVE_ART[4], summary: SUMMARY },
  { id: "c1", title: "Chapter 1", completion: 3, date: "2026-11-18T15:20", image: SAVE_ART[5], summary: SUMMARY },
];

const DEMO_AUTOSAVE: SaveGame = {
  id: "auto",
  title: "Chapter 6",
  completion: 21,
  date: "2026-11-20T21:15",
  autosave: true,
  image: SAVE_ART[0],
  summary: SUMMARY,
};

const DEMO_PROGRESS: SaveProgress = { title: "Chapter 7", completion: 24, image: SAVE_ART[2], summary: SUMMARY };

const saveLabel = (save: SaveGame): string =>
  `${save.autosave ? "(Autosave) " : ""}${save.title} (${save.completion}%)`;

const pad = (value: number) => String(value).padStart(2, "0");

const stamp = (iso: string, gap = "  "): string => {
  const [, year = "", month = "", day = "", hour = "", minute = ""] =
    /^\d\d(\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d)/.exec(iso) ?? [];
  return `${month}/${day}/${year}${gap}${hour}:${minute}`;
};

const toLocalIso = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

const newest = (a: SaveGame, b: SaveGame) => b.date.localeCompare(a.date) || Number(a.autosave) - Number(b.autosave);

const slotRows = (mode: SaveMode, saves: SaveGame[], slots = SLOT_COUNT): SlotRow[] => {
  if (mode === "load") return saves.toSorted(newest).map(save => ({ id: save.id, save }));
  const manual = saves.filter(save => !save.autosave).toSorted(newest);
  const empty = Array.from({ length: Math.max(0, slots - manual.length) }, (_, index) => ({
    id: `empty-${index + 1}`,
    save: null,
  }));
  return [...manual.map(save => ({ id: save.id, save })), ...empty];
};

const autosaveOf = (saves: SaveGame[]) => saves.find(save => save.autosave) ?? null;

const calm = (): boolean =>
  typeof document !== "undefined" &&
  (document.documentElement.dataset.motion === "still" ||
    (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches));

export {
  DEMO_AUTOSAVE,
  DEMO_PROGRESS,
  DEMO_SAVES,
  SAVE_ART,
  SLOT_COUNT,
  SUMMARY,
  VISIBLE_ROWS,
  autosaveOf,
  calm,
  saveLabel,
  slotRows,
  stamp,
  toLocalIso,
};
export type { SaveGame, SaveMode, SaveProgress, SlotRow };
