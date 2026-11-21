type Preview = "controller" | "street" | "prompts" | "flash" | "hits" | "legend" | "hud";

type Base = { id: string; label: string; info: string; preview?: Preview; disabled?: boolean };

type Row =
  | (Base & { kind: "toggle"; start: boolean })
  | (Base & { kind: "cycle"; options: string[]; start: string })
  | (Base & { kind: "slider"; start: number; min?: number; max?: number });

type Choice = { value: string; label: string };

type Section =
  | { title: string; rows: Row[] }
  | {
      title: string;
      radio: { id: string; label: string; options: Choice[]; start: string; info: string; preview?: Preview };
    };

type Category = { value: string; label: string; sections: Section[] };

type Value = string | number | boolean;

export type { Category, Choice, Preview, Row, Section, Value };
