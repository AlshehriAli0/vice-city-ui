import { cx } from "../../shared/class-names";
import { ButtonPrompt, ButtonPromptLabel, ButtonPrompts, PadGlyph } from "../shared/button-prompt";
import { DpadGlyph } from "../shared/dpad-glyph";
import type { Prompt } from "./phone-data";
import { StickGlyph } from "./phone-icons";

const Key = ({ prompt }: { prompt: Prompt }) => {
  if (prompt.key === "dpad-v") return <DpadGlyph axis="vertical" />;
  if (prompt.key === "dpad-h") return <DpadGlyph axis="horizontal" />;
  if (prompt.key === "L3" || prompt.key === "R3" || prompt.key === "R") return <StickGlyph label={prompt.key} />;
  return <PadGlyph glyph={prompt.key} />;
};

const PhonePrompts = ({ rows, label, className }: { rows: Prompt[]; label: string; className?: string }) => (
  <ButtonPrompts label={label} stack className={cx("ld-phone-prompts", className)}>
    {rows.map(prompt =>
      prompt.run ? (
        <ButtonPrompt
          key={prompt.label}
          className="ld-phone-prompt"
          muted={prompt.muted}
          aria-disabled={prompt.muted ? true : undefined}
          onPointerDown={event => event.preventDefault()}
          onClick={() => !prompt.muted && prompt.run?.()}
        >
          <ButtonPromptLabel>{prompt.label}</ButtonPromptLabel>
          <Key prompt={prompt} />
        </ButtonPrompt>
      ) : (
        <span
          key={prompt.label}
          className="ld-prompt ld-phone-prompt"
          data-muted={prompt.muted ? true : undefined}
          aria-hidden="true"
        >
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
      )
    )}
  </ButtonPrompts>
);

export { PhonePrompts };
