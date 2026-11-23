import { Button } from "@ui-sdk/react/button";
import type { ComponentProps, HTMLAttributes, ReactNode } from "react";

import { cx, merge } from "../../shared/class-names";

import "./button-prompt.css";

type Glyph = "cross" | "circle" | "square" | "triangle" | "touchpad";
type Shoulder = "L1" | "R1" | "L2" | "R2";

const SHAPES: Record<Glyph, string> = {
  cross: "M8.6 10.4l1.8-1.8L16 14.2l5.6-5.6 1.8 1.8-5.6 5.6 5.6 5.6-1.8 1.8-5.6-5.6-5.6 5.6-1.8-1.8 5.6-5.6z",
  circle: "M16 7a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 2.7a6.3 6.3 0 1 0 0 12.6 6.3 6.3 0 0 0 0-12.6z",
  square: "M8.4 8.4h15.2v15.2H8.4zm2.7 2.7v9.8h9.8v-9.8z",
  triangle: "M16 6.8l9.6 16.6H6.4zm0 5.4l-4.9 8.5h9.8z",
  touchpad: "M7.5 10.5h17l-1.8 10.5H9.3z",
};

const NAMES: Record<Glyph, string> = {
  cross: "Cross",
  circle: "Circle",
  square: "Square",
  triangle: "Triangle",
  touchpad: "Touchpad",
};

type GlyphProps = { label?: boolean; className?: string };

const ButtonGlyph = ({ shape, label, className }: GlyphProps & { shape: Glyph }) => (
  <>
    <svg
      className={cx("ld-btnglyph", className)}
      data-slot="button-glyph"
      data-glyph={shape}
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <circle className="ld-btnglyph__disc" cx="16" cy="16" r="15" />
      <path className="ld-btnglyph__shape" d={SHAPES[shape]} fillRule="evenodd" />
    </svg>
    {label && <span className="ld-sr">{NAMES[shape]}</span>}
  </>
);

const ShoulderKey = ({ children, label, className }: GlyphProps & { children: Shoulder }) => (
  <>
    <span
      className={cx("ld-btnglyph ld-btnglyph--shoulder", className)}
      data-slot="button-glyph"
      data-glyph={children}
      aria-hidden="true"
    >
      <span className="ld-btnglyph__key">{children}</span>
    </span>
    {label && <span className="ld-sr">{children}</span>}
  </>
);

const isShoulder = (glyph: Glyph | Shoulder): glyph is Shoulder => !(glyph in SHAPES);

const PadGlyph = ({ glyph, label }: { glyph: Glyph | Shoulder; label?: boolean }) =>
  isShoulder(glyph) ? <ShoulderKey label={label}>{glyph}</ShoulderKey> : <ButtonGlyph shape={glyph} label={label} />;

const ButtonPromptLabel = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span {...props} className={cx("ld-prompt__label", className)} data-slot="button-prompt-label" />
);

type ButtonPromptProps = Omit<ComponentProps<typeof Button>, "children"> & {
  glyph?: Glyph | Shoulder;
  children?: ReactNode;
  muted?: boolean;
};

const ButtonPrompt = ({ glyph, children, muted, className, ...props }: ButtonPromptProps) => (
  <Button {...props} className={merge("ld-prompt", className)} data-muted={muted ? true : undefined}>
    {glyph ? (
      <>
        <ButtonPromptLabel>{children}</ButtonPromptLabel>
        <PadGlyph glyph={glyph} />
      </>
    ) : (
      children
    )}
  </Button>
);

type ButtonPromptsProps = HTMLAttributes<HTMLDivElement> & { label: string; stack?: boolean };

const ButtonPrompts = ({ label, stack, className, ...props }: ButtonPromptsProps) => (
  <div
    {...props}
    className={cx("ld-prompts", className)}
    data-slot="button-prompts"
    role="group"
    aria-label={label}
    data-stack={stack ? true : undefined}
  />
);

export { ButtonGlyph, ButtonPrompt, ButtonPromptLabel, ButtonPrompts, PadGlyph, ShoulderKey };
export type { Glyph, Shoulder };
