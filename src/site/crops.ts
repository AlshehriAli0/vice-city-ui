type Crop = { x: number; y: number; w: number; h: number; world?: number };

const FULL: Crop = { x: 0, y: 0, w: 1920, h: 1080 };

const CROPS: Partial<Record<string, Crop>> = {
  "wanted-level": { x: 1668, y: 12, w: 238, h: 63 },
  "hud-meters": { x: 0, y: 790, w: 600, h: 290 },
  "hint-tooltip": { x: 0, y: 230, w: 640, h: 220 },
  "button-prompt": { x: 1468, y: 890, w: 452, h: 190 },
  "pause-menu": FULL,
  "settings-screen": FULL,
  "map-screen": FULL,
  "mod-shop": FULL,
  "weapon-wheel": { x: 520, y: 40, w: 900, h: 860 },
  "radio-dial": { x: 430, y: 8, w: 1040, h: 316 },
  "phone-drawer": { x: 585, y: 60, w: 660, h: 1000 },
  "mission-toast": { x: 1420, y: 880, w: 500, h: 200 },
  "core-input": { x: 0, y: 0, w: 600, h: 300, world: 600 },
  "core-checkbox": { x: 0, y: 0, w: 600, h: 340, world: 600 },
  "core-cards": { x: 0, y: 0, w: 860, h: 500, world: 860 },
  "core-feedback": { x: 0, y: 0, w: 600, h: 350, world: 600 },
  "core-tabs": { x: 0, y: 0, w: 1010, h: 280, world: 1010 },
};

const FULL_ON_DETAIL = new Set(["hud-meters", "hint-tooltip", "phone-drawer"]);

const DETAIL_CROPS: Partial<Record<string, Crop>> = {
  "wanted-level": { x: 1668, y: 12, w: 238, h: 98 },
};

const detailCrop = (id: string): Crop | undefined => {
  const crop = DETAIL_CROPS[id] ?? CROPS[id];
  return crop && !crop.world && crop !== FULL && !FULL_ON_DETAIL.has(id) ? crop : undefined;
};

export { CROPS, detailCrop };
export type { Crop };
