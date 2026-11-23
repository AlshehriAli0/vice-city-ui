import { toast } from "../../leonida/notifications/notification-store";
import { Badge, BadgeDot } from "../../ui/display/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardMedia, CardTitle } from "../../ui/display/card";
import { ViceText } from "../../ui/display/vice-text";
import { Button } from "../../ui/forms/button";
import type { Demo, Playground } from "../demo";
import { optionValue, options as opts } from "../shared/options";
import { attrs } from "./options";

const CARD_VARIANTS = opts(["glass", "Glass"], ["solid", "Solid"], ["sticker", "Sticker"], ["sunset", "Sunset"]);

const CardDemo = ({ values: v }: Playground) => (
  <div className="cd-center cd-center--card">
    <Card variant={optionValue(v.variant, CARD_VARIANTS)} interactive={Boolean(v.interactive)} className="cd-card">
      {v.media && (
        <CardMedia ratio="4 / 3" focus="50% 60%">
          <img src="/vc/ue-grotti-cheetah.jpg" alt="" loading="lazy" />
        </CardMedia>
      )}
      <CardHeader>
        <CardTitle render={props => <h4 {...props}>{props.children}</h4>}>{String(v.title)}</CardTitle>
        {v.description ? <CardDescription>{String(v.description)}</CardDescription> : null}
      </CardHeader>
      {v.footer && (
        <CardFooter>
          <Badge variant="outline">Owned</Badge>
          <Button size="sm" className="cd-push" onClick={() => toast("Waypoint set")}>
            Set waypoint
          </Button>
        </CardFooter>
      )}
    </Card>
  </div>
);

const ViceTextDemo = ({ values: v }: Playground) => {
  const text = String(v.text).trim() || "Your name";
  return (
    <div className="cd-vice">
      <ViceText className="cd-vice__text" style={{ fontSize: `min(${Number(v.size)}px, 30cqi)` }}>
        {text}
      </ViceText>
    </div>
  );
};

const BADGE_VARIANTS = opts(
  ["solid", "Solid"],
  ["soft", "Soft"],
  ["outline", "Outline"],
  ["neon", "Neon"],
  ["sunset", "Sunset"]
);

const BADGE_TONES = opts(
  ["pink", "Pink"],
  ["teal", "Teal"],
  ["amber", "Amber"],
  ["cash", "Cash"],
  ["red", "Red"],
  ["violet", "Violet"],
  ["neutral", "Neutral"]
);

const BadgeDemo = ({ values: v }: Playground) => (
  <div className="cd-list">
    <div className="cd-line">
      <span className="cd-line__main">
        Item name
        <small>Vice City</small>
      </span>
      <span className="cd-line__meta">
        <Badge variant={optionValue(v.variant, BADGE_VARIANTS)} tone={optionValue(v.tone, BADGE_TONES)}>
          {v.dot && <BadgeDot />}
          {String(v.text)}
        </Badge>
      </span>
    </div>
  </div>
);

const displayCardsDemos: Demo[] = [
  {
    id: "core-cards",
    source: {
      "card.tsx": () => import("../../ui/display/card.tsx?raw"),
      "card.css": () => import("../../ui/display/card.css?raw"),
    },
    blurb: "A dark card with a pink rule, ready for any briefing.",
    captureCrop: { x: 0, y: 0, w: 860, h: 500, world: 860 },
    keys: [
      ["Tab", "Move between card actions"],
      ["Space / Enter", "Run an action"],
    ],
    name: "Info card",
    sdk: "Card",
    caption: "The map's info card: a 3px pink top rule over a dark body, 34px display title, 26px text.",
    wide: true,
    controls: [
      { type: "select", name: "variant", label: "Variant", options: CARD_VARIANTS },
      { type: "boolean", name: "interactive", label: "Interactive" },
      { type: "boolean", name: "media", label: "Media" },
      { type: "boolean", name: "footer", label: "Footer" },
      { type: "text", name: "title", label: "Title" },
      { type: "text", name: "description", label: "Description" },
    ],
    defaults: {
      variant: "glass",
      interactive: true,
      media: true,
      footer: true,
      title: "Vehicles",
      description: "Vice City",
    },
    examples: [
      { label: "Media card", values: {} },
      {
        label: "Text only",
        values: {
          interactive: false,
          media: false,
          footer: false,
          title: "Task name",
          description: "A short description of the place or task.",
        },
      },
      {
        label: "Sticker",
        values: {
          variant: "sticker",
          media: false,
          footer: false,
          title: "Selected",
          description: "The focused tile takes a 3px light outline.",
        },
      },
      { label: "Sunset", values: { variant: "sunset" } },
    ],
    code: v =>
      [
        `<Card${attrs(["variant", v.variant, "glass"], ["interactive", v.interactive])}>`,
        v.media && `  <CardMedia ratio="4 / 3">\n    <img src="/vc/ue-grotti-cheetah.jpg" alt="" />\n  </CardMedia>`,
        `  <CardHeader>\n    <CardTitle>${v.title}</CardTitle>`,
        v.description && `    <CardDescription>${v.description}</CardDescription>`,
        `  </CardHeader>`,
        v.footer &&
          `  <CardFooter>\n    <Badge variant="outline">Owned</Badge>\n    <Button size="sm">Set waypoint</Button>\n  </CardFooter>`,
        `</Card>`,
      ]
        .filter(Boolean)
        .join("\n"),
    render: playground => <CardDemo {...playground} />,
  },
  {
    id: "core-vice-text",
    source: {
      "vice-text.tsx": () => import("../../ui/display/vice-text.tsx?raw"),
      "vice-text.css": () => import("../../ui/display/vice-text.css?raw"),
    },
    blurb: "Type a name and see it in the Vice City wordmark style.",
    name: "Vice text",
    sdk: "Primitive · SVG filter",
    caption:
      "Any text in the wordmark style: a sunset sky with palms the sun washes out, a white keyline and a purple edge that darkens outward. The outline scales with the font size.",
    wide: true,
    controls: [
      { type: "text", name: "text", label: "Text" },
      { type: "number", name: "size", label: "Size", min: 32, max: 160 },
    ],
    defaults: { text: "Jason", size: 120 },
    examples: [
      { label: "Jason", values: {} },
      { label: "Leonida", values: { text: "Leonida" } },
      { label: "Vice City", values: { text: "Vice City", size: 96 } },
      { label: "Small", values: { text: "Leonida", size: 40 } },
    ],
    code: v => `<ViceText style={{ fontSize: ${v.size} }}>${String(v.text).trim() || "Your name"}</ViceText>`,
    render: playground => <ViceTextDemo {...playground} />,
  },
  {
    id: "core-badges",
    source: {
      "badge.tsx": () => import("../../ui/display/badge.tsx?raw"),
      "badge.css": () => import("../../ui/display/badge.css?raw"),
    },
    blurb: "Owned, Wearing, New. Status in a few condensed caps.",
    name: "Badge",
    sdk: "Badge",
    caption: "Square condensed caps for status, the store's Owned and Wearing. Pink and a diamond mark what's new.",
    controls: [
      { type: "select", name: "variant", label: "Variant", options: BADGE_VARIANTS },
      {
        type: "select",
        name: "tone",
        label: "Tone",
        options: BADGE_TONES,
      },
      { type: "boolean", name: "dot", label: "Dot" },
      { type: "text", name: "text", label: "Text" },
    ],
    defaults: { variant: "outline", tone: "pink", dot: true, text: "New" },
    examples: [
      { label: "New", values: {} },
      { label: "Owned", values: { variant: "soft", tone: "neutral", dot: false, text: "Owned" } },
      { label: "Wearing", values: { variant: "solid", tone: "neutral", dot: false, text: "Wearing" } },
      { label: "Not owned", values: { variant: "outline", tone: "neutral", dot: false, text: "Not owned" } },
    ],
    code: v =>
      `<Badge${attrs(["variant", v.variant, "soft"], ["tone", v.tone, "pink"])}>\n${v.dot ? "  <BadgeDot />\n" : ""}  ${v.text}\n</Badge>`,
    render: playground => <BadgeDemo {...playground} />,
  },
];

export { displayCardsDemos };
