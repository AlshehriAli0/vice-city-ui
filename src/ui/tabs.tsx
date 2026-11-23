import {
  Tabs as TabsRoot,
  TabsList as TabsListRoot,
  TabsPanel as TabsPanelRoot,
  TabsTab as TabsTabRoot,
} from "@ui-sdk/react/tabs";
import type { ComponentProps } from "react";

import { merge, styled } from "./cx";
import { plain } from "./plain";

import "./base.css";
import "./tabs.css";

type TabsProps = ComponentProps<typeof TabsRoot> & { variant?: "underline" | "chips" | "pill" | "slant" };

const Tabs = ({ variant = "underline", className, ...props }: TabsProps) => (
  <TabsRoot {...props} className={merge("vc-tabs", className)} data-variant={variant} />
);

const TabsBar = plain("div", "tabs-bar", "vc-tabs__bar");
const TabsList = styled(TabsListRoot, "vc-tabs__list");
const TabsTab = styled(TabsTabRoot, "vc-tabs__tab");
const TabsPanel = styled(TabsPanelRoot, "vc-tabs__panel");

export { Tabs, TabsBar, TabsList, TabsPanel, TabsTab };
export type { TabsProps };
