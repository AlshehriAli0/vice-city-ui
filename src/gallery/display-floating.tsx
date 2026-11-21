import type { ReactElement } from "react";

import { toast } from "../leonida/mission-toast.store";
import { Button } from "../ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { Glyph, Prompts } from "../ui/kbd";
import { Popover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "../ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { CAST } from "./display-characters";
import { attrs, SIDES, ALIGNS } from "./display-options";
import { Portrait } from "./display-portrait";
import { optionValue, options as opts } from "./options";
import type { Demo, Playground } from "./types";

const KEEP_OPEN = new Set(["outside-press", "focus-out"]);

function FloatingDemo({ values: v, set }: Playground): ReactElement {
  const open = Boolean(v.open);
  const onOpenChange = (next: boolean, details?: { reason: string }) => {
    if (!next && details && KEEP_OPEN.has(details.reason)) return;
    set("open", next);
  };
  const place = { side: optionValue(v.side, SIDES), align: optionValue(v.align, ALIGNS) };
  let body: ReactElement;
  if (v.component === "tooltip")
    body = (
      <Tooltip open={open} onOpenChange={onOpenChange}>
        <TooltipTrigger render={<Button variant="secondary" size="sm" />}>Legend</TooltipTrigger>
        <TooltipContent {...place}>Your route is pink. Your own waypoints are cyan.</TooltipContent>
      </Tooltip>
    );
  else if (v.component === "hovercard")
    body = (
      <div className="cd-text cd-map__note">
        Contact{" "}
        <HoverCard open={open} onOpenChange={onOpenChange}>
          <HoverCardTrigger href="#core-floating">Jason Duval</HoverCardTrigger>
          <HoverCardContent {...place}>
            <div className="cd-hover">
              <Portrait member={CAST[0]} shape="square" />
              <div>
                <p className="cd-hover__name">Jason Duval</p>
                <p className="cd-hover__meta">Vice City</p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>{" "}
        is in your phone contacts.
      </div>
    );
  else
    body = (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger render={<Button size="sm" />}>Set destination</PopoverTrigger>
        <PopoverContent {...place}>
          <PopoverTitle>Vice City</PopoverTitle>
          <PopoverDescription>1.86 mi from your position.</PopoverDescription>
          <Prompts>
            <PopoverClose className="vc-prompt-btn" onClick={() => toast("Destination set")}>
              Set destination
              <Glyph name="cross" />
            </PopoverClose>
          </Prompts>
        </PopoverContent>
      </Popover>
    );
  return (
    <div className="cd-map">
      <img className="cd-map__img" src="/vc/map-leonida.jpg" alt="" aria-hidden="true" />
      <div className="cd-map__center">{body}</div>
    </div>
  );
}

const displayFloatingDemos: Demo[] = [
  {
    id: "core-floating",
    file: "ui/popover",
    keys: [
      ["Space / Enter", "Open the popover"],
      ["Tab", "Show a tooltip on focus"],
      ["Escape", "Close"],
    ],
    name: "Popovers",
    sdk: "Popover · Tooltip · HoverCard",
    caption: "The map's hover card for popovers and hover cards; the HUD help box for tooltips.",
    controls: [
      {
        type: "select",
        name: "component",
        label: "Component",
        options: opts(["popover", "Popover"], ["tooltip", "Tooltip"], ["hovercard", "Hover card"]),
      },
      { type: "boolean", name: "open", label: "Open" },
      { type: "select", name: "side", label: "Side", options: SIDES },
      { type: "select", name: "align", label: "Align", options: ALIGNS },
    ],
    defaults: { component: "popover", open: false, side: "top", align: "center" },
    examples: [
      { label: "Popover", values: { open: true } },
      { label: "Tooltip", values: { component: "tooltip", open: true } },
      { label: "Hover card", values: { component: "hovercard", open: true, side: "bottom" } },
    ],
    code: v => {
      const place = attrs(["side", v.side, v.component === "tooltip" ? "top" : "bottom"], ["align", v.align, "center"]);
      if (v.component === "tooltip")
        return `<Tooltip open={${v.open}} onOpenChange={setOpen}>
  <TooltipTrigger render={<Button variant="secondary" size="sm" />}>Legend</TooltipTrigger>
  <TooltipContent${place}>Your route is pink. Your own waypoints are cyan.</TooltipContent>
</Tooltip>`;
      if (v.component === "hovercard")
        return `<HoverCard open={${v.open}} onOpenChange={setOpen}>
  <HoverCardTrigger href="/contacts/jason">Jason Duval</HoverCardTrigger>
  <HoverCardContent${place}>
    <Avatar aria-label="Jason Duval" shape="square">…</Avatar>
    Jason Duval
  </HoverCardContent>
</HoverCard>`;
      return `<Popover open={${v.open}} onOpenChange={setOpen}>
  <PopoverTrigger render={<Button size="sm" />}>Set destination</PopoverTrigger>
  <PopoverContent${place}>
    <PopoverTitle>Vice City</PopoverTitle>
    <PopoverDescription>1.86 mi from your position.</PopoverDescription>
    <PopoverClose>Set destination</PopoverClose>
  </PopoverContent>
</Popover>`;
    },
    render: playground => <FloatingDemo {...playground} />,
  },
];

export { displayFloatingDemos };
