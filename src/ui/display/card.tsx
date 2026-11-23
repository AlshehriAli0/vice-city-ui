import { renderElement, type PartProps } from "@ui-sdk/react/primitive";
import type { CSSProperties } from "react";

import { merge } from "../../shared/class-names";
import type { CssVariables } from "../../shared/css-variables";
import { plain } from "../shared/plain-part";

import "../shared/base.css";
import "./card.css";

type CardProps = PartProps<"article"> & {
  variant?: "glass" | "solid" | "sticker" | "sunset";
  interactive?: boolean;
};

const Card = ({ variant = "glass", interactive, render, className, ...props }: CardProps) => {
  "use memo";

  return renderElement(
    "article",
    {
      ...props,
      className: merge("vc-card", className),
      "data-slot": "card",
      "data-variant": variant,
      "data-interactive": interactive ? true : undefined,
    },
    render
  );
};

type CardMediaProps = Omit<PartProps<"div">, "style"> & { ratio?: string; focus?: string; style?: CSSProperties };

const CardMedia = ({ ratio, focus, render, className, style, ...props }: CardMediaProps) => {
  "use memo";

  const vars = { "--card-media-ratio": ratio, "--card-media-focus": focus } satisfies CssVariables;
  return renderElement(
    "div",
    {
      ...props,
      className: merge("vc-card__media", className),
      style: { ...vars, ...style },
      "data-slot": "card-media",
    },
    render
  );
};

const CardHeader = plain("header", "card-header", "vc-card__header");
const CardEyebrow = plain("p", "card-eyebrow", "vc-card__eyebrow");
const CardTitle = plain("h3", "card-title", "vc-card__title");
const CardDescription = plain("p", "card-description", "vc-card__description");
const CardBody = plain("div", "card-body", "vc-card__body");
const CardFooter = plain("footer", "card-footer", "vc-card__footer");

export { Card, CardBody, CardDescription, CardEyebrow, CardFooter, CardHeader, CardMedia, CardTitle };
export type { CardProps };
