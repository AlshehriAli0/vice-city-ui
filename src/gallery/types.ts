import type { ReactElement } from "react";

type Value = string | number | boolean;
type Values = Record<string, Value>;

type Control =
  | { type: "select"; name: string; label: string; options: { value: string; label: string }[] }
  | { type: "boolean"; name: string; label: string }
  | { type: "number"; name: string; label: string; min: number; max: number; step?: number }
  | { type: "text"; name: string; label: string };

type Playground = {
  values: Values;
  set: (name: string, value: Value) => void;
  subscribeAction: (name: string, run: () => void) => () => void;
};

type Demo = {
  id: string;
  name: string;
  sdk: string;
  caption: string;
  blurb?: string;
  wide?: boolean;
  frame?: "scene" | false;
  file?: string;
  keys?: [string, string][];
  states?: { label: string; render: () => ReactElement }[];
  controls?: Control[];
  defaults?: Values;
  update?: (values: Values, name: string, value: Value) => Values;
  actions?: { name: string; label: string }[];
  examples?: { label: string; values: Values }[];
  code?: (values: Values) => string;
  render: (playground: Playground) => ReactElement;
};

type SkyTheme = "blackout" | "dustyNeon" | "blueSky" | "hotSun" | "night" | "swamp";

type Section = {
  id: string;
  title: string;
  kicker: string;
  theme: SkyTheme;
  scene?: boolean;
  demos: Demo[];
};

export type { Control, Demo, Playground, Section, SkyTheme, Value, Values };
