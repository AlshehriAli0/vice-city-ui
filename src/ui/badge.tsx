import { renderElement, type PartProps } from "@ui-sdk/react/primitive"
import type { ReactElement } from "react"
import { merge } from "./cx"
import { plain } from "./plain"
import "./base.css"
import "./badge.css"

type BadgeProps = PartProps<"span"> & {
  variant?: "solid" | "soft" | "outline" | "neon" | "sunset"
  tone?: "pink" | "teal" | "amber" | "cash" | "red" | "violet" | "neutral"
}

function Badge({ variant = "soft", tone = "pink", render, className, ...props }: BadgeProps): ReactElement {
  return renderElement("span", { ...props, className: merge("vc-badge", className), "data-slot": "badge", "data-variant": variant, "data-tone": tone }, render)
}

/* A small diamond, the shape the menus use to mark new items. */
const BadgeDot = plain("span", "badge-dot", "vc-badge__dot")

export { Badge, BadgeDot }
export type { BadgeProps }
