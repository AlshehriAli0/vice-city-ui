import {
  Select,
  SelectContent as SelectContentRoot,
  SelectItem as SelectItemRoot,
  SelectItemIcon as SelectItemIconRoot,
  SelectItemIndicator as SelectItemIndicatorRoot,
  SelectItemText as SelectItemTextRoot,
  SelectLabel as SelectLabelRoot,
  SelectTrigger as SelectTriggerRoot,
  SelectValue as SelectValueRoot,
} from "@ui-sdk/react/select";
import type { ComponentProps, ReactNode } from "react";

import { merge, POPUP_CLEARANCE, styled } from "./cx";
import { Check, ChevronDown } from "./icons";

import "./ui.css";
import "./select.css";

type SelectTriggerProps = ComponentProps<typeof SelectTriggerRoot> & { size?: "sm" | "md" | "lg" };

const SelectTrigger = ({ size, className, children, ...props }: SelectTriggerProps) => (
  <SelectTriggerRoot {...props} className={merge("vc-control vc-select", className)} data-size={size}>
    {typeof children === "function" ? state => withChevron(children(state)) : withChevron(children)}
  </SelectTriggerRoot>
);

const withChevron = (children: ReactNode) => (
  <>
    {children}
    <ChevronDown className="vc-chevron" />
  </>
);

const SelectContent = ({ className, ...props }: ComponentProps<typeof SelectContentRoot>) => (
  <SelectContentRoot
    sideOffset={6}
    collisionPadding={POPUP_CLEARANCE}
    {...props}
    className={merge("vc-pop vc-select__list", className)}
  />
);

const SelectItemIndicator = ({ className, children, ...props }: ComponentProps<typeof SelectItemIndicatorRoot>) => (
  <SelectItemIndicatorRoot {...props} className={merge("vc-row__check", className)}>
    {children ?? <Check />}
  </SelectItemIndicatorRoot>
);

const SelectLabel = styled(SelectLabelRoot, "vc-label");
const SelectValue = styled(SelectValueRoot, "vc-select__value");
const SelectItem = styled(SelectItemRoot, "vc-row");
const SelectItemIcon = styled(SelectItemIconRoot, "vc-row__icon");
const SelectItemText = styled(SelectItemTextRoot, "vc-row__text");

export {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIcon,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectTrigger,
  SelectValue,
};
export type { SelectTriggerProps };
