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
} from "@ui-sdk/react/menu"
import { Check, ChevronRight } from "lucide-react"
import { Children, type ComponentProps, type ReactElement, type ReactNode } from "react"
import { merge, POPUP_CLEARANCE, styled } from "./cx"
import "./base.css"
import "./menu.css"

const MenuTrigger = styled(MenuTriggerRoot, "vc-menu-trigger")
const MenuContextTrigger = styled(MenuContextTriggerRoot, "vc-context-area")
const MenuGroupLabel = styled(MenuGroupLabelRoot, "vc-menu__label")
const MenuSeparator = styled(MenuSeparatorRoot, "vc-menu__sep")
const MenuItemIcon = styled(MenuItemIconRoot, "vc-menu__icon")

// Chrome snaps an element's box to whole pixels but not bare flex text, so a row's label gets a box of its own.
function boxText(children: ReactNode): ReactNode {
  return Children.map(children, (child) => (typeof child === "string" || typeof child === "number" ? <span className="vc-menu__text">{child}</span> : child))
}

type MenuItemProps = Omit<ComponentProps<typeof MenuItemRoot>, "children"> & { children?: ReactNode }

function MenuItem({ className, children, ...props }: MenuItemProps): ReactElement {
  return (
    <MenuItemRoot {...props} className={merge("vc-menu__item", className)}>
      {boxText(children)}
    </MenuItemRoot>
  )
}

function MenuContent({ className, collisionPadding = POPUP_CLEARANCE, ...props }: ComponentProps<typeof MenuContentRoot>): ReactElement {
  return <MenuContentRoot {...props} collisionPadding={collisionPadding} className={merge("vc-menu vc-surface", className)} />
}

function MenuSubContent({ className, collisionPadding = POPUP_CLEARANCE, ...props }: ComponentProps<typeof MenuSubContentRoot>): ReactElement {
  return <MenuSubContentRoot {...props} collisionPadding={collisionPadding} className={merge("vc-menu vc-surface", className)} />
}

type MenuCheckboxItemProps = Omit<ComponentProps<typeof MenuCheckboxItemRoot>, "children"> & { children?: ReactNode }

function MenuCheckboxItem({ className, children, ...props }: MenuCheckboxItemProps): ReactElement {
  return (
    <MenuCheckboxItemRoot {...props} className={merge("vc-menu__item", className)}>
      <MenuItemIndicator className="vc-menu__check" keepMounted>
        <Check aria-hidden="true" />
      </MenuItemIndicator>
      {boxText(children)}
    </MenuCheckboxItemRoot>
  )
}

type MenuRadioItemProps = Omit<ComponentProps<typeof MenuRadioItemRoot>, "children"> & { children?: ReactNode }

function MenuRadioItem({ className, children, ...props }: MenuRadioItemProps): ReactElement {
  return (
    <MenuRadioItemRoot {...props} className={merge("vc-menu__item", className)}>
      <MenuItemIndicator className="vc-menu__radio" keepMounted />
      {boxText(children)}
    </MenuRadioItemRoot>
  )
}

type MenuSubTriggerProps = Omit<ComponentProps<typeof MenuSubTriggerRoot>, "children"> & { children?: ReactNode }

function MenuSubTrigger({ className, children, ...props }: MenuSubTriggerProps): ReactElement {
  return (
    <MenuSubTriggerRoot {...props} className={merge("vc-menu__item", className)}>
      {boxText(children)}
      <ChevronRight className="vc-menu__sub-chev" aria-hidden="true" />
    </MenuSubTriggerRoot>
  )
}

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
}
