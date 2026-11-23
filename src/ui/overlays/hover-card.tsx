import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent as HoverCardContentRoot,
  HoverCardTrigger as HoverCardTriggerRoot,
} from "@ui-sdk/react/hover-card";
import type { ComponentProps, ReactNode } from "react";

import { merge, styled } from "../../shared/class-names";

import "../shared/base.css";
import "./hover-card.css";

const HoverCardTrigger = styled(HoverCardTriggerRoot, "vc-hovercard-trigger");

type HoverCardContentProps = Omit<ComponentProps<typeof HoverCardContentRoot>, "children"> & { children?: ReactNode };

const HoverCardContent = ({ className, children, sideOffset = 10, ...props }: HoverCardContentProps) => (
  <HoverCardContentRoot {...props} sideOffset={sideOffset} className={merge("vc-hovercard vc-surface", className)}>
    <HoverCardArrow className="vc-arrow" />
    {children}
  </HoverCardContentRoot>
);

export { HoverCard, HoverCardContent, HoverCardTrigger };
