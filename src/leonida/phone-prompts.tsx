import type { ReactElement } from "react"
import { cx } from "../ui/cx"
import { ButtonPrompt, ButtonPromptLabel, ButtonPrompts, PadGlyph } from "./button-prompt"
import type { Prompt } from "./phone-data"
import { DpadGlyph, StickGlyph } from "./phone-icons"

function Key({ prompt }: { prompt: Prompt }): ReactElement {
  if (prompt.key === "dpad-v") return <DpadGlyph axis="vertical" />
  if (prompt.key === "dpad-h") return <DpadGlyph axis="horizontal" />
  if (prompt.key === "L3" || prompt.key === "R3" || prompt.key === "R") return <StickGlyph label={prompt.key} />
  return <PadGlyph glyph={prompt.key} />
}

/* The bottom-right HUD column: condensed caps with the controller glyph, rows 52px apart, growing upward.
   Rows without an action (SCROLL, TAB, a greyed PARTNER POSE) are shown but aren't buttons. */
function PhonePrompts({ rows, label, className }: { rows: Prompt[]; label: string; className?: string }): ReactElement {
  return (
    <ButtonPrompts label={label} stack className={cx("ld-phone-prompts", className)}>
      {rows.map((prompt) =>
        prompt.run ? (
          <ButtonPrompt
            key={prompt.label}
            className="ld-phone-prompt"
            muted={prompt.muted}
            aria-disabled={prompt.muted || undefined}
            // Keep D-pad focus on the item in the phone while the pointer presses a prompt.
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => !prompt.muted && prompt.run?.()}
          >
            <ButtonPromptLabel>{prompt.label}</ButtonPromptLabel>
            <Key prompt={prompt} />
          </ButtonPrompt>
        ) : (
          <span key={prompt.label} className="ld-prompt ld-phone-prompt" data-muted={prompt.muted || undefined} aria-hidden="true">
            <ButtonPromptLabel>{prompt.label}</ButtonPromptLabel>
            {prompt.key === "L1" && prompt.label === "Tab" ? (
              <>
                <PadGlyph glyph="L1" />
                <PadGlyph glyph="R1" />
              </>
            ) : (
              <Key prompt={prompt} />
            )}
          </span>
        ),
      )}
    </ButtonPrompts>
  )
}

export { PhonePrompts }
