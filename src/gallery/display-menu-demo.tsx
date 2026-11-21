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
import { SIDES, ALIGNS } from "./display-options";
import { optionValue } from "./options";
import type { Playground } from "./types";

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

export { MenuDemo };
