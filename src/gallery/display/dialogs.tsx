import { Save, SlidersVertical } from "lucide-react";

import { toast } from "../../leonida/notifications/notification-store";
import { Switch } from "../../ui/forms/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogPrompt,
  DialogTitle,
  DialogTrigger,
} from "../../ui/overlays/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetPrompt,
  SheetTitle,
  SheetTrigger,
} from "../../ui/overlays/sheet";
import type { Demo, Playground } from "../demo";
import { optionValue, options as opts } from "../shared/options";
import { attrs } from "./options";

const SHEET_SIDES = opts(["left", "Left"], ["right", "Right"], ["bottom", "Bottom"]);

const DIALOG_SIZES = opts(["sm", "S"], ["md", "M"], ["lg", "L"]);

const DialogDemo = ({ values: v, set }: Playground) => {
  const open = Boolean(v.open);
  const onOpenChange = (next: boolean) => set("open", next);
  if (v.component === "sheet")
    return (
      <div className="cd-center">
        <div className="cd-pause__rows">
          <Sheet side={optionValue(v.side, SHEET_SIDES)} open={open} onOpenChange={onOpenChange}>
            <SheetTrigger className="cd-pause__row">
              <SlidersVertical aria-hidden="true" />
              Settings
            </SheetTrigger>
            <SheetContent>
              <SheetTitle>Settings</SheetTitle>
              <SheetDescription>Quick settings for this session.</SheetDescription>
              <div className="vc-list">
                <Switch defaultChecked showState>
                  Subtitles
                </Switch>
                <Switch showState>Street Names</Switch>
                <Switch defaultChecked showState>
                  Bottom Right Prompts
                </Switch>
              </div>
              <SheetFooter>
                <SheetPrompt label="Back" glyph="circle" />
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  return (
    <div className="cd-center">
      <div className="cd-pause__rows">
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogTrigger className="cd-pause__row">
            <Save aria-hidden="true" />
            Game
          </DialogTrigger>
          <DialogContent size={optionValue(v.size, DIALOG_SIZES)}>
            <DialogTitle>Save game</DialogTitle>
            <DialogDescription>Your progress will be saved to this slot.</DialogDescription>
            <DialogFooter>
              <DialogPrompt label="Save" glyph="cross" onClick={() => toast.success("Game saved")} />
              <DialogPrompt label="Back" glyph="circle" />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

const displayDialogsDemos: Demo[] = [
  {
    id: "core-dialogs",
    source: {
      "dialog.tsx": () => import("../../ui/overlays/dialog.tsx?raw"),
      "dialog.css": () => import("../../ui/overlays/dialog.css?raw"),
    },
    blurb: "A confirm dialog, and a panel that slides in from the side.",
    keys: [
      ["Space / Enter", "Open the dialog or sheet"],
      ["Tab", "Cycle inside it"],
      ["Escape", "Close and return focus"],
    ],
    name: "Dialog & Sheet",
    sdk: "Dialog · Drawer",
    caption: "A pause row opens a settings-style dialog with prompts, or slides in the 544px side panel.",
    wide: true,
    controls: [
      {
        type: "select",
        name: "component",
        label: "Component",
        options: opts(["dialog", "Dialog"], ["sheet", "Sheet"]),
      },
      { type: "boolean", name: "open", label: "Open" },
      { type: "select", name: "size", label: "Dialog size", options: DIALOG_SIZES },
      { type: "select", name: "side", label: "Sheet side", options: SHEET_SIDES },
    ],
    defaults: { component: "dialog", open: false, size: "md", side: "left" },
    examples: [
      { label: "Dialog", values: { open: true } },
      { label: "Side sheet", values: { component: "sheet", open: true } },
      { label: "Bottom sheet", values: { component: "sheet", side: "bottom", open: true } },
    ],
    code: v =>
      v.component === "sheet"
        ? `<Sheet side="${v.side}" open={${v.open}} onOpenChange={setOpen}>
  <SheetTrigger>Settings</SheetTrigger>
  <SheetContent>
    <SheetTitle>Settings</SheetTitle>
    <SheetDescription>Quick settings for this session.</SheetDescription>
    <Switch showState>Subtitles</Switch>
    <SheetFooter>
      <SheetPrompt label="Back" glyph="circle" />
    </SheetFooter>
  </SheetContent>
</Sheet>`
        : `<Dialog open={${v.open}} onOpenChange={setOpen}>
  <DialogTrigger>Game</DialogTrigger>
  <DialogContent${attrs(["size", v.size, "md"])}>
    <DialogTitle>Save game</DialogTitle>
    <DialogDescription>Your progress will be saved to this slot.</DialogDescription>
    <DialogFooter>
      <DialogPrompt label="Save" glyph="cross" onClick={save} />
      <DialogPrompt label="Back" glyph="circle" />
    </DialogFooter>
  </DialogContent>
</Dialog>`,
    render: playground => <DialogDemo {...playground} />,
  },
];

export { displayDialogsDemos };
