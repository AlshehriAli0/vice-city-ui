import {
  Dialog,
  DialogBackdrop,
  DialogClose as DialogCloseRoot,
  DialogContent as DialogContentRoot,
  DialogDescription as DialogDescriptionRoot,
  DialogTitle as DialogTitleRoot,
  DialogTrigger as DialogTriggerRoot,
} from "@ui-sdk/react/dialog"
import type { ComponentProps, ReactElement, ReactNode } from "react"
import { Glyph, type GlyphName } from "./kbd"
import { merge, styled } from "./cx"
import { plain } from "./plain"
import "./base.css"
import "./dialog.css"

const DialogTrigger = styled(DialogTriggerRoot, "vc-dialog-trigger")
const DialogTitle = styled(DialogTitleRoot, "vc-dialog__title")
const DialogDescription = styled(DialogDescriptionRoot, "vc-dialog__description")
const DialogClose = styled(DialogCloseRoot, "vc-dialog__close")
const DialogFooter = plain("div", "dialog-footer", "vc-dialog__footer")

type DialogContentProps = Omit<ComponentProps<typeof DialogContentRoot>, "children"> & {
  size?: "sm" | "md" | "lg"
  children?: ReactNode
}

// A slate panel with a caps title and a prompt row, like the game's confirm screens. Escape is BACK.
function DialogContent({ size = "md", className, children, ...props }: DialogContentProps): ReactElement {
  return (
    <>
      <DialogBackdrop className="vc-dialog__backdrop" />
      <DialogContentRoot {...props} className={merge("vc-dialog vc-surface", className)} data-size={size}>
        <div className="vc-dialog__body">{children}</div>
      </DialogContentRoot>
    </>
  )
}

type DialogPromptProps = Omit<ComponentProps<typeof DialogCloseRoot>, "children"> & { label: string; glyph?: GlyphName }

/* A footer prompt that closes the dialog, like "SAVE ⓧ" or "BACK ○". */
function DialogPrompt({ label, glyph = "cross", className, ...props }: DialogPromptProps): ReactElement {
  return (
    <DialogCloseRoot {...props} className={merge("vc-prompt-btn", className)}>
      {label}
      <span aria-hidden="true">
        <Glyph name={glyph} />
      </span>
    </DialogCloseRoot>
  )
}

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogPrompt, DialogTitle, DialogTrigger }
