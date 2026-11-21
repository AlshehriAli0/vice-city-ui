import {
  Accordion as AccordionRoot,
  AccordionHeader as AccordionHeaderRoot,
  AccordionItem as AccordionItemRoot,
  AccordionPanel as AccordionPanelRoot,
  AccordionTrigger as AccordionTriggerRoot,
} from "@ui-sdk/react/accordion";
import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactElement, ReactNode } from "react";

import { merge, styled } from "./cx";

import "./base.css";
import "./accordion.css";

const Accordion = styled(AccordionRoot, "vc-accordion");
const AccordionItem = styled(AccordionItemRoot, "vc-accordion__item");
const AccordionHeader = styled(AccordionHeaderRoot, "vc-accordion__header");

type AccordionTriggerProps = Omit<ComponentProps<typeof AccordionTriggerRoot>, "children"> & { children?: ReactNode };

function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps): ReactElement {
  return (
    <AccordionTriggerRoot {...props} className={merge("vc-accordion__trigger", className)}>
      {children}
      <ChevronDown className="vc-accordion__chevron" aria-hidden="true" />
    </AccordionTriggerRoot>
  );
}

type AccordionPanelProps = Omit<ComponentProps<typeof AccordionPanelRoot>, "children"> & { children?: ReactNode };

function AccordionPanel({ className, children, ...props }: AccordionPanelProps): ReactElement {
  return (
    <AccordionPanelRoot {...props} className={merge("vc-accordion__panel", className)}>
      <div className="vc-accordion__content">{children}</div>
    </AccordionPanelRoot>
  );
}

export { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger };
