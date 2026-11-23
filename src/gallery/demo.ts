import type { ReactNode } from "react";

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

type Crop = { x: number; y: number; w: number; h: number; world?: number };

const FULL_FRAME_CROP: Crop = { x: 0, y: 0, w: 1920, h: 1080 };

type DemoSource = Readonly<Record<string, () => Promise<{ default: string }>>>;

type Demo = {
  id: string;
  name: string;
  sdk: string;
  caption: string;
  blurb?: string;
  wide?: boolean;
  source?: DemoSource;
  captureCrop?: Crop;
  capturePreview?: { width: number; render: () => ReactNode };
  detailCrop?: Crop;
  detailFrame?: "game" | "phone";
  keys?: [string, string][];
  states?: { label: string; render: () => ReactNode }[];
  controls?: Control[];
  defaults?: Values;
  update?: (values: Values, name: string, value: Value) => Values;
  actions?: { name: string; label: string }[];
  examples?: { label: string; values: Values }[];
  code?: (values: Values) => string;
  render: (playground: Playground) => ReactNode;
};

type Section = {
  id: string;
  title: string;
  demos: Demo[];
};

export { FULL_FRAME_CROP };
export type { Control, Crop, Demo, DemoSource, Playground, Section, Value, Values };
