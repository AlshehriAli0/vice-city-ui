import { useFieldControl } from "@ui-sdk/react/field";
import { createParts, usePart, usePrimitive, type PartProps } from "@ui-sdk/react/primitive";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";

import { merge } from "./cx";
import { cycle, type CycleOptions, type CycleValueChangeReason } from "./cycle.primitive";

import "./ui.css";
import "./cycle.css";

const parts = createParts(cycle, { value: "button", previous: "span", next: "span", count: "span", input: "input" });

type CycleProps = CycleOptions & Omit<PartProps<"div">, "defaultValue" | "onChange">;

const Cycle = ({ value, defaultValue, onValueChange, disabled, name, className, children, ...props }: CycleProps) => {
  const field = useFieldControl();
  const handle = usePrimitive(cycle, {
    value,
    defaultValue,
    onValueChange,
    disabled: disabled ?? field?.disabled,
    name: name ?? field?.name,
  });
  return usePart(
    handle,
    "root",
    {},
    {
      ...props,
      className: merge("vc-cycle", className),
      children: (
        <>
          {children}
          <parts.Input />
        </>
      ),
    },
    "div"
  );
};

const CycleValue = ({ className, ...props }: ComponentProps<typeof parts.Value>) => (
  <parts.Value {...props} className={merge("vc-cycle__value", className)} />
);

const CycleCount = ({ className, children, ...props }: ComponentProps<typeof parts.Count>) => (
  <parts.Count {...props} className={merge("vc-cycle__count", className)}>
    {children ??
      (({ index, total }) => (
        <>
          {index}
          <i>/</i>
          <i>{total}</i>
        </>
      ))}
  </parts.Count>
);

const CyclePrevious = ({ className, children, ...props }: ComponentProps<typeof parts.Previous>) => (
  <parts.Previous {...props} className={merge("vc-cycle__arrow", className)}>
    {children ?? <ChevronLeft />}
  </parts.Previous>
);

const CycleNext = ({ className, children, ...props }: ComponentProps<typeof parts.Next>) => (
  <parts.Next {...props} className={merge("vc-cycle__arrow", className)}>
    {children ?? <ChevronRight />}
  </parts.Next>
);

export { Cycle, CycleCount, CycleNext, CyclePrevious, CycleValue };
export type { CycleOptions, CycleProps, CycleValueChangeReason };
