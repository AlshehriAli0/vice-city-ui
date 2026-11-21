// Where each game demo's component sits in its 1920-wide frame, in 1080p px, measured from harness.html shots.
// Previews show only this box, so a corner widget isn't lost in an empty screen and the demo's own control chips stay out.
// `world` is the width the demo is laid out at before cropping: 1920 for game frames, the demo's own width otherwise.
type Crop = { x: number; y: number; w: number; h: number; world?: number }

const FULL: Crop = { x: 0, y: 0, w: 1920, h: 1080 }

const CROPS: Record<string, Crop> = {
  "wanted-level": { x: 1650, y: 16, w: 254, h: 76 },
  "hud-meters": { x: 0, y: 790, w: 600, h: 290 },
  "hint-tooltip": { x: 0, y: 230, w: 640, h: 220 },
  "button-prompt": { x: 1420, y: 850, w: 500, h: 230 },
  "pause-menu": FULL,
  "settings-screen": FULL,
  "map-screen": FULL,
  "weapon-wheel": { x: 520, y: 40, w: 900, h: 860 },
  "radio-dial": { x: 430, y: 10, w: 1040, h: 280 },
  "phone-drawer": { x: 600, y: 80, w: 660, h: 940 },
  "mission-toast": { x: 1420, y: 880, w: 500, h: 200 },
  // Wider than a card: lay out at full width, then fit the whole thing.
  // Tall kit demos: show the top of each, where the component reads at a useful size.
  "core-input": { x: 0, y: 0, w: 600, h: 300, world: 600 },
  "core-checkbox": { x: 0, y: 0, w: 600, h: 340, world: 600 },
  "core-cards": { x: 0, y: 0, w: 860, h: 500, world: 860 },
  "core-feedback": { x: 0, y: 0, w: 600, h: 350, world: 600 },
  "core-tabs": { x: 0, y: 0, w: 1010, h: 280, world: 1010 },
}

// Screens that fill the frame, and demos driven from elsewhere in it, keep the whole 1920x1080 scene on the detail stage.
// Kit demos (with a world width) always show whole there.
const FULL_ON_DETAIL = new Set(["hud-meters", "hint-tooltip", "phone-drawer"])

function detailCrop(id: string): Crop | undefined {
  const crop = CROPS[id]
  return crop && !crop.world && crop !== FULL && !FULL_ON_DETAIL.has(id) ? crop : undefined
}

export { CROPS, detailCrop }
export type { Crop }
