import { useEffect, useState, type HTMLAttributes, type ReactElement, type ReactNode } from "react"
import { cx } from "../ui/cx"
import "./menu-backdrop.css"

type MenuPhase = "closed" | "open" | "closing"

/* Close: the UI fades over 130ms, then the blur relaxes over 370ms. */
const CLOSE_MS = 500

/* Open snaps on; close holds "closing" while the blur relaxes, then settles to "closed". */
function useMenuPhase(open: boolean): MenuPhase {
  const [phase, setPhase] = useState<MenuPhase>(open ? "open" : "closed")
  useEffect(() => {
    if (open) {
      setPhase("open")
      return
    }
    setPhase((now) => (now === "closed" ? now : "closing"))
    const timer = setTimeout(() => setPhase("closed"), CLOSE_MS)
    return () => clearTimeout(timer)
  }, [open])
  return phase
}

/* A 1920x1080 canvas, scaled to fit its box by --k. Children use 1080p pixels as-is. */
function GameFrame({ className, children, label, ...props }: HTMLAttributes<HTMLDivElement> & { label?: string }): ReactElement {
  return (
    <div {...props} className={cx("ld-frame", className)} data-slot="game-frame" role={label ? "group" : undefined} aria-label={label}>
      <div className="ld-frame__canvas" data-slot="game-frame-canvas">
        {children}
      </div>
    </div>
  )
}

/* A neutral stage, not a world: the brief's dark vignette with soft pools of light for the menu blur to act on. */
function NeutralScene({ tone = "dusk" }: { tone?: "dusk" | "day" }): ReactElement {
  return <div className="ld-scene" data-slot="neutral-scene" data-tone={tone} aria-hidden="true" />
}

/* The shared menu post-effect: blur, dim, vignette and a red-only channel shift, over the scene. */
function MenuBackdrop({ phase, scene = <NeutralScene /> }: { phase: MenuPhase; scene?: ReactNode }): ReactElement {
  return (
    <div className="ld-backdrop" data-slot="menu-backdrop" data-phase={phase} aria-hidden="true">
      <svg className="ld-backdrop__defs" width="0" height="0" focusable="false">
        <filter id="ld-menu-shift" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
          <feOffset in="red" dx="12" result="shifted" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cyan" />
          <feComposite in="shifted" in2="cyan" operator="arithmetic" k2="1" k3="1" />
        </filter>
      </svg>
      <div className="ld-backdrop__sharp">{scene}</div>
      <div className="ld-backdrop__fx">
        <div className="ld-backdrop__blur">{scene}</div>
      </div>
      <div className="ld-backdrop__shade" />
    </div>
  )
}

/* Stick keycap ("R3"): a small white disc with dark letters. Shoulder keys use PadGlyph from button-prompt. */
function KeyCap({ children }: { children: string }): ReactElement {
  return (
    <span className="ld-keycap" data-slot="keycap" aria-hidden="true">
      {children}
    </span>
  )
}

export { GameFrame, KeyCap, MenuBackdrop, NeutralScene, useMenuPhase }
export type { MenuPhase }
