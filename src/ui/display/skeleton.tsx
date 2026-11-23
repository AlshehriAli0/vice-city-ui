import { renderElement, type PartProps } from "@ui-sdk/react/primitive";
import type { CSSProperties } from "react";

import { merge } from "../../shared/class-names";
import type { CssVariables } from "../../shared/css-variables";

import "../shared/base.css";
import "./skeleton.css";

type SkeletonProps = Omit<PartProps<"span">, "style"> & {
  shape?: "line" | "block" | "circle";
  width?: string;
  height?: string;
  style?: CSSProperties;
};

const Skeleton = ({ shape = "line", width, height, render, className, style, ...props }: SkeletonProps) => {
  "use memo";

  const size = { "--skeleton-width": width, "--skeleton-height": height } satisfies CssVariables;
  return renderElement(
    "span",
    {
      "aria-hidden": true,
      ...props,
      className: merge("vc-skeleton", className),
      style: { ...size, ...style },
      "data-slot": "skeleton",
      "data-shape": shape,
    },
    render
  );
};

export { Skeleton };
export type { SkeletonProps };
