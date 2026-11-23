import {
  Menu,
  MenuCheckboxItem as MenuCheckboxItemRoot,
  MenuContent as MenuContentRoot,
  MenuContextTrigger as MenuContextTriggerRoot,
  MenuGroup,
  MenuGroupLabel as MenuGroupLabelRoot,
  MenuItem as MenuItemRoot,
  MenuItemIcon as MenuItemIconRoot,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem as MenuRadioItemRoot,
  MenuSeparator as MenuSeparatorRoot,
  MenuShortcut,
  MenuSub,
  MenuSubContent as MenuSubContentRoot,
  MenuSubTrigger as MenuSubTriggerRoot,
  MenuTrigger as MenuTriggerRoot,
} from "@ui-sdk/react/menu";
import { Check, ChevronRight } from "lucide-react";
import { Children, type ComponentProps, type ReactNode } from "react";

import { merge, POPUP_CLEARANCE, styled } from "../../shared/class-names";

import "../shared/base.css";
import "./menu.css";

const MenuTrigger = styled(MenuTriggerRoot, "vc-menu-trigger");
const MenuContextTrigger = styled(MenuContextTriggerRoot, "vc-context-area");
const MenuGroupLabel = styled(MenuGroupLabelRoot, "vc-menu__label");
const MenuSeparator = styled(MenuSeparatorRoot, "vc-menu__sep");
const MenuItemIcon = styled(MenuItemIconRoot, "vc-menu__icon");

const boxText = (children: ReactNode) =>
  Children.map(children, child =>
    typeof child === "string" || typeof child === "number" ? <span className="vc-menu__text">{child}</span> : child
  );

type MenuItemProps = Omit<ComponentProps<typeof MenuItemRoot>, "children"> & { children?: ReactNode };

const MenuItem = ({ className, children, ...props }: MenuItemProps) => (
  <MenuItemRoot {...props} className={merge("vc-menu__item", className)}>
    {boxText(children)}
  </MenuItemRoot>
);

const MenuContent = ({
  className,
  collisionPadding = POPUP_CLEARANCE,
  ...props
}: ComponentProps<typeof MenuContentRoot>) => (
  <MenuContentRoot {...props} collisionPadding={collisionPadding} className={merge("vc-menu vc-surface", className)} />
);

const MenuSubContent = ({
  className,
  collisionPadding = POPUP_CLEARANCE,
  ...props
}: ComponentProps<typeof MenuSubContentRoot>) => (
  <MenuSubContentRoot
    {...props}
    collisionPadding={collisionPadding}
    className={merge("vc-menu vc-surface", className)}
  />
);

type MenuCheckboxItemProps = Omit<ComponentProps<typeof MenuCheckboxItemRoot>, "children"> & { children?: ReactNode };

const MenuCheckboxItem = ({ className, children, ...props }: MenuCheckboxItemProps) => (
  <MenuCheckboxItemRoot {...props} className={merge("vc-menu__item", className)}>
    <MenuItemIndicator className="vc-menu__check" keepMounted>
      <Check aria-hidden="true" />
    </MenuItemIndicator>
    {boxText(children)}
  </MenuCheckboxItemRoot>
);

type MenuRadioItemProps = Omit<ComponentProps<typeof MenuRadioItemRoot>, "children"> & { children?: ReactNode };

const MenuRadioItem = ({ className, children, ...props }: MenuRadioItemProps) => (
  <MenuRadioItemRoot {...props} className={merge("vc-menu__item", className)}>
    <MenuItemIndicator className="vc-menu__radio" keepMounted />
    {boxText(children)}
  </MenuRadioItemRoot>
);

type MenuSubTriggerProps = Omit<ComponentProps<typeof MenuSubTriggerRoot>, "children"> & { children?: ReactNode };

const MenuSubTrigger = ({ className, children, ...props }: MenuSubTriggerProps) => (
  <MenuSubTriggerRoot {...props} className={merge("vc-menu__item", className)}>
    {boxText(children)}
    <ChevronRight className="vc-menu__sub-chev" aria-hidden="true" />
  </MenuSubTriggerRoot>
);

export {
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
  MenuShortcut,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
};
