import { renderElement, type PartProps } from "@ui-sdk/react/primitive";

import { merge } from "../../shared/class-names";
import { plain } from "../shared/plain-part";

import "../shared/base.css";
import "./badge.css";

type BadgeProps = PartProps<"span"> & {
  variant?: "solid" | "soft" | "outline" | "neon" | "sunset";
  tone?: "pink" | "teal" | "amber" | "cash" | "red" | "violet" | "neutral";
};

const Badge = ({ variant = "soft", tone = "pink", render, className, ...props }: BadgeProps) => {
  "use memo";

  return renderElement(
    "span",
    {
      ...props,
      className: merge("vc-badge", className),
      "data-slot": "badge",
      "data-variant": variant,
      "data-tone": tone,
    },
    render
  );
};

const BadgeDot = plain("span", "badge-dot", "vc-badge__dot");

export { Badge, BadgeDot };
export type { BadgeProps };
