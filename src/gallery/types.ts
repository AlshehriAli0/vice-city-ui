import type { ReactElement } from "react"

type Value = string | number | boolean
type Values = Record<string, Value>

// One row in the detail page's Controls panel. Each drives a value the demo reads from `values[name]`.
type Control =
  | { type: "select"; name: string; label: string; options: { value: string; label: string }[] }
  | { type: "boolean"; name: string; label: string }
  | { type: "number"; name: string; label: string; min: number; max: number; step?: number }
  | { type: "text"; name: string; label: string }

// What the playground hands a demo: the current values, a setter so in-demo actions stay in sync with the panel,
// and a count per action button, which ticks each time it's pressed (read it with useAction).
type Playground = { values: Values; set: (name: string, value: Value) => void; fired: Record<string, number> }

type Demo = {
  id: string
  name: string
  sdk: string
  caption: string
  // Short product line for catalogue cards and the detail page pitch. The site falls back to its own copy, then the caption.
  blurb?: string
  wide?: boolean
  // "scene" puts the demo on a dark CSS game stage for white HUD text; false keeps it on the plain page.
  frame?: "scene" | false
  // Component source shown on the detail page, as a stem like "leonida/wanted-level".
  file?: string
  // Keyboard map for the detail page: [keys, what they do].
  keys?: [string, string][]
  // Extra static variants shown under the main demo.
  states?: { label: string; render: () => ReactElement }[]
  // The playground: panel rows, their starting values, one-off actions, one-click presets and a usage snippet.
  controls?: Control[]
  defaults?: Values
  actions?: { name: string; label: string }[]
  examples?: { label: string; values: Values }[]
  code?: (values: Values) => string
  render: (playground: Playground) => ReactElement
}

// The six colour themes of rockstargames.com/VI. Each catalogue chapter wears one.
type SkyTheme = "blackout" | "dustyNeon" | "blueSky" | "hotSun" | "night" | "swamp"

type Section = {
  id: string
  title: string
  kicker: string
  theme: SkyTheme
  // Game sections stage every demo on a dark scene unless the demo opts out.
  scene?: boolean
  demos: Demo[]
}

export type { Control, Demo, Playground, Section, SkyTheme, Value, Values }
