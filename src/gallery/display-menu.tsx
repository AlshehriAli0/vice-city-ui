import { Map as MapIcon, SlidersVertical, Smartphone, Trash2 } from "lucide-react";
import { useState, type ReactElement } from "react";

import { toast } from "../leonida/mission-toast.store";
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuContextTrigger,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuItemIcon,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "../ui/menu";
import { attrs, SIDES, ALIGNS } from "./display-options";
import { optionValue, options as opts } from "./options";
import type { Demo, Playground } from "./types";

function MenuDemo({ values: v, set }: Playground): ReactElement {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const menu = { open: Boolean(v.open), onOpenChange: (next: boolean) => set("open", next) };
  const place = { side: optionValue(v.side, SIDES), align: optionValue(v.align, ALIGNS) };
  if (v.trigger === "context")
    return (
      <div className="cd-list cd-list--menu">
        <Menu {...menu} onAction={value => toast(`${value} the photo`)}>
          <MenuContextTrigger tabIndex={0} aria-label="Photo options area">
            <img className="cd-thumb" src="/vc/shot-sea-sunset.jpg" alt="" />
            <span className="cd-line__main">
              Photo
              <small>Right-click, long-press or Shift F10</small>
            </span>
          </MenuContextTrigger>
          <MenuContent>
            <MenuItem value="Liked">Like</MenuItem>
            <MenuItem value="Shared">Share</MenuItem>
            <MenuSeparator />
            <MenuItem value="Deleted">
              <MenuItemIcon>
                <Trash2 />
              </MenuItemIcon>
              Delete
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    );
  return (
    <div className="cd-list cd-list--menu">
      <Menu {...menu} onAction={value => toast(`Chose ${value}`)}>
        <MenuTrigger ref={setAnchor} className="cd-line cd-line--button">
          Quick menu
        </MenuTrigger>
        <MenuContent anchor={anchor} {...place}>
          <MenuGroup>
            <MenuGroupLabel>Pause</MenuGroupLabel>
            <MenuItem value="map">
              <MenuItemIcon>
                <MapIcon />
              </MenuItemIcon>
              Map
            </MenuItem>
            <MenuItem value="phone">
              <MenuItemIcon>
                <Smartphone />
              </MenuItemIcon>
              Phone
            </MenuItem>
            <MenuSub>
              <MenuSubTrigger>
                <MenuItemIcon>
                  <SlidersVertical />
                </MenuItemIcon>
                Settings
              </MenuSubTrigger>
              <MenuSubContent>
                <MenuItem value="controller">Controller</MenuItem>
                <MenuItem value="display">Display</MenuItem>
                <MenuItem value="audio">Audio</MenuItem>
              </MenuSubContent>
            </MenuSub>
          </MenuGroup>
          <MenuSeparator />
          <MenuGroup>
            <MenuGroupLabel>HUD</MenuGroupLabel>
            <MenuCheckboxItem value="minimap" defaultChecked>
              Minimap
            </MenuCheckboxItem>
            <MenuCheckboxItem value="subtitles">Subtitles</MenuCheckboxItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuRadioGroup defaultValue="default" aria-label="Text size">
            <MenuGroupLabel>Text size</MenuGroupLabel>
            <MenuRadioItem value="default">Default</MenuRadioItem>
            <MenuRadioItem value="large">Large</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    </div>
  );
}

const displayMenuDemos: Demo[] = [
  {
    id: "core-menu",
    file: "ui/menu",
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
