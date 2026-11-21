import { Button } from "@ui-sdk/react/button"
import type { ComponentProps, ReactElement, ReactNode } from "react"
import { merge } from "../ui/cx"
import "./sunset-button.css"

type SunsetButtonProps = ComponentProps<typeof Button> & {
  // sunset: white slab, neon: outline, ghost: flat. row: a pause-menu row (480x64 at 1080p). action: a right-aligned row with hairlines.
  variant?: "sunset" | "neon" | "ghost" | "row" | "action" | "danger"
  size?: "sm" | "md" | "lg"
  // Row icon: an outline glyph that fills in while the row has the bar.
  icon?: ReactNode
}

function SunsetButton({ variant = "sunset", size = "md", icon, className, children, ...props }: SunsetButtonProps): ReactElement {
  return (
    <Button {...props} className={merge("ld-btn", className)} data-variant={variant} data-size={size}>
      {(state) => (
        <>
          {icon && (
            <span className="ld-btn__icon" aria-hidden="true">
              {icon}
            </span>
          )}
          {typeof children === "function" ? children(state) : children}
        </>
      )}
    </Button>
  )
}

export { SunsetButton }
export type { SunsetButtonProps }
