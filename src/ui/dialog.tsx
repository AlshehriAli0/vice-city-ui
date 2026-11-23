import {
  Dialog,
  DialogBackdrop,
  DialogClose as DialogCloseRoot,
  DialogContent as DialogContentRoot,
  DialogDescription as DialogDescriptionRoot,
  DialogTitle as DialogTitleRoot,
  DialogTrigger as DialogTriggerRoot,
} from "@ui-sdk/react/dialog";
import type { ComponentProps, ReactNode } from "react";

import { merge, styled } from "./cx";
import { Glyph, type GlyphName } from "./kbd";
import { plain } from "./plain";

import "./base.css";
import "./dialog.css";

const DialogTrigger = styled(DialogTriggerRoot, "vc-dialog-trigger");
const DialogTitle = styled(DialogTitleRoot, "vc-dialog__title");
const DialogDescription = styled(DialogDescriptionRoot, "vc-dialog__description");
const DialogClose = styled(DialogCloseRoot, "vc-dialog__close");
const DialogFooter = plain("div", "dialog-footer", "vc-dialog__footer");

type DialogContentProps = Omit<ComponentProps<typeof DialogContentRoot>, "children"> & {
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
};

const DialogContent = ({ size = "md", className, children, ...props }: DialogContentProps) => (
  <>
    <DialogBackdrop className="vc-dialog__backdrop" />
    <DialogContentRoot {...props} className={merge("vc-dialog vc-surface", className)} data-size={size}>
      <div className="vc-dialog__body">{children}</div>
    </DialogContentRoot>
  </>
);

type DialogPromptProps = Omit<ComponentProps<typeof DialogCloseRoot>, "children"> & {
  label: string;
  glyph?: GlyphName;
};

const DialogPrompt = ({ label, glyph = "cross", className, ...props }: DialogPromptProps) => (
  <DialogCloseRoot {...props} className={merge("vc-prompt-btn", className)}>
    {label}
    <span aria-hidden="true">
      <Glyph name={glyph} />
    </span>
  </DialogCloseRoot>
);

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogPrompt,
  DialogTitle,
  DialogTrigger,
};
