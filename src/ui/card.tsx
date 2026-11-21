import { renderElement, type PartProps } from "@ui-sdk/react/primitive"
import type { CSSProperties, ReactElement } from "react"
import { merge } from "./cx"
import { plain } from "./plain"
import "./base.css"
import "./card.css"

type CardProps = PartProps<"article"> & {
  variant?: "glass" | "solid" | "sticker" | "sunset"
  interactive?: boolean
}

function Card({ variant = "glass", interactive, render, className, ...props }: CardProps): ReactElement {
  return renderElement(
    "article",
    { ...props, className: merge("vc-card", className), "data-slot": "card", "data-variant": variant, "data-interactive": interactive || undefined },
    render,
  )
}

type CardMediaProps = Omit<PartProps<"div">, "style"> & { ratio?: string; focus?: string; style?: CSSProperties }

function CardMedia({ ratio, focus, render, className, style, ...props }: CardMediaProps): ReactElement {
  const vars = { "--card-media-ratio": ratio, "--card-media-focus": focus } as CSSProperties
  return renderElement("div", { ...props, className: merge("vc-card__media", className), style: { ...vars, ...style }, "data-slot": "card-media" }, render)
}

const CardHeader = plain("header", "card-header", "vc-card__header")
const CardEyebrow = plain("p", "card-eyebrow", "vc-card__eyebrow")
const CardTitle = plain("h3", "card-title", "vc-card__title")
const CardDescription = plain("p", "card-description", "vc-card__description")
const CardBody = plain("div", "card-body", "vc-card__body")
const CardFooter = plain("footer", "card-footer", "vc-card__footer")

export { Card, CardBody, CardDescription, CardEyebrow, CardFooter, CardHeader, CardMedia, CardTitle }
export type { CardProps }
