import {
  Tooltip,
  TooltipArrow,
  TooltipContent as TooltipContentRoot,
  TooltipShortcut,
  TooltipTrigger as TooltipTriggerRoot,
} from "@ui-sdk/react/tooltip";
import type { ComponentProps, ReactElement, ReactNode } from "react";

import { merge, styled } from "./cx";

import "./base.css";
import "./tooltip.css";

const TooltipTrigger = styled(TooltipTriggerRoot, "vc-tooltip-trigger");

type TooltipContentProps = Omit<ComponentProps<typeof TooltipContentRoot>, "children"> & { children?: ReactNode };

function TooltipContent({ className, children, sideOffset = 8, ...props }: TooltipContentProps): ReactElement {
  return (
    <TooltipContentRoot {...props} sideOffset={sideOffset} className={merge("vc-tooltip", className)}>
      <TooltipArrow className="vc-arrow" />
      {children}
      <TooltipShortcut className="vc-tooltip__shortcut" />
    </TooltipContentRoot>
  );
}

export { Tooltip, TooltipContent, TooltipTrigger };
