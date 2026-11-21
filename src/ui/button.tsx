import { Button as ButtonRoot } from "@ui-sdk/react/button"
import type { ComponentProps, ReactElement } from "react"
import { merge } from "./cx"
import { Glyph, type GlyphName } from "./kbd"
import "./ui.css"
import "./button.css"

type ButtonProps = ComponentProps<typeof ButtonRoot> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link"
  size?: "sm" | "md" | "lg"
}

// The label sits in its own span so the pending spinner can hide it without moving the box.
function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps): ReactElement {
  return (
    <ButtonRoot {...props} className={merge("vc-btn", className)} data-variant={variant} data-size={size}>
      {typeof children === "function" ? (state) => <span className="vc-btn__label">{children(state)}</span> : <span className="vc-btn__label">{children}</span>}
    </ButtonRoot>
  )
}

type IconButtonProps = Omit<ButtonProps, "aria-label" | "variant"> & { "aria-label": string; active?: boolean }

// One icon button style everywhere: a slate square with a hairline; the active one lights its icon white.
function IconButton({ className, active, ...props }: IconButtonProps): ReactElement {
  return <Button {...props} variant="secondary" data-active={active || undefined} className={merge("vc-btn--icon", className)} />
}

type PromptButtonProps = Omit<ComponentProps<typeof ButtonRoot>, "children"> & { glyph?: GlyphName; children?: ComponentProps<"span">["children"] }

// A footer prompt that acts, like "SKIP ○".
function PromptButton({ glyph = "circle", className, children, ...props }: PromptButtonProps): ReactElement {
  return (
    <ButtonRoot {...props} className={merge("vc-prompt-btn", className)}>
      {children}
      <span aria-hidden="true">
        <Glyph name={glyph} />
      </span>
    </ButtonRoot>
  )
}

export { Button, IconButton, PromptButton }
export type { ButtonProps, IconButtonProps, PromptButtonProps }
