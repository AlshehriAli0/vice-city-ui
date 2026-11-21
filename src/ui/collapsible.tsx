import {
  Collapsible as CollapsibleRoot,
  CollapsiblePanel as CollapsiblePanelRoot,
  CollapsibleTrigger as CollapsibleTriggerRoot,
} from "@ui-sdk/react/collapsible";
import { ChevronRight } from "lucide-react";
import type { ComponentProps, ReactElement, ReactNode } from "react";

import { merge, styled } from "./cx";

import "./base.css";
import "./collapsible.css";

const Collapsible = styled(CollapsibleRoot, "vc-collapsible");

type CollapsibleTriggerProps = Omit<ComponentProps<typeof CollapsibleTriggerRoot>, "children"> & {
  children?: ReactNode;
};

function CollapsibleTrigger({ className, children, ...props }: CollapsibleTriggerProps): ReactElement {
  return (
    <CollapsibleTriggerRoot {...props} className={merge("vc-collapsible__trigger", className)}>
      <ChevronRight className="vc-collapsible__chevron" aria-hidden="true" />
      {children}
    </CollapsibleTriggerRoot>
  );
}

type CollapsiblePanelProps = Omit<ComponentProps<typeof CollapsiblePanelRoot>, "children"> & { children?: ReactNode };

function CollapsiblePanel({ className, children, ...props }: CollapsiblePanelProps): ReactElement {
  return (
    <CollapsiblePanelRoot {...props} className={merge("vc-collapsible__panel", className)}>
      <div className="vc-collapsible__content">{children}</div>
    </CollapsiblePanelRoot>
  );
}

export { Collapsible, CollapsiblePanel, CollapsibleTrigger };
