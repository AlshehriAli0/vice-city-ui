import { options as opts } from "./options";
import type { Value } from "./types";

const attrs = (...list: [name: string, value: Value | undefined, fallback?: Value][]): string => {
  return list
    .map(([name, value, fallback]) => {
      const omitted = value === undefined || value === false || value === "";
      if (omitted || value === fallback) return "";
      if (value === true) return ` ${name}`;
      return typeof value === "number" ? ` ${name}={${value}}` : ` ${name}="${value}"`;
    })
    .join("");
};

const SIDES = opts(["top", "Top"], ["right", "Right"], ["bottom", "Bottom"], ["left", "Left"]);

const ALIGNS = opts(["start", "Start"], ["center", "Center"], ["end", "End"]);

export { attrs, SIDES, ALIGNS };
