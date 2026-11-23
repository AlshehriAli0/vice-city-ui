import {
  Calendar as CalendarRoot,
  CalendarDay as CalendarDayRoot,
  CalendarGrid as CalendarGridRoot,
  CalendarHeading as CalendarHeadingRoot,
  CalendarNext as CalendarNextRoot,
  CalendarPrevious as CalendarPreviousRoot,
  CalendarWeekday as CalendarWeekdayRoot,
  CalendarWeekdays as CalendarWeekdaysRoot,
  CalendarWeeks as CalendarWeeksRoot,
} from "@ui-sdk/react/calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createContext, use, type ComponentProps } from "react";

import { cx, merge, styled } from "./cx";

import "./base.css";
import "./calendar.css";

type RootProps = ComponentProps<typeof CalendarRoot>;
type ValueChangeDetails = Parameters<NonNullable<RootProps["onValueChange"]>>[1];

type SingleProps = Omit<RootProps, "mode" | "value" | "defaultValue" | "onValueChange"> & {
  mode?: "single";
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null, details: ValueChangeDetails) => void;
};

type ManyProps = RootProps & { mode: "multiple" | "range" };

type CalendarProps = (SingleProps | ManyProps) & { marked?: string[]; headingLevel?: 2 | 3 | 4 | 5 | 6 };

const MarkedContext = createContext<readonly string[]>([]);

const Calendar = ({
  marked = [],
  headingLevel = 2,
  className,
  children,
  fixedWeeks = true,
  ...props
}: CalendarProps) => {
  const Heading = `h${headingLevel}` as const;
  const onValueChange: RootProps["onValueChange"] =
    props.mode === "multiple" || props.mode === "range"
      ? props.onValueChange
      : (value, details) => {
          if (value === null || typeof value === "string") props.onValueChange?.(value, details);
        };

  return (
    <MarkedContext value={marked}>
      <CalendarRoot
        {...props}
        onValueChange={onValueChange}
        fixedWeeks={fixedWeeks}
        className={merge("vc-cal", className)}
      >
        {children ?? (
          <>
            <CalendarHeader>
              <CalendarHeading render={headingProps => <Heading {...headingProps} />} />
              <CalendarNav>
                <CalendarPrevious />
                <CalendarNext />
              </CalendarNav>
            </CalendarHeader>
            <CalendarGrid />
          </>
        )}
      </CalendarRoot>
    </MarkedContext>
  );
};

const CalendarHeader = ({ className, ...props }: ComponentProps<"div">) => (
  <div {...props} className={cx("vc-cal__head", className)} />
);

const CalendarNav = ({ className, ...props }: ComponentProps<"div">) => (
  <div {...props} className={cx("vc-cal__navs", className)} />
);

const CalendarPrevious = ({ className, children, ...props }: ComponentProps<typeof CalendarPreviousRoot>) => (
  <CalendarPreviousRoot aria-label="Previous month" {...props} className={merge("vc-cal__nav", className)}>
    {children ?? <ChevronLeft />}
  </CalendarPreviousRoot>
);

const CalendarNext = ({ className, children, ...props }: ComponentProps<typeof CalendarNextRoot>) => (
  <CalendarNextRoot aria-label="Next month" {...props} className={merge("vc-cal__nav", className)}>
    {children ?? <ChevronRight />}
  </CalendarNextRoot>
);

const CalendarGrid = ({ className, children, ...props }: ComponentProps<typeof CalendarGridRoot>) => (
  <CalendarGridRoot {...props} className={merge("vc-cal__grid", className)}>
    {children ?? (
      <>
        <CalendarWeekdays />
        <CalendarWeeks />
      </>
    )}
  </CalendarGridRoot>
);

type WeekdaysProps = Omit<ComponentProps<typeof CalendarWeekdaysRoot>, "children"> &
  Partial<Pick<ComponentProps<typeof CalendarWeekdaysRoot>, "children">>;

const CalendarWeekdays = ({ children, ...props }: WeekdaysProps) => (
  <CalendarWeekdaysRoot {...props}>{children ?? (index => <CalendarWeekday index={index} />)}</CalendarWeekdaysRoot>
);

type WeeksProps = Omit<ComponentProps<typeof CalendarWeeksRoot>, "children"> &
  Partial<Pick<ComponentProps<typeof CalendarWeeksRoot>, "children">>;

const CalendarWeeks = ({ children, ...props }: WeeksProps) => (
  <CalendarWeeksRoot {...props}>{children ?? (cell => <CalendarDay value={cell.date} />)}</CalendarWeeksRoot>
);

const CalendarDay = ({ className, ...props }: ComponentProps<typeof CalendarDayRoot>) => {
  const marked = use(MarkedContext).includes(props.value);
  return <CalendarDayRoot data-marked={marked || undefined} {...props} className={merge("vc-cal__day", className)} />;
};

const CalendarHeading = styled(CalendarHeadingRoot, "vc-cal__heading");
const CalendarWeekday = styled(CalendarWeekdayRoot, "vc-cal__weekday");

export {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeader,
  CalendarHeading,
  CalendarNav,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
};
export type { CalendarProps };
