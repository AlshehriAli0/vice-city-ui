import { SCHEME, CONTROLLER, CAMERA } from "./control-settings";
import { GAMEPLAY } from "./gameplay-settings";
import { UI } from "./interface-settings";
import { DISPLAY, AUDIO } from "./presentation-settings";
import type { Category, Value } from "./setting-types";

const CATEGORIES: Category[] = [SCHEME, CONTROLLER, GAMEPLAY, DISPLAY, UI, CAMERA, AUDIO];

const defaults = (): Record<string, Value> =>
  Object.fromEntries(
    CATEGORIES.flatMap(category =>
      category.sections.flatMap(section => {
        if ("radio" in section) return [[section.radio.id, section.radio.start] as const];
        return section.rows.map(row => [row.id, row.start] as const);
      })
    )
  );

export { CATEGORIES, defaults };
export type { Category, Choice, Preview, Row, Section, Value } from "./setting-types";
