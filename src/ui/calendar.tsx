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
} from "@ui-sdk/react/calendar"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { createContext, use, type ComponentProps, type ReactElement } from "react"
import { cx, merge, styled } from "./cx"
import "./base.css"
import "./calendar.css"

type RootProps = ComponentProps<typeof CalendarRoot>
type ValueChangeDetails = Parameters<NonNullable<RootProps["onValueChange"]>>[1]

// In the default single mode the value is one ISO date or null, so a plain useState setter fits.
type SingleProps = Omit<RootProps, "mode" | "value" | "defaultValue" | "onValueChange"> & {
  mode?: "single"
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null, details: ValueChangeDetails) => void
}

// `marked` puts the pink tick under those days. Without children the calendar renders the
// pause-panel layout; `headingLevel` sets that layout's heading.
type ManyProps = RootProps & { mode: "multiple" | "range" }

type CalendarProps = (SingleProps | ManyProps) & { marked?: string[]; headingLevel?: 2 | 3 | 4 | 5 | 6 }

const MarkedContext = createContext<readonly string[]>([])

function Calendar({ marked = [], headingLevel = 2, className, children, fixedWeeks = true, ...props }: CalendarProps): ReactElement {
  const Heading = `h${headingLevel}` as const
  return (
    <MarkedContext value={marked}>
      <CalendarRoot {...(props as RootProps)} fixedWeeks={fixedWeeks} className={merge("vc-cal", className)}>
        {children ?? (
          <>
            <CalendarHeader>
              <CalendarHeading render={(headingProps) => <Heading {...headingProps} />} />
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
  )
}

function CalendarHeader({ className, ...props }: ComponentProps<"div">): ReactElement {
  return <div {...props} className={cx("vc-cal__head", className)} />
}

function CalendarNav({ className, ...props }: ComponentProps<"div">): ReactElement {
  return <div {...props} className={cx("vc-cal__navs", className)} />
}

function CalendarPrevious({ className, children, ...props }: ComponentProps<typeof CalendarPreviousRoot>): ReactElement {
  return (
    <CalendarPreviousRoot aria-label="Previous month" {...props} className={merge("vc-cal__nav", className)}>
      {children ?? <ChevronLeft />}
    </CalendarPreviousRoot>
  )
}

function CalendarNext({ className, children, ...props }: ComponentProps<typeof CalendarNextRoot>): ReactElement {
  return (
    <CalendarNextRoot aria-label="Next month" {...props} className={merge("vc-cal__nav", className)}>
      {children ?? <ChevronRight />}
    </CalendarNextRoot>
  )
}

function CalendarGrid({ className, children, ...props }: ComponentProps<typeof CalendarGridRoot>): ReactElement {
  return (
    <CalendarGridRoot {...props} className={merge("vc-cal__grid", className)}>
      {children ?? (
        <>
          <CalendarWeekdays />
          <CalendarWeeks />
        </>
      )}
    </CalendarGridRoot>
  )
}

type WeekdaysProps = Omit<ComponentProps<typeof CalendarWeekdaysRoot>, "children"> & Partial<Pick<ComponentProps<typeof CalendarWeekdaysRoot>, "children">>

function CalendarWeekdays({ children, ...props }: WeekdaysProps): ReactElement {
  return <CalendarWeekdaysRoot {...props}>{children ?? ((index) => <CalendarWeekday index={index} />)}</CalendarWeekdaysRoot>
}

type WeeksProps = Omit<ComponentProps<typeof CalendarWeeksRoot>, "children"> & Partial<Pick<ComponentProps<typeof CalendarWeeksRoot>, "children">>

function CalendarWeeks({ children, ...props }: WeeksProps): ReactElement {
  return <CalendarWeeksRoot {...props}>{children ?? ((cell) => <CalendarDay value={cell.date} />)}</CalendarWeeksRoot>
}

function CalendarDay({ className, ...props }: ComponentProps<typeof CalendarDayRoot>): ReactElement {
  const marked = use(MarkedContext).includes(props.value)
  return <CalendarDayRoot data-marked={marked || undefined} {...props} className={merge("vc-cal__day", className)} />
}

const CalendarHeading = styled(CalendarHeadingRoot, "vc-cal__heading")
const CalendarWeekday = styled(CalendarWeekdayRoot, "vc-cal__weekday")

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
}
export type { CalendarProps }
