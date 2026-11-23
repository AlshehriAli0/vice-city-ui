import { lazy } from "react";

import { BUILDS, FAMILIES, PAINT_TYPES, SECTIONS, paintKey } from "../../leonida/menus/mod-shop/shop-inventory";
import { FULL_FRAME_CROP } from "../demo";
import type { Demo, Playground, Value, Values } from "../demo";
import { optionValue } from "../shared/options";

const ModShop = lazy(() =>
  import("../../leonida/menus/mod-shop/mod-shop").then(module => ({ default: module.ModShop }))
);

const SECTION_OPTIONS = SECTIONS.map(({ value, label }) => ({ value, label }));
const FAMILY_OPTIONS = FAMILIES.map(({ value, label }) => ({ value, label }));
const COLOURS = [
  ...new Map(FAMILIES.flatMap(family => family.swatches.map(swatch => [swatch.value, swatch] as const))).values(),
];
const COLOUR_OPTIONS = COLOURS.map(({ value, label }) => ({ value, label }));
const BUILD_OPTIONS = BUILDS.map(({ value, label }) => ({ value, label: label.replace(/^\w+ Build - /, "") }));
const TYPE_OPTIONS = PAINT_TYPES.map(({ value, label }) => ({ value, label }));

const familyOf = (colour: Value) =>
  FAMILIES.find(family => family.swatches.some(swatch => swatch.value === colour))?.value ?? "recommended";

const currentKey = (values: Values) =>
  values.section === "full-kits"
    ? String(values.build)
    : paintKey(String(values.colour), optionValue(values.paintType, TYPE_OPTIONS) ?? "gloss");

const updateShop = (values: Values, name: string, value: Value): Values => {
  const next = { ...values, [name]: value };
  if (name === "family") next.colour = FAMILIES.find(family => family.value === value)?.swatches[0].value ?? "";
  if (
    name === "colour" &&
    !FAMILIES.find(family => family.value === next.family)?.swatches.some(s => s.value === value)
  ) {
    next.family = familyOf(value);
  }
  const slot = next.section === "full-kits" ? "appliedBuild" : "appliedPaint";
  if (name === "owned") next[slot] = value ? currentKey(next) : "";
  else next.owned = next[slot] === currentKey(next);
  return next;
};

const ModShopDemo = ({ values, set }: Playground) => {
  const section = optionValue(values.section, SECTION_OPTIONS) ?? "respray";
  const applied = [values.appliedPaint, values.appliedBuild].filter((item): item is string => Boolean(item));
  return (
    <ModShop
      section={section}
      family={String(values.family)}
      onFamilyChange={family => set("family", family)}
      value={String(values.colour)}
      onValueChange={colour => set("colour", colour)}
      build={String(values.build)}
      onBuildChange={build => set("build", build)}
      paintType={optionValue(values.paintType, TYPE_OPTIONS)}
      onPaintTypeChange={type => set("paintType", type)}
      cash={Number(values.cash)}
      onCashChange={cash => set("cash", cash)}
      buckme={Number(values.buckme)}
      onBuckmeChange={buckme => set("buckme", buckme)}
      applied={applied}
      onAppliedChange={next => {
        set("appliedPaint", next.find(item => item.includes("/")) ?? "");
        set("appliedBuild", next.find(item => !item.includes("/")) ?? "");
      }}
    />
  );
};

const quote = (value: Value) => JSON.stringify(String(value));

const modShopDemos: Demo[] = [
  {
    id: "mod-shop",
    source: {
      "mod-shop.tsx": () => import("../../leonida/menus/mod-shop/mod-shop.tsx?raw"),
      "mod-shop.css": () => import("../../leonida/menus/mod-shop/mod-shop.css?raw"),
    },
    blurb: "Pick a paint, watch the car change, then pay for it.",
    captureCrop: FULL_FRAME_CROP,
    detailFrame: "game",
    name: "Mod Shop",
    sdk: "Tabs · Radio Group · Button",
    caption:
      "Coastal Auto Care at 1080p: breadcrumb, cash, the price row, a 110px swatch strip with its counter, colour tabs on LB/RB and the vehicle card. Full Kits swaps in the build card and the stat panel with green and red deltas.",
    wide: true,
    keys: [
      ["← →", "Previous or next colour, or build. The strip wraps at either end"],
      ["↑ ↓", "Paint type: Gloss or Solid Metallic"],
      ["Q / E", "Previous or next colour family (L1 / R1)"],
      ["Enter", "Buy the focused colour or build"],
      ["Backspace", "Back"],
    ],
    controls: [
      { type: "select", name: "section", label: "Category", options: SECTION_OPTIONS },
      { type: "select", name: "family", label: "Colour family", options: FAMILY_OPTIONS },
      { type: "select", name: "colour", label: "Selected colour", options: COLOUR_OPTIONS },
      { type: "select", name: "paintType", label: "Paint finish", options: TYPE_OPTIONS },
      { type: "select", name: "build", label: "Build", options: BUILD_OPTIONS },
      { type: "number", name: "cash", label: "Starting cash", min: 0, max: 5000, step: 1 },
      { type: "number", name: "buckme", label: "BuckMe balance", min: 0, max: 20000, step: 1 },
      { type: "boolean", name: "owned", label: "Owned" },
    ],
    defaults: {
      section: "respray",
      family: "recommended",
      colour: "sea-wash",
      paintType: "gloss",
      build: BUILDS[0].value,
      cash: 1147,
      buckme: 2005,
      owned: false,
      appliedPaint: "",
      appliedBuild: "",
    },
    update: updateShop,
    examples: [
      { label: "Respray", values: {} },
      { label: "Solid Metallic", values: { family: "green", colour: "jade", paintType: "metallic" } },
      { label: "Not enough cash", values: { family: "red", colour: "burgundy", cash: 250, buckme: 120 } },
      { label: "Owned", values: { family: "blue", colour: "cosmic", owned: true, appliedPaint: "cosmic/gloss" } },
      { label: "Full Kits", values: { section: "full-kits" } },
      { label: "Racing build", values: { section: "full-kits", build: "racing-standard" } },
    ],
    code: v => {
      const section = optionValue(v.section, SECTION_OPTIONS) ?? "respray";
      const applied = [v.appliedPaint, v.appliedBuild].filter(Boolean).map(quote).join(", ");
      const item =
        section === "full-kits"
          ? `  build=${quote(v.build)}\n  onBuildChange={setBuild}`
          : `  family=${quote(v.family)}\n  onFamilyChange={setFamily}\n  value=${quote(v.colour)}\n  onValueChange={setColour}\n  paintType=${quote(v.paintType)}\n  onPaintTypeChange={setPaintType}`;
      return `<ModShop
  section=${quote(section)}
${item}
  cash={${v.cash}}
  onCashChange={setCash}
  buckme={${v.buckme}}
  onBuckmeChange={setBuckme}
  applied={[${applied}]}
  onAppliedChange={setApplied}
  onPurchase={({ label, price }) => log(\`Bought \${label} for $\${price}\`)}
  onBack={close}
/>`;
    },
    render: playground => <ModShopDemo {...playground} />,
  },
];

export { modShopDemos };
