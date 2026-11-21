import type { CSSProperties } from "react";

export type CssVariables = CSSProperties & {
  [name: `--${string}`]: string | number | undefined;
};

export const cssVariables = (styles: CssVariables): CSSProperties => styles;
