import type { ReactElement } from "react"
import { sections } from "../gallery"
import type { Demo, Section } from "../gallery/types"
import { BLURBS } from "./blurbs"
import { CROPS, detailCrop, type Crop } from "./crops"
import { PREVIEWS } from "./previews"

type Entry = Demo & {
  number: number
  label: string
  // The short product line shown on cards and as the detail page's pitch.
  pitch: string
  // The component's box inside its 1080p frame, for game demos.
  crop?: Crop
  // A calmer stand-in for the card preview, when the live demo opens mid-action.
  preview?: () => ReactElement
  // The crop the detail stage uses; screens that fill the frame have none.
  stageCrop?: Crop
  section: Section
  // Dark CSS game stage, for game UI with white text.
  scene: boolean
}

let count = 0
const ENTRIES: Entry[] = sections.flatMap((section) =>
  section.demos.map((demo) => {
    count += 1
    const scene = demo.frame === "scene" || (Boolean(section.scene) && demo.frame !== false)
    const pitch = demo.blurb ?? BLURBS[demo.id] ?? demo.caption
    return { ...demo, number: count, label: String(count).padStart(2, "0"), pitch, crop: PREVIEWS[demo.id] ? undefined : CROPS[demo.id], preview: PREVIEWS[demo.id], stageCrop: detailCrop(demo.id), section, scene }
  }),
)

const BY_ID = new Map(ENTRIES.map((entry) => [entry.id, entry]))

function entriesOf(section: Section): Entry[] {
  return ENTRIES.filter((entry) => entry.section === section)
}

export { BY_ID, ENTRIES, entriesOf, sections }
export type { Entry }
