import {
  Popover,
  PopoverArrow,
  PopoverClose as PopoverCloseRoot,
  PopoverContent as PopoverContentRoot,
  PopoverDescription as PopoverDescriptionRoot,
  PopoverTitle as PopoverTitleRoot,
  PopoverTrigger as PopoverTriggerRoot,
} from "@ui-sdk/react/popover";
import type { ComponentProps, ReactNode } from "react";

import { merge, POPUP_CLEARANCE, styled } from "../../shared/class-names";

import "../shared/base.css";
import "./popover.css";

const PopoverTrigger = styled(PopoverTriggerRoot, "vc-popover-trigger");
const PopoverTitle = styled(PopoverTitleRoot, "vc-popover__title");
const PopoverDescription = styled(PopoverDescriptionRoot, "vc-popover__description");
const PopoverClose = styled(PopoverCloseRoot, "vc-popover__close");

type PopoverContentProps = Omit<ComponentProps<typeof PopoverContentRoot>, "children"> & { children?: ReactNode };

const PopoverContent = ({
  className,
  children,
  sideOffset = 10,
  collisionPadding = POPUP_CLEARANCE,
  ...props
}: PopoverContentProps) => (
  <PopoverContentRoot
    {...props}
    sideOffset={sideOffset}
    collisionPadding={collisionPadding}
    className={merge("vc-popover vc-surface", className)}
  >
    <PopoverArrow className="vc-arrow" />
    {children}
  </PopoverContentRoot>
);

export { Popover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger };
