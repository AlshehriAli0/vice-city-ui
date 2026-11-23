import {
  NumberInput as NumberInputRoot,
  NumberInputControl as NumberInputControlRoot,
  NumberInputDecrement as NumberInputDecrementRoot,
  NumberInputGroup as NumberInputGroupRoot,
  NumberInputIncrement as NumberInputIncrementRoot,
} from "@ui-sdk/react/number-input";
import type { ComponentProps } from "react";

import { merge, styled } from "./cx";
import { Minus, Plus } from "./icons";

import "./ui.css";
import "./number-input.css";

const NumberInput = styled(NumberInputRoot, "vc-number");
const NumberInputControl = styled(NumberInputControlRoot, "vc-number__input");

type NumberInputGroupProps = ComponentProps<typeof NumberInputGroupRoot> & { size?: "sm" | "md" | "lg" };

const NumberInputGroup = ({ size, className, ...props }: NumberInputGroupProps) => (
  <NumberInputGroupRoot {...props} className={merge("vc-control vc-number__group", className)} data-size={size} />
);

const NumberInputDecrement = ({ className, children, ...props }: ComponentProps<typeof NumberInputDecrementRoot>) => (
  <NumberInputDecrementRoot aria-label="Decrease" {...props} className={merge("vc-number__step", className)}>
    {children ?? <Minus width={14} height={14} />}
  </NumberInputDecrementRoot>
);

const NumberInputIncrement = ({ className, children, ...props }: ComponentProps<typeof NumberInputIncrementRoot>) => (
  <NumberInputIncrementRoot aria-label="Increase" {...props} className={merge("vc-number__step", className)}>
    {children ?? <Plus width={14} height={14} />}
  </NumberInputIncrementRoot>
);

export { NumberInput, NumberInputControl, NumberInputDecrement, NumberInputGroup, NumberInputIncrement };
export type { NumberInputGroupProps };
