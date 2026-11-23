import {
  Toggle as ToggleRoot,
  ToggleGroup as ToggleGroupRoot,
  ToggleIcon as ToggleIconRoot,
} from "@ui-sdk/react/toggle";
import type { ComponentProps } from "react";

import { merge, styled } from "./cx";

import "./ui.css";
import "./toggle-group.css";

type ToggleGroupProps = ComponentProps<typeof ToggleGroupRoot> & { variant?: "tabs" | "tools" };

const ToggleGroup = ({ variant = "tabs", className, ...props }: ToggleGroupProps) => (
  <ToggleGroupRoot {...props} className={merge("vc-toggles", className)} data-variant={variant} />
);

const Toggle = styled(ToggleRoot, "vc-toggle");
const ToggleIcon = styled(ToggleIconRoot, "vc-toggle__icon");

export { Toggle, ToggleGroup, ToggleIcon };
export type { ToggleGroupProps };
