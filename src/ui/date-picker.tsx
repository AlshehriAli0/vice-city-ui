import {
  DatePicker as DatePickerRoot,
  DatePickerContent as DatePickerContentRoot,
  DatePickerInput as DatePickerInputRoot,
  DatePickerTrigger as DatePickerTriggerRoot,
} from "@ui-sdk/react/date-picker";
import type { ComponentProps } from "react";

import { CalendarGrid, CalendarHeader, CalendarHeading, CalendarNav, CalendarNext, CalendarPrevious } from "./calendar";
import { cx, merge, POPUP_CLEARANCE, styled } from "./cx";
import { Calendar } from "./icons";

import "./ui.css";
import "./calendar.css";
import "./date-picker.css";

const DatePicker = ({ className, children, ...props }: ComponentProps<typeof DatePickerRoot>) => (
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

const DatePickerControl = ({ className, ...props }: ComponentProps<"div">) => (
  <div {...props} className={cx("vc-control vc-date__field", className)} />
);

const DatePickerTrigger = ({ className, children, ...props }: ComponentProps<typeof DatePickerTriggerRoot>) => (
  <DatePickerTriggerRoot {...props} className={merge("vc-date__trigger", className)}>
    {children ?? <Calendar />}
  </DatePickerTriggerRoot>
);

const DatePickerContent = ({ className, children, ...props }: ComponentProps<typeof DatePickerContentRoot>) => (
  <DatePickerContentRoot
    sideOffset={8}
    collisionPadding={POPUP_CLEARANCE}
    {...props}
    className={merge("vc-pop vc-cal", className)}
  >
    {children ?? (
      <>
        <CalendarHeader>
          <CalendarHeading />
          <CalendarNav>
            <CalendarPrevious />
            <CalendarNext />
          </CalendarNav>
        </CalendarHeader>
        <CalendarGrid />
      </>
    )}
  </DatePickerContentRoot>
);

const DatePickerInput = styled(DatePickerInputRoot, "vc-date__input");

export { DatePicker, DatePickerContent, DatePickerControl, DatePickerInput, DatePickerTrigger };
