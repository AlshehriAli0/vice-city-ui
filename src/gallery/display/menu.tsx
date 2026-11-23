import { lazy } from "react";

import type { Demo } from "../demo";
import { options as opts } from "../shared/options";
import { attrs, SIDES, ALIGNS } from "./options";

const MenuDemo = lazy(() => import("./menu-demo").then(module => ({ default: module.MenuDemo })));

const displayMenuDemos: Demo[] = [
  {
    id: "core-menu",
    source: {
      "menu.tsx": () => import("../../ui/overlays/menu.tsx?raw"),
      "menu.css": () => import("../../ui/overlays/menu.css?raw"),
    },
    blurb: "A compact menu with submenus, checks and radios.",
    keys: [
      ["Space / Enter / ↓", "Open the menu"],
      ["↑ ↓", "Move through items"],
      ["→ / ←", "Open or close a submenu"],
      ["Shift+F10", "Open the context menu"],
      ["Escape", "Close"],
    ],
    name: "Dropdown menu",
    sdk: "Menu",
    caption:
      "The pause panel in miniature: 64px rows, icons that fill on focus, a submenu, checkboxes and radios. As a context menu, it opens where you right-click.",
    controls: [
      {
        type: "select",
        name: "trigger",
        label: "Trigger",
        options: opts(["button", "Button"], ["context", "Right-click"]),
      },
      { type: "boolean", name: "open", label: "Open" },
      { type: "select", name: "side", label: "Side", options: SIDES },
      { type: "select", name: "align", label: "Align", options: ALIGNS },
    ],
    defaults: { trigger: "button", open: false, side: "right", align: "start" },
    examples: [
      { label: "Dropdown", values: { open: true } },
      { label: "Below", values: { open: true, side: "bottom" } },
      { label: "Context menu", values: { trigger: "context" } },
    ],
    code: v =>
      v.trigger === "context"
        ? `<Menu onAction={run}>
  <MenuContextTrigger aria-label="Photo options area">…</MenuContextTrigger>
  <MenuContent>
    <MenuItem value="Liked">Like</MenuItem>
    <MenuItem value="Shared">Share</MenuItem>
    <MenuSeparator />
    <MenuItem value="Deleted">Delete</MenuItem>
  </MenuContent>
</Menu>`
        : `<Menu open={${v.open}} onOpenChange={setOpen} onAction={run}>
  <MenuTrigger>Quick menu</MenuTrigger>
  <MenuContent${attrs(["side", v.side, "bottom"], ["align", v.align, "start"])}>
    <MenuItem value="map">Map</MenuItem>
    <MenuSub>
      <MenuSubTrigger>Settings</MenuSubTrigger>
      <MenuSubContent>
        <MenuItem value="audio">Audio</MenuItem>
      </MenuSubContent>
    </MenuSub>
    <MenuSeparator />
    <MenuCheckboxItem value="minimap" defaultChecked>Minimap</MenuCheckboxItem>
  </MenuContent>
</Menu>`,
    render: playground => <MenuDemo {...playground} />,
  },
];

export { displayMenuDemos };
