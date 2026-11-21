import { Separator as SeparatorRoot } from "@ui-sdk/react/separator"
import type { ComponentProps, ReactElement } from "react"
import { merge } from "./cx"
import "./base.css"
import "./separator.css"

type SeparatorProps = ComponentProps<typeof SeparatorRoot> & { variant?: "line" | "sunset" | "dashed" }

function Separator({ variant = "line", className, ...props }: SeparatorProps): ReactElement {
  return <SeparatorRoot {...props} className={merge("vc-sep", className)} data-variant={variant} />
}

export { Separator }
export type { SeparatorProps }
