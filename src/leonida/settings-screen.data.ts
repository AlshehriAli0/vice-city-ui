import { SCHEME, CONTROLLER, CAMERA } from "./settings-controls.data";
import { GAMEPLAY } from "./settings-gameplay.data";
import { DISPLAY, AUDIO } from "./settings-presentation.data";
import type { Category, Value } from "./settings-screen.types";
import { UI } from "./settings-ui.data";

const CATEGORIES: Category[] = [SCHEME, CONTROLLER, GAMEPLAY, DISPLAY, UI, CAMERA, AUDIO];

const defaults = (): Record<string, Value> => {
  return Object.fromEntries(
    CATEGORIES.flatMap(category =>
      category.sections.flatMap(section => {
        if ("radio" in section) return [[section.radio.id, section.radio.start] as const];
        return section.rows.map(row => [row.id, row.start] as const);
      })
    )
  );
};

export { CATEGORIES, defaults };
export type { Category, Choice, Preview, Row, Section, Value } from "./settings-screen.types";
