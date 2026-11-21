import type { ReactElement } from "react";

import { sections } from "../gallery";
import type { Demo, Section } from "../gallery/types";
import { BLURBS } from "./blurbs";
import { CROPS, detailCrop, type Crop } from "./crops";
import { PREVIEWS } from "./previews";

type Entry = Demo & {
  number: number;
  label: string;
  pitch: string;
  crop?: Crop;
  preview?: () => ReactElement;
  stageCrop?: Crop;
  section: Section;
  scene: boolean;
};

let count = 0;
const ENTRIES: Entry[] = sections.flatMap(section =>
  section.demos.map(demo => {
    count += 1;
    const scene = demo.frame === "scene" || (Boolean(section.scene) && demo.frame !== false);
    const pitch = demo.blurb ?? BLURBS[demo.id] ?? demo.caption;
    return {
      ...demo,
      number: count,
      label: String(count).padStart(2, "0"),
      pitch,
      crop: PREVIEWS[demo.id] ? undefined : CROPS[demo.id],
      preview: PREVIEWS[demo.id],
      stageCrop: detailCrop(demo.id),
      section,
      scene,
    };
  })
);

const BY_ID = new Map(ENTRIES.map(entry => [entry.id, entry]));

const entriesOf = (section: Section): Entry[] => {
  return ENTRIES.filter(entry => entry.section === section);
};

export { BY_ID, ENTRIES, entriesOf, sections };
export type { Entry };
