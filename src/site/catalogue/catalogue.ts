import type { Demo, Section } from "../../gallery/demo";
import { demoSections } from "../../gallery/demo-sections";

type Chapter = Pick<Section, "id" | "title">;

type Entry = Demo & {
  label: string;
  pitch: string;
  section: Chapter;
};

let number = 0;
const sections: (Chapter & { entries: Entry[] })[] = [];

for (const { id, title, demos } of demoSections) {
  const section = { id, title };
  const entries: Entry[] = [];

  for (const demo of demos) {
    number += 1;
    entries.push({ ...demo, label: String(number).padStart(2, "0"), pitch: demo.blurb ?? demo.caption, section });
  }

  sections.push({ id, title, entries });
}

const ENTRIES = sections.flatMap(section => section.entries);
const BY_ID = new Map(ENTRIES.map(entry => [entry.id, entry]));

export { BY_ID, ENTRIES, sections };
export type { Entry };
