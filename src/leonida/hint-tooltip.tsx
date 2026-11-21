import { announce } from "@ui-sdk/core"
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip"
import { useCallback, useEffect, useRef, type ComponentProps, type ReactElement, type ReactNode } from "react"
import { cx, merge } from "../ui/cx"
import { ButtonGlyph, ButtonPromptLabel, PadGlyph, ShoulderKey, type Glyph, type Shoulder } from "./button-prompt"
import { EvidenceDisc, StarGlyph, type Evidence } from "./wanted-level"
import "./button-prompt.css"
import "./hint-tooltip.css"

/* Inline icons for help text: they scale with the 24px line, and their words stay in the text for screen readers. */
function HelpStar(): ReactElement {
  return (
    <span className="ld-help__icon" data-slot="help-icon">
      <StarGlyph className="ld-help__star" />
      <span className="ld-sr">wanted star</span>
    </span>
  )
}

function HelpEvidence({ items }: { items: Evidence[] }): ReactElement {
  return (
    <span className="ld-help__icon" data-slot="help-icon">
      {items.map((item) => (
        <EvidenceDisc key={item} item={item} className="ld-help__disc" />
      ))}
      <span className="ld-sr">{`${items.length} pieces of evidence`}</span>
    </span>
  )
}

function HelpButton({ glyph }: { glyph: Glyph | Shoulder }): ReactElement {
  const shoulder = glyph === "L1" || glyph === "R1" || glyph === "L2" || glyph === "R2"
  return (
    <span className="ld-help__icon" data-slot="help-icon">
      {shoulder ? <ShoulderKey label>{glyph}</ShoulderKey> : <ButtonGlyph shape={glyph} label />}
    </span>
  )
}

/* The top-left help box: 80% near-black, 24px text on 31px lines, hugging its text up to 420px. New text is announced politely. */
function HelpBox({ ref, className, ...props }: ComponentProps<"p">): ReactElement {
  const own = useRef<HTMLParagraphElement | null>(null)
  const last = useRef<string | null>(null)
  useEffect(() => {
    const text = own.current?.textContent ?? ""
    if (last.current !== null && text && text !== last.current) announce(text)
    last.current = text
  })
  const attach = useCallback(
    (el: HTMLParagraphElement | null) => {
      own.current = el
      if (typeof ref === "function") return ref(el)
      if (ref) ref.current = el
    },
    [ref],
  )
  return <p {...props} ref={attach} className={cx("ld-help", className)} data-slot="help-box" />
}

/* A ui-sdk Tooltip that describes a prompt with help text. */
function HintTooltip({ type = "description", delay = 150, ...props }: ComponentProps<typeof Tooltip>): ReactElement {
  return <Tooltip {...props} type={type} delay={delay} />
}

type HintTooltipTriggerProps = Omit<ComponentProps<typeof TooltipTrigger>, "children"> & { glyph?: Glyph | Shoulder; children?: ReactNode }

/* The bottom-right prompt that shows the help while hovered or focused. */
function HintTooltipTrigger({ glyph, children, className, ...props }: HintTooltipTriggerProps): ReactElement {
  return (
    <TooltipTrigger {...props} className={merge("ld-prompt", className)}>
      {glyph ? (
        <>
          <ButtonPromptLabel>{children}</ButtonPromptLabel>
          <PadGlyph glyph={glyph} />
        </>
      ) : (
        children
      )}
    </TooltipTrigger>
  )
}

/* The help box as tooltip content. Point `anchor` at the box's spot (x32, y288 in the HUD). */
function HintTooltipContent({ side = "bottom", align = "start", sideOffset = 0, className, ...props }: ComponentProps<typeof TooltipContent>): ReactElement {
  return <TooltipContent {...props} side={side} align={align} sideOffset={sideOffset} className={merge("ld-help", className)} />
}

export { HelpBox, HelpButton, HelpEvidence, HelpStar, HintTooltip, HintTooltipContent, HintTooltipTrigger }
