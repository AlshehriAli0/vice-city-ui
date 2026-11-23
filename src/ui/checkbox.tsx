import {
  Checkbox as CheckboxRoot,
  CheckboxGroup as CheckboxGroupRoot,
  CheckboxIndicator as CheckboxIndicatorRoot,
} from "@ui-sdk/react/checkbox";
import { Label } from "@ui-sdk/react/label";
import type { ComponentProps } from "react";

import { merge, styled } from "./cx";
import { Check, Minus } from "./icons";

import "./ui.css";
import "./checkbox.css";

const Checkbox = styled(CheckboxRoot, "vc-check");
const CheckboxGroup = styled(CheckboxGroupRoot, "vc-check-group");

const CheckboxIndicator = ({ className, children, ...props }: ComponentProps<typeof CheckboxIndicatorRoot>) => (
  <CheckboxIndicatorRoot {...props} className={merge("vc-check__mark", className)}>
    {children ?? (state => (state.indeterminate ? <Minus /> : <Check />))}
  </CheckboxIndicatorRoot>
);

const CheckboxLabel = styled(Label, "vc-choice");

export { Checkbox, CheckboxGroup, CheckboxIndicator, CheckboxLabel };
