import { useLayoutEffect, useRef, type ReactNode } from "react";

import { Objective } from "../../leonida/hud/hud-feed";
import { HudStage } from "../../leonida/hud/hud-stage";
import { toast } from "../../leonida/notifications/notification-store";
import { ButtonPrompt, ButtonPrompts, type Glyph, type Shoulder } from "../../leonida/shared/button-prompt";
import {
  HelpBox,
  HelpButton,
  HelpEvidence,
  HelpStar,
  HintTooltip,
  HintTooltipContent,
  HintTooltipTrigger,
} from "../../leonida/shared/hint-tooltip";
import type { Demo, Playground } from "../demo";
import { optionValue } from "../shared/options";

const HELP_ANCHOR = "hud-help-anchor";

const HINTS: {
  value: string;
  label: string;
  glyph: Glyph | Shoulder;
  help: ReactNode;
  text: string;
  run: () => void;
}[] = [
  {
    value: "hotwire",
    label: "Hotwire",
    glyph: "square",
    help: (
      <>
        Hold <HelpButton glyph="square" /> to hotwire the vehicle.
      </>
    ),
    text: `Hold <HelpButton glyph="square" /> to hotwire the vehicle.`,
    run: () => toast("Engine running"),
  },
  {
    value: "heal",
    label: "Heal",
    glyph: "L1",
    help: (
      <>
        Hold <HelpButton glyph="L1" /> and press <HelpButton glyph="square" /> to heal.
      </>
    ),
    text: `Hold <HelpButton glyph="L1" /> and press <HelpButton glyph="square" /> to heal.`,
    run: () => toast("Healed"),
  },
  {
    value: "atm",
    label: "Use ATM",
    glyph: "circle",
    help: (
      <>
        Press <HelpButton glyph="circle" /> to use the ATM.
      </>
    ),
    text: `Press <HelpButton glyph="circle" /> to use the ATM.`,
    run: () => toast.success("Withdrew $500"),
  },
];

const HintDemo = ({ values, set }: Playground) => {
  const showing = useRef(values.showing);
  useLayoutEffect(() => {
    showing.current = values.showing;
  }, [values.showing]);

  const openChange = (value: string, open: boolean) => {
    if (open) showing.current = value;
    else if (showing.current === value) showing.current = "none";
    else return;
    set("showing", showing.current);
  };
  return (
    <HudStage label="Help text demo">
      <span id={HELP_ANCHOR} className="hud-demo__anchor" aria-hidden="true" />
      <div data-hud="help" className="hud-demo__idle">
        <HelpBox>
          Stay out of sight <HelpStar /> and they&apos;ll lose your description{" "}
          <HelpEvidence items={["face", "clothing"]} />
        </HelpBox>
      </div>
      <Objective>
        Meet your contact at the <em>diner</em>
      </Objective>
      <div data-hud="prompts">
        <ButtonPrompts label="Help prompts" stack>
          {HINTS.map(hint => (
            <HintTooltip
              key={hint.value}
              delay={Number(values.delay)}
              open={values.showing === hint.value}
              onOpenChange={open => openChange(hint.value, open)}
            >
              <HintTooltipTrigger glyph={hint.glyph} onClick={hint.run}>
                {hint.label}
              </HintTooltipTrigger>
              <HintTooltipContent anchor={`#${HELP_ANCHOR}`}>{hint.help}</HintTooltipContent>
            </HintTooltip>
          ))}
        </ButtonPrompts>
      </div>
    </HudStage>
  );
};

const PromptsDemo = ({ values }: Playground) => (
  <HudStage label="Button prompts demo">
    <div data-hud="prompts">
      <ButtonPrompts label="Screen prompts" stack={Boolean(values.stack)}>
        <ButtonPrompt glyph="square" onClick={() => toast("Reminders")}>
          Reminders
        </ButtonPrompt>
        <ButtonPrompt
          glyph={optionValue(values.glyph, GLYPH_OPTIONS)}
          muted={Boolean(values.muted)}
          onClick={() => toast("Selected")}
        >
          {String(values.label)}
        </ButtonPrompt>
        <ButtonPrompt glyph="circle" onClick={() => toast("Back")}>
          Exit
        </ButtonPrompt>
      </ButtonPrompts>
    </div>
  </HudStage>
);

const GLYPHS: (Glyph | Shoulder)[] = ["cross", "circle", "square", "triangle", "touchpad", "L1", "R1", "L2", "R2"];

const GLYPH_OPTIONS = GLYPHS.map(value => ({
  value,
  label: value.length === 2 ? value : value[0].toUpperCase() + value.slice(1),
}));

const PROMPTS_CROP = { x: 1468, y: 890, w: 452, h: 190 };

const hudPromptsDemos: Demo[] = [
  {
    id: "hint-tooltip",
    source: {
      "hint-tooltip.tsx": () => import("../../leonida/shared/hint-tooltip.tsx?raw"),
      "hint-tooltip.css": () => import("../../leonida/shared/hint-tooltip.css?raw"),
    },
    blurb: "The quiet box in the corner that tells you what to press next.",
    captureCrop: { x: 0, y: 230, w: 640, h: 220 },
    name: "Help Text",
    sdk: "Tooltip",
    wide: true,
    caption:
      "The top-left help box with inline stars, evidence and buttons. Hover or focus a prompt to show its help there.",
    keys: [
      ["Tab", "Focus a prompt and show its help"],
      ["Space / Enter", "Run the prompt"],
      ["Escape", "Hide the help"],
    ],
    controls: [
      {
        type: "select",
        name: "showing",
        label: "Help shown",
        options: [{ value: "none", label: "None" }, ...HINTS.map(hint => ({ value: hint.value, label: hint.label }))],
      },
      { type: "number", name: "delay", label: "Hover delay (ms)", min: 0, max: 1000, step: 50 },
    ],
    defaults: { showing: "none", delay: 150 },
    examples: [
      { label: "Idle", values: {} },
      ...HINTS.map(hint => ({ label: hint.label, values: { showing: hint.value } })),
    ],
    code: v => {
      const hint = HINTS.find(item => item.value === v.showing) ?? HINTS[0];
      return `<HintTooltip delay={${v.delay}}${v.showing === hint.value ? " open" : ""}>
  <HintTooltipTrigger glyph="${hint.glyph}">${hint.label}</HintTooltipTrigger>
  <HintTooltipContent anchor="#help-anchor">
    ${hint.text}
  </HintTooltipContent>
</HintTooltip>`;
    },
    render: playground => <HintDemo {...playground} />,
  },
  {
    id: "button-prompt",
    source: {
      "button-prompt.tsx": () => import("../../leonida/shared/button-prompt.tsx?raw"),
      "button-prompt.css": () => import("../../leonida/shared/button-prompt.css?raw"),
    },
    blurb: "Condensed caps and a button disc for every action on screen.",
    captureCrop: PROMPTS_CROP,
    detailCrop: PROMPTS_CROP,
    name: "Button Prompts",
    sdk: "Button",
    wide: true,
    caption: "Bottom-right prompts: outlined condensed caps and a white button disc, stacked 52px apart.",
    keys: [
      ["Tab", "Move between prompts"],
      ["Space / Enter", "Press the prompt"],
    ],
    controls: [
      { type: "boolean", name: "stack", label: "Stacked" },
      { type: "text", name: "label", label: "Label" },
      { type: "select", name: "glyph", label: "Button", options: GLYPH_OPTIONS },
      { type: "boolean", name: "muted", label: "Muted" },
    ],
    defaults: { stack: true, label: "Select", glyph: "cross", muted: false },
    examples: [
      { label: "Stacked", values: {} },
      { label: "Footer row", values: { stack: false } },
      { label: "Muted", values: { muted: true } },
    ],
    code: v => `<ButtonPrompts label="Screen prompts"${v.stack ? " stack" : ""}>
  <ButtonPrompt glyph="square">Reminders</ButtonPrompt>
  <ButtonPrompt glyph="${v.glyph}"${v.muted ? " muted" : ""}>${v.label}</ButtonPrompt>
  <ButtonPrompt glyph="circle">Exit</ButtonPrompt>
</ButtonPrompts>`,
    render: playground => <PromptsDemo {...playground} />,
  },
];

export { hudPromptsDemos };
