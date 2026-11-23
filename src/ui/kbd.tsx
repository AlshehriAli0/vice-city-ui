import { renderElement, type PartProps } from "@ui-sdk/react/primitive";

import { merge } from "./cx";
import { plain } from "./plain";

import "./base.css";
import "./kbd.css";

const Kbd = plain("kbd", "kbd", "vc-kbd");

const Bumper = plain("kbd", "bumper", "vc-bumper");

type GlyphName = "cross" | "circle" | "square" | "triangle";

const GLYPH_TEXT: Record<GlyphName, string> = {
  cross: "Cross",
  circle: "Circle",
  square: "Square",
  triangle: "Triangle",
};

type GlyphProps = Omit<PartProps<"span">, "children"> & { name: GlyphName };

const Glyph = ({ name, render, className, ...props }: GlyphProps) => {
  const glyph = (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      {name === "cross" && <path d="M6.3 6.3l7.4 7.4M13.7 6.3l-7.4 7.4" />}
      {name === "circle" && <circle cx="10" cy="10" r="4.6" />}
      {name === "square" && <rect x="5.6" y="5.6" width="8.8" height="8.8" />}
      {name === "triangle" && <path d="M10 5l5 8.6H5z" />}
    </svg>
  );
  return renderElement(
    "span",
    {
      role: "img",
      "aria-label": GLYPH_TEXT[name],
      ...props,
      className: merge("vc-glyph", className),
      "data-slot": "glyph",
      "data-glyph": name,
      children: glyph,
    },
    render
  );
};

type PromptProps = Omit<PartProps<"span">, "children"> & {
  label: string;
  glyph?: GlyphName;
  keys?: string;
  disabled?: boolean;
};

const Prompt = ({ label, glyph, keys, disabled, render, className, ...props }: PromptProps) => {
  const children = (
    <>
      {label}
      {glyph && <Glyph name={glyph} />}
      {keys && <Kbd>{keys}</Kbd>}
    </>
  );
  return renderElement(
    "span",
    {
      ...props,
      className: merge("vc-prompt", className),
      "data-slot": "prompt",
      "data-disabled": disabled ? true : undefined,
      children,
    },
    render
  );
};

type PromptsProps = PartProps<"div"> & { stack?: boolean };

const Prompts = ({ stack, render, className, ...props }: PromptsProps) => {
  "use memo";

  return renderElement(
    "div",
    {
      ...props,
      className: merge("vc-prompts", className),
      "data-slot": "prompts",
      "data-stack": stack ? true : undefined,
    },
    render
  );
};

export { Bumper, Glyph, Kbd, Prompt, Prompts };
export type { GlyphName };
