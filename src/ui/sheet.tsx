import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHandle,
  DrawerTitle,
  DrawerTrigger,
} from "@ui-sdk/react/drawer"
import type { ComponentProps, ReactElement, ReactNode } from "react"
import { Glyph, type GlyphName } from "./kbd"
import { merge, styled } from "./cx"
import { plain } from "./plain"
import "./base.css"
import "./sheet.css"

type SheetProps = ComponentProps<typeof Drawer>

// The pause panel moves with a quick critically damped settle, close to its 170ms ease-out slide.
function Sheet({ physics, driver = "pointer", ...props }: SheetProps): ReactElement {
  return <Drawer {...props} driver={driver} physics={{ response: 0.22, dampingRatio: 1, ...physics }} />
}

const SheetTrigger = styled(DrawerTrigger, "vc-sheet-trigger")
const SheetTitle = styled(DrawerTitle, "vc-sheet__title")
const SheetDescription = styled(DrawerDescription, "vc-sheet__description")
const SheetClose = styled(DrawerClose, "vc-sheet__close")
const SheetFooter = plain("div", "sheet-footer", "vc-sheet__footer")

type SheetContentProps = Omit<ComponentProps<typeof DrawerContent>, "children"> & { children?: ReactNode }

function SheetContent({ className, children, ...props }: SheetContentProps): ReactElement {
  return (
    <>
      <DrawerBackdrop className="vc-sheet__backdrop" />
      <DrawerContent {...props} className={merge("vc-sheet", className)}>
        <DrawerHandle className="vc-sheet__handle" aria-label="Drag to resize" />
        <div className="vc-sheet__body">{children}</div>
      </DrawerContent>
    </>
  )
}

type SheetPromptProps = Omit<ComponentProps<typeof DrawerClose>, "children"> & { label: string; glyph?: GlyphName }

/* A footer prompt that closes the sheet, like "BACK ○". */
function SheetPrompt({ label, glyph = "circle", className, ...props }: SheetPromptProps): ReactElement {
  return (
    <DrawerClose {...props} className={merge("vc-prompt-btn", className)}>
      {label}
      <span aria-hidden="true">
        <Glyph name={glyph} />
      </span>
    </DrawerClose>
  )
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetPrompt, SheetTitle, SheetTrigger }
