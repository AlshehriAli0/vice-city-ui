import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@ui-sdk/react/alert-dialog";
import { useShortcut } from "@ui-sdk/react/shortcuts";
import { useRef } from "react";

import { ButtonPromptLabel, PadGlyph } from "../../shared/button-prompt";

import "./game-confirm.css";

type GameConfirmProps = {
  open: boolean;
  variant?: "screen" | "sheet";
  title: string;
  body: string;
  consequence: string;
  onAnswer: (yes: boolean) => void;
};

const GameConfirm = ({ open, variant = "screen", title, body, consequence, onAnswer }: GameConfirmProps) => {
  const content = useRef<HTMLDivElement>(null);
  const yes = useRef<HTMLButtonElement>(null);
  const no = useRef<HTMLButtonElement>(null);
  useShortcut("backspace", () => no.current?.click(), { layer: content, description: "No (Circle)" });

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next, details) => {
        if (!next) onAnswer(details.returnValue === "confirm");
      }}
    >
      {variant === "sheet" && <AlertDialogBackdrop className="ld-confirm__scrim" />}
      <AlertDialogContent
        ref={content}
        inline
        initialFocus={() => yes.current}
        className="ld-confirm"
        data-variant={variant}
      >
        {variant === "screen" && <div className="ld-confirm__palm" aria-hidden="true" />}
        <div className="ld-confirm__block">
          <AlertDialogTitle className="ld-confirm__title">{title}</AlertDialogTitle>
          <AlertDialogDescription className="ld-confirm__body">{body}</AlertDialogDescription>
        </div>
        <div className="ld-prompts ld-confirm__prompts">
          <AlertDialogClose ref={yes} className="ld-prompt" value="confirm" data-agent-confirm={consequence}>
            <ButtonPromptLabel>Yes</ButtonPromptLabel>
            <PadGlyph glyph="cross" />
          </AlertDialogClose>
          <AlertDialogClose ref={no} className="ld-prompt">
            <ButtonPromptLabel>No</ButtonPromptLabel>
            <PadGlyph glyph="circle" />
          </AlertDialogClose>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { GameConfirm };
export type { GameConfirmProps };
