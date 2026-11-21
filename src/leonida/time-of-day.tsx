import { SegmentedControl, SegmentedControlItem } from "@ui-sdk/react/segmented-control";
import type { ComponentProps, ReactElement } from "react";

import { merge, styled } from "../ui/cx";

import "./time-of-day.css";

type Hour = "day" | "sunset" | "night";

const HOURS: { value: Hour; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "sunset", label: "Sunset" },
  { value: "night", label: "Night" },
];

const TimeOfDayItem = styled(SegmentedControlItem, "ld-tod__item");

function TimeOfDay({
  "aria-label": label = "Time of day",
  defaultValue = "sunset",
  className,
  children,
  ...props
}: ComponentProps<typeof SegmentedControl>): ReactElement {
  return (
    <SegmentedControl
      {...props}
      aria-label={label}
      defaultValue={props.value === undefined ? defaultValue : undefined}
      className={merge("ld-tod", className)}
    >
      {children ??
        HOURS.map(hour => (
          <TimeOfDayItem key={hour.value} value={hour.value}>
            {hour.label}
          </TimeOfDayItem>
        ))}
    </SegmentedControl>
  );
}

export { HOURS, TimeOfDay, TimeOfDayItem };
export type { Hour };
