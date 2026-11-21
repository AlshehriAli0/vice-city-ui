/* Settings rows, as captured from the PS5 build (specs/menus). Rows marked [I] in the spec are inferred names. */

type Preview = "controller" | "street" | "prompts" | "flash" | "hits" | "legend" | "hud"

type Base = { id: string; label: string; info: string; preview?: Preview; disabled?: boolean }

type Row =
  | (Base & { kind: "toggle"; start: boolean })
  | (Base & { kind: "cycle"; options: string[]; start: string })
  | (Base & { kind: "slider"; start: number; min?: number; max?: number })

type Choice = { value: string; label: string }

type Section =
  | { title: string; rows: Row[] }
  | { title: string; radio: { id: string; label: string; options: Choice[]; start: string; info: string; preview?: Preview } }

type Category = { value: string; label: string; sections: Section[] }

const toggle = (id: string, label: string, start: boolean, info: string, extra: Partial<Base> = {}): Row => ({ id, label, kind: "toggle", start, info, ...extra })
const cycle = (id: string, label: string, options: string[], start: string, info: string, extra: Partial<Base> = {}): Row => ({ id, label, kind: "cycle", options, start, info, ...extra })
const slider = (id: string, label: string, start: number, info: string, extra: Partial<Base> & { min?: number; max?: number } = {}): Row => ({ id, label, kind: "slider", start, info, ...extra })

const HOLD = ["Hold", "Press"]
const SIZES = ["Default", "Large"]
const INVERT = ["Default", "Inverted X", "Inverted Y", "Inverted X & Y"]

const CATEGORIES: Category[] = [
  {
    value: "scheme",
    label: "Control Scheme",
    sections: [
      { title: "Control Scheme", rows: [cycle("scheme", "Control Scheme", ["Default", "Classic", "Left-handed"], "Default", "The layout of actions across your controller.", { preview: "controller" })] },
      {
        title: "Preview",
        radio: {
          id: "scheme-preview",
          label: "Preview",
          start: "foot",
          preview: "controller",
          info: "Shows the controls for this situation with the current scheme.",
          options: [
            { value: "foot", label: "On Foot" },
            { value: "aiming", label: "Aiming" },
            { value: "melee", label: "Melee" },
            { value: "vehicles", label: "Land / Water Vehicles" },
            { value: "aircraft", label: "Aircraft" },
            { value: "bicycle", label: "Bicycle" },
          ],
        },
      },
    ],
  },
  {
    value: "controller",
    label: "Controller",
    sections: [
      {
        title: "Sensitivity",
        rows: [
          slider("look-sens", "Look Sensitivity", 7, "How fast the camera turns with the right stick.", { min: 1, max: 14 }),
          slider("aim-sens", "Aim Sensitivity", 7, "How fast the camera turns while aiming.", { min: 1, max: 14 }),
          slider("vehicle-sens", "Vehicle Look Sensitivity", 7, "How fast the camera turns in a vehicle.", { min: 1, max: 14 }),
        ],
      },
      {
        title: "Inverted Controls",
        rows: [
          cycle("invert-look", "Look", INVERT, "Default", "Flips the look axes on foot."),
          cycle("invert-move", "Movement", INVERT, "Default", "Flips the movement axes."),
          cycle("invert-map", "3D Map Rotation", INVERT, "Default", "Flips the axes when you rotate the 3D map."),
          toggle("aircraft-move", "Aircraft Movement", true, "Pushing forward pitches the nose down, as in a real aircraft."),
        ],
      },
      {
        title: "Controller Features",
        rows: [
          slider("vibration", "Vibration & Haptics Strength", 10, "The strength of vibration from your controller."),
          slider("dead-left", "Deadzone (Left Stick)", 4, "How far the left stick moves before it registers."),
          slider("dead-right", "Deadzone (Right Stick)", 4, "How far the right stick moves before it registers."),
          slider("trigger", "Trigger Effect Intensity", 10, "The resistance in the adaptive triggers."),
        ],
      },
    ],
  },
  {
    value: "gameplay",
    label: "Gameplay",
    sections: [
      { title: "Targeting", rows: [cycle("holster", "Holster in Vehicle", ["Automatic", "Manual"], "Automatic", "Whether your weapon is put away when you get into a vehicle.")] },
      {
        title: "Movement",
        rows: [
          cycle("move-speed", "Movement Speed", ["Walk", "Jog", "Run", "Sprint"], "Walk", "Your default speed on foot."),
          cycle("combat-speed", "Combat Movement Speed", ["Walk", "Fast Walk", "Jog"], "Fast Walk", "Your default speed on foot while armed."),
          toggle("stand-sprint", "Stand & Sprint", false, "Sprint without holding the button down."),
        ],
      },
      {
        title: "Accessibility",
        rows: [
          cycle("tap-assist", "Tap Assist", ["Off", "2x", "3x", "4x", "Hold"], "2x", "Choose how to complete actions requiring repeated presses.\n\nA single press can register as *2*, *3*, or *4* presses, or can be swapped to a *hold*."),
          cycle("hold-delay", "Hold Delay", ["Off", "0.1s", "0.2s", "0.3s", "0.4s", "0.5s", "0.6s", "0.7s", "0.8s", "0.9s", "1.0s"], "Off", "Adds a delay before a held button registers."),
          cycle("hold-assist", "Hold Assist", ["1x", "2x", "3x", "4x"], "4x", "Shortens how long actions have to be held."),
          cycle("directional", "Directional Button Actions", HOLD, "Hold", "Choose whether you hold or press the directional buttons."),
          cycle("aiming", "Aiming", HOLD, "Hold", "Choose whether you hold or press to aim."),
          cycle("interact", "Interact", HOLD, "Hold", "Choose whether you hold or press to interact."),
          cycle("loadout", "Loadout", HOLD, "Hold", "Choose whether you hold or press to open the loadout."),
          cycle("fishing", "Fishing", ["Rotate", "Tap", "Hold"], "Rotate", "How you reel in a catch."),
          cycle("nitrous", "Nitrous", HOLD, "Hold", "Choose whether you hold or press when using the vehicle nitrous."),
          toggle("simple-games", "Simplified Mini Games", true, "Makes mini games easier to complete."),
          cycle("auto-drive", "Auto Drive", ["Restricted", "Full"], "Restricted", "Lets the vehicle drive itself to your waypoint."),
          toggle("helmet", "Auto Equip Helmet", false, "Puts a helmet on when you get on a bike."),
          toggle("accessible-combat", "Accessible Combat", false, "Simplifies the inputs used in combat."),
          toggle("vehicle-damage", "Reduced Vehicle Damage", false, "Reduces damage taken by your vehicle.\n\n*Warning:* This will significantly change the balance and experience of gameplay."),
        ],
      },
    ],
  },
  {
    value: "display",
    label: "Display",
    sections: [
      { title: "Display", rows: [slider("brightness", "Brightness", 5, "Raise it until the dark corners of the city just show.")] },
      {
        title: "Visual Effects",
        rows: [
          slider("motion-blur", "Motion Blur", 5, "How much the picture blurs when the camera moves."),
          slider("flash", "Flash Effects Intensity", 10, "The strength of bright flashes on screen, such as *explosions* and *camera flashes*.", { preview: "flash" }),
          slider("hit-effects", "Hit Effects Intensity", 10, "The strength of the effects when you take damage.", { preview: "hits" }),
        ],
      },
    ],
  },
  {
    value: "ui",
    label: "UI",
    sections: [
      {
        title: "Scaling & Readability",
        rows: [
          cycle("language", "Language", ["English", "Français", "Italiano", "Deutsch", "Español", "Português", "Polski", "Русский", "한국어", "繁體中文", "日本語", "Español (México)"], "English", "The language used across menus, the HUD and subtitles."),
          cycle("text-size", "UI Text Size", ["Small", "Medium", "Large", "Extra Large"], "Small", "The size of text across the UI."),
          cycle("colors", "Color Adjustments", ["Off", "Protanopia", "Deuteranopia", "Tritanopia"], "Off", "The colors across the UI and HUD.", { preview: "legend" }),
          cycle("blip-size", "Map Blip Size", SIZES, "Default", "The size of blips on the map.", { preview: "hud" }),
          cycle("minimap-blip", "Minimap Blip Size", SIZES, "Default", "The size of blips on the minimap.", { preview: "hud" }),
          cycle("marker-size", "In-World Marker Size", SIZES, "Default", "The size of markers drawn in the world."),
        ],
      },
      { title: "Subtitles & Captions", rows: [cycle("subtitles", "Subtitles", ["Off", "On", "Story Only"], "Off", "Shows subtitles for dialogue.")] },
      {
        title: "HUD",
        rows: [
          toggle("interaction-markers", "Interaction Markers", true, "Marks things you can interact with."),
          toggle("altimeter", "Altimeter", true, "Shows your altitude when flying."),
          toggle("heat", "Heat Indicators", true, "Shows how much attention you are drawing."),
          toggle("money", "Money", true, "Shows your cash on the HUD."),
          toggle("vehicle-name", "Vehicle Name & Status", true, "Shows the name and condition of the vehicle you enter."),
        ],
      },
      {
        title: "Reticle",
        rows: [
          toggle("center-dot", "Persistent Center Dot", false, "Keeps a dot in the centre of the screen at all times.", { preview: "street" }),
          toggle("hit-markers", "Reticle Hit Markers", true, "Marks the reticle when a shot lands.", { preview: "street" }),
          cycle("reticle-size", "Reticle Size", SIZES, "Default", "The size of the weapon reticle.", { preview: "street" }),
          cycle("reticle-shape", "Reticle Shape", ["Complex", "Simple", "Dot", "Off"], "Complex", "How the weapon reticle is displayed on screen.\n\n*Complex:* The reticle is unique between different weapon types.", { preview: "street" }),
          slider("equipped-reticle", "Equipped Reticle Visibility", 10, "How visible the reticle is with a weapon out.", { preview: "street" }),
          slider("aiming-reticle", "Aiming Reticle Visibility", 10, "How visible the reticle is while aiming.", { preview: "street" }),
        ],
      },
      {
        title: "Prompts",
        rows: [
          toggle("world-prompts", "In-World Prompts", true, "Shows prompts next to things in the world."),
          slider("prompt-visibility", "Prompt Visibility", 7, "How visible prompts are on screen."),
          cycle("vehicle-prompt", "Vehicle Prompt", ["Off", "Minimal", "Full"], "Off", "Shows entry prompts when you walk up to a vehicle."),
          toggle("mini-game-ui", "Mini Game UI", true, "Displays instructional prompts to complete certain actions, such as *hotwiring*, *lockpicking*, and *cloning keys*.\n\n*Warning:* Turning this off may make parts of the game more difficult to play.", { preview: "prompts" }),
          toggle("bottom-prompts", "Bottom Right Prompts", true, "Shows controller prompts in the bottom-right corner."),
        ],
      },
    ],
  },
  {
    value: "camera",
    label: "Camera",
    sections: [
      {
        title: "Land & Water Vehicles",
        rows: [
          cycle("cam-height", "Height (All Vehicles)", ["Low", "Medium", "High"], "High", "How high the camera sits behind a vehicle."),
          slider("h-follow-driver", "Horizontal Follow Speed (Driver)", 10, "How quickly the camera swings behind you while driving."),
          slider("v-follow-driver", "Vertical Follow Speed (Driver)", 10, "How quickly the camera levels out while driving."),
          slider("delay-driver", "Follow Delay (Driver)", 0, "The follow speed delay before the camera returns behind your character as a driver."),
          slider("h-follow-passenger", "Horizontal Follow Speed (Passenger)", 4, "How quickly the camera swings behind you as a passenger."),
          slider("v-follow-passenger", "Vertical Follow Speed (Passenger)", 4, "How quickly the camera levels out as a passenger."),
          slider("delay-passenger", "Follow Delay (Passenger)", 10, "The follow speed delay before the camera returns behind your character as a passenger in a land or water vehicle."),
        ],
      },
      {
        title: "Comfort",
        rows: [
          slider("cam-shake", "Camera Shake", 10, "How much the camera shakes on impacts and explosions."),
          toggle("auto-center", "Auto Center", true, "Returns the camera behind you after you stop looking around."),
        ],
      },
    ],
  },
  {
    value: "audio",
    label: "Audio",
    sections: [
      { title: "Audio", rows: [cycle("vehicle-radio", "Vehicle Radio", ["Default", "On", "Off"], "Default", "Choose whether the radio is on or off when you enter a vehicle.")] },
      {
        title: "Volume",
        rows: [
          slider("master", "Master Volume", 10, "The overall volume of the game."),
          slider("sfx", "SFX", 10, "The volume of sound effects."),
          slider("ui-volume", "UI", 10, "The volume of menu sounds."),
          slider("dialogue", "Dialogue", 10, "The volume of speech."),
          slider("music", "Music", 10, "The volume of the score and the radio."),
          slider("media", "Media", 10, "The volume of in-world media, such as the *TV* and *radio*."),
        ],
      },
      { title: "Narration", rows: [toggle("narration", "Screen Narration", false, "Reads menus and on-screen text aloud.")] },
    ],
  },
]

type Value = string | number | boolean

function defaults(): Record<string, Value> {
  const values: Record<string, Value> = {}
  for (const category of CATEGORIES)
    for (const section of category.sections) {
      if ("radio" in section) values[section.radio.id] = section.radio.start
      else for (const row of section.rows) values[row.id] = row.start
    }
  return values
}

export { CATEGORIES, defaults }
export type { Category, Choice, Preview, Row, Section, Value }
