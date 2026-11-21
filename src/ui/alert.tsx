import { renderElement, type PartProps } from "@ui-sdk/react/primitive"
import type { ReactElement } from "react"
import { merge } from "./cx"
import { plain } from "./plain"
import "./base.css"
import "./alert.css"

type AlertProps = PartProps<"div"> & { tone?: "info" | "success" | "warning" | "danger" }

// The map screen's mission card: a slate panel with a pink rule on top. Tone is kept for callers
// and styling hooks, but every tone draws the same; the game has no semantic colors.
function Alert({ tone = "info", render, className, ...props }: AlertProps): ReactElement {
  return renderElement("div", { ...props, className: merge("vc-alert", className), "data-slot": "alert", "data-tone": tone }, render)
}

const AlertTitle = plain("p", "alert-title", "vc-alert__title")
const AlertDescription = plain("div", "alert-description", "vc-alert__text")
const AlertAction = plain("div", "alert-action", "vc-alert__action")

export { Alert, AlertAction, AlertDescription, AlertTitle }
export type { AlertProps }
