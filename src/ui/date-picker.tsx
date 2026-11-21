import {
  DatePicker as DatePickerRoot,
  DatePickerContent as DatePickerContentRoot,
  DatePickerInput as DatePickerInputRoot,
  DatePickerTrigger as DatePickerTriggerRoot,
} from "@ui-sdk/react/date-picker";
import type { ComponentProps, ReactElement } from "react";

import { CalendarGrid, CalendarHeader, CalendarHeading, CalendarNext, CalendarPrevious } from "./calendar";
import { cx, merge, POPUP_CLEARANCE, styled } from "./cx";
import { Calendar } from "./icons";

import "./ui.css";
import "./calendar.css";
import "./date-picker.css";

function DatePicker({ className, children, ...props }: ComponentProps<typeof DatePickerRoot>): ReactElement {
  return (
    <DatePickerRoot {...props} className={merge("vc-date", className)}>
      {children ?? (
        <>
          <DatePickerControl>
            <DatePickerInput />
            <DatePickerTrigger />
          </DatePickerControl>
          <DatePickerContent />
        </>
      )}
    </DatePickerRoot>
  );
}

function DatePickerControl({ className, ...props }: ComponentProps<"div">): ReactElement {
  return <div {...props} className={cx("vc-control vc-date__field", className)} />;
}

function DatePickerTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof DatePickerTriggerRoot>): ReactElement {
  return (
    <DatePickerTriggerRoot {...props} className={merge("vc-date__trigger", className)}>
      {children ?? <Calendar />}
    </DatePickerTriggerRoot>
  );
}

function DatePickerContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DatePickerContentRoot>): ReactElement {
  return (
    <DatePickerContentRoot
      sideOffset={8}
      collisionPadding={POPUP_CLEARANCE}
      {...props}
      className={merge("vc-pop vc-cal", className)}
    >
      {children ?? (
        <>
          <CalendarHeader>
            <CalendarPrevious />
            <CalendarHeading />
            <CalendarNext />
          </CalendarHeader>
          <CalendarGrid />
        </>
      )}
    </DatePickerContentRoot>
  );
}

const DatePickerInput = styled(DatePickerInputRoot, "vc-date__input");

export { DatePicker, DatePickerContent, DatePickerControl, DatePickerInput, DatePickerTrigger };
