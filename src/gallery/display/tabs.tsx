import { Bumper } from "../../ui/display/kbd";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "../../ui/navigation/accordion";
import { Tabs, TabsBar, TabsList, TabsPanel, TabsTab } from "../../ui/navigation/tabs";
import type { Demo, Playground, Value } from "../demo";
import { optionValue, options as opts } from "../shared/options";
import { attrs } from "./options";

const TABS = opts(["map", "Map"], ["brief", "Brief"], ["progress", "Progress"]);

const TAB_VARIANTS = opts(["underline", "Underline"], ["chips", "Chips"], ["pill", "Pill"], ["slant", "Slant"]);

const TabsDemo = ({ values: v, set }: Playground) => (
  <div className="cd-stack cd-stack--plum">
    <Tabs
      variant={optionValue(v.variant, TAB_VARIANTS)}
      value={String(v.tab)}
      onValueChange={tab => tab && set("tab", tab)}
    >
      <TabsBar>
        {v.bumpers && <Bumper>L1</Bumper>}
        <TabsList aria-label="Pause menu">
          {TABS.map(tab => (
            <TabsTab key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTab>
          ))}
        </TabsList>
        {v.bumpers && <Bumper>R1</Bumper>}
      </TabsBar>
      {TABS.map(tab => (
        <TabsPanel key={tab.value} value={tab.value} className="cd-panel">
          {tab.label} content.
        </TabsPanel>
      ))}
    </Tabs>
  </div>
);

const TOPICS = [
  {
    value: "controls",
    title: "Controls",
    text: "Change the button layout and invert the camera in Settings, under Controller.",
  },
  {
    value: "map",
    title: "Map",
    text: "Open the map from the pause menu. Set a destination and the route shows on the minimap.",
  },
  {
    value: "access",
    title: "Accessibility",
    text: "Text size, subtitles and screen narration are in Settings, under UI.",
  },
];

const openItems = (value: Value | undefined): string[] => (!value || value === "none" ? [] : String(value).split(","));

const AccordionDemo = ({ values: v, set }: Playground) => (
  <div className="cd-list">
    <Accordion
      aria-label="Help topics"
      value={openItems(v.open)}
      onValueChange={open => set("open", open.join(",") || "none")}
      multiple={Boolean(v.multiple)}
      disabled={Boolean(v.disabled)}
    >
      {TOPICS.map(topic => (
        <AccordionItem key={topic.value} value={topic.value}>
          <AccordionHeader render={props => <h4 {...props}>{props.children}</h4>}>
            <AccordionTrigger>{topic.title}</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{topic.text}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
);

const displayTabsDemos: Demo[] = [
  {
    id: "core-tabs",
    source: {
      "tabs.tsx": () => import("../../ui/navigation/tabs.tsx?raw"),
      "tabs.css": () => import("../../ui/navigation/tabs.css?raw"),
    },
    blurb: "Bumper tabs and underline tabs that snap into place.",
    captureCrop: { x: 0, y: 0, w: 1010, h: 280, world: 1010 },
    keys: [
      ["← →", "Previous or next tab"],
      ["Home / End", "First or last tab"],
    ],
    name: "Tabs",
    sdk: "Tabs",
    caption:
      "The map's tabs with the #ff6b9f underline, or the settings chips, with L1 / R1 keycaps. Tabs snap; content fades in over 167ms.",
    controls: [
      { type: "select", name: "variant", label: "Variant", options: TAB_VARIANTS },
      { type: "select", name: "tab", label: "Selected tab", options: TABS },
      { type: "boolean", name: "bumpers", label: "Bumpers" },
    ],
    defaults: { variant: "underline", tab: "map", bumpers: true },
    examples: [
      { label: "Underline", values: {} },
      { label: "Chips", values: { variant: "chips" } },
      { label: "Pill", values: { variant: "pill" } },
      { label: "Slant", values: { variant: "slant" } },
    ],
    code: v => {
      const bumper = (key: string) => (v.bumpers ? `    <Bumper>${key}</Bumper>\n` : "");
      return `<Tabs${attrs(["variant", v.variant, "underline"])} value="${v.tab}" onValueChange={setTab}>
  <TabsBar>
${bumper("L1")}    <TabsList aria-label="Pause menu">
      <TabsTab value="map">Map</TabsTab>
      <TabsTab value="brief">Brief</TabsTab>
      <TabsTab value="progress">Progress</TabsTab>
    </TabsList>
${bumper("R1")}  </TabsBar>
  <TabsPanel value="map">Map content.</TabsPanel>
  {/* a TabsPanel for each tab */}
</Tabs>`;
    },
    render: playground => <TabsDemo {...playground} />,
  },
  {
    id: "core-accordion",
    source: {
      "accordion.tsx": () => import("../../ui/navigation/accordion.tsx?raw"),
      "accordion.css": () => import("../../ui/navigation/accordion.css?raw"),
    },
    blurb: "Rows that open up when there's more to say.",
    keys: [
      ["Tab", "Move between headers"],
      ["Space / Enter", "Open or close a section"],
    ],
    name: "Accordion",
    sdk: "Accordion",
    caption: "Settings rows that open. The selection bar snaps onto the focused row.",
    controls: [
      {
        type: "select",
        name: "open",
        label: "Open item",
        options: opts(["none", "None"], ["controls", "Controls"], ["map", "Map"], ["access", "Accessibility"]),
      },
      { type: "boolean", name: "multiple", label: "Multiple" },
      { type: "boolean", name: "disabled", label: "Disabled" },
    ],
    defaults: { open: "controls", multiple: false, disabled: false },
    examples: [
      { label: "One open", values: {} },
      { label: "All closed", values: { open: "none" } },
      { label: "Several open", values: { multiple: true, open: "controls,map" } },
    ],
    code: v => {
      const open = openItems(v.open);
      return `<Accordion value={[${open.map(item => `"${item}"`).join(", ")}]} onValueChange={setOpen}${attrs(["multiple", v.multiple], ["disabled", v.disabled])}>
  <AccordionItem value="controls">
    <AccordionHeader>
      <AccordionTrigger>Controls</AccordionTrigger>
    </AccordionHeader>
    <AccordionPanel>Change the button layout…</AccordionPanel>
  </AccordionItem>
  {/* more AccordionItems */}
</Accordion>`;
    },
    render: playground => <AccordionDemo {...playground} />,
  },
];

export { displayTabsDemos };
