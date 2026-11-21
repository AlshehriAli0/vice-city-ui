import { announce } from "@ui-sdk/core"
import { useEffect, useRef, type HTMLAttributes, type ReactElement } from "react"
import { cx } from "../ui/cx"
import "./hud-stage.css"

/* Tells screen readers about HUD text that changes after mount, through ui-sdk's shared polite live region. */
function useAnnouncement(text: string | null | undefined): void {
  const last = useRef(text)
  useEffect(() => {
    if (!text || text === last.current) return
    last.current = text
    announce(text)
  }, [text])
}

type HudStageProps = HTMLAttributes<HTMLElement> & { label?: string }

/* A 1920×1080 HUD frame on a neutral dark stage. It scales with its width, so the 1080p numbers hold at any size. */
function HudStage({ label = "Game HUD", className, ...props }: HudStageProps): ReactElement {
  return (
    <div className="ld-hud-stage" data-slot="hud-stage">
      <section {...props} className={cx("ld-hud-frame", className)} data-slot="hud-frame" aria-label={label} />
    </div>
  )
}

export { HudStage, useAnnouncement }
