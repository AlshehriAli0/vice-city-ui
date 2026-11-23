import { Button as ButtonRoot } from "@ui-sdk/react/button";
import type { ComponentProps } from "react";

import { merge } from "../../shared/class-names";
import { Glyph, type GlyphName } from "../display/kbd";

import "../shared/kit-theme.css";
import "./button.css";

type ButtonProps = ComponentProps<typeof ButtonRoot> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "sm" | "md" | "lg";
};

const Button = ({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) => (
  <ButtonRoot {...props} className={merge("vc-btn", className)} data-variant={variant} data-size={size}>
    {typeof children === "function" ? (
      state => <span className="vc-btn__label">{children(state)}</span>
    ) : (
      <span className="vc-btn__label">{children}</span>
    )}
  </ButtonRoot>
);

type IconButtonProps = Omit<ButtonProps, "aria-label" | "variant"> & { "aria-label": string; active?: boolean };

const IconButton = ({ className, active, ...props }: IconButtonProps) => (
  <Button
    {...props}
    variant="secondary"
    data-active={active ? true : undefined}
    className={merge("vc-btn--icon", className)}
  />
);

type PromptButtonProps = Omit<ComponentProps<typeof ButtonRoot>, "children"> & {
  glyph?: GlyphName;
  children?: ComponentProps<"span">["children"];
};

const PromptButton = ({ glyph = "circle", className, children, ...props }: PromptButtonProps) => (
  <ButtonRoot {...props} className={merge("vc-prompt-btn", className)}>
    {children}
    <span aria-hidden="true">
      <Glyph name={glyph} />
    </span>
  </ButtonRoot>
);

export { Button, IconButton, PromptButton };
export type { ButtonProps, IconButtonProps, PromptButtonProps };
