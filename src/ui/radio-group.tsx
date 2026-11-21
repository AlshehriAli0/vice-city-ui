import { Radio as RadioRoot, RadioGroup as RadioGroupRoot, RadioIndicator as RadioIndicatorRoot } from "@ui-sdk/react/radio"
import { createContext, use, useEffect, useId, useState, type ComponentProps, type ReactElement } from "react"
import { cx, merge, styled } from "./cx"
import "./ui.css"
import "./radio-group.css"

type RadioGroupProps = ComponentProps<typeof RadioGroupRoot> & { variant?: "stacked" | "inline" | "cards" }

function RadioGroup({ variant = "stacked", className, ...props }: RadioGroupProps): ReactElement {
  return <RadioGroupRoot {...props} className={merge("vc-radios", className)} data-variant={variant} />
}

// An item's title names its radio, and its description describes it; the wrapping label would fold both into the name.
type ItemContext = { id: string; described: boolean; setDescribed: (described: boolean) => void }

const RadioItemContext = createContext<ItemContext | null>(null)

function RadioItem({ className, ...props }: ComponentProps<"label">): ReactElement {
  const id = useId()
  const [described, setDescribed] = useState(false)
  return (
    <RadioItemContext value={{ id, described, setDescribed }}>
      <label {...props} className={cx("vc-radio-item", className)} />
    </RadioItemContext>
  )
}

function Radio({ className, ...props }: ComponentProps<typeof RadioRoot>): ReactElement {
  const item = use(RadioItemContext)
  return (
    <RadioRoot
      aria-labelledby={item ? `${item.id}-label` : undefined}
      aria-describedby={item?.described ? `${item.id}-hint` : undefined}
      {...props}
      className={merge("vc-radio", className)}
    />
  )
}

const RadioIndicator = styled(RadioIndicatorRoot, "vc-radio__dot")

function RadioItemText({ className, ...props }: ComponentProps<"span">): ReactElement {
  return <span {...props} className={cx("vc-radio-item__text", className)} />
}

function RadioItemLabel({ className, ...props }: ComponentProps<"span">): ReactElement {
  const item = use(RadioItemContext)
  return <span id={item ? `${item.id}-label` : undefined} {...props} className={cx("vc-radio-item__label", className)} />
}

function RadioItemDescription({ className, ...props }: ComponentProps<"span">): ReactElement {
  const item = use(RadioItemContext)
  const setDescribed = item?.setDescribed
  useEffect(() => {
    if (!setDescribed) return
    setDescribed(true)
    return () => setDescribed(false)
  }, [setDescribed])
  return <span id={item ? `${item.id}-hint` : undefined} {...props} className={cx("vc-radio-item__hint", className)} />
}

function RadioItemMeta({ className, ...props }: ComponentProps<"span">): ReactElement {
  return <span {...props} className={cx("vc-radio-item__meta", className)} />
}

function RadioItemMedia({ className, ...props }: ComponentProps<"span">): ReactElement {
  return <span aria-hidden="true" {...props} className={cx("vc-radio-item__media", className)} />
}

export { Radio, RadioGroup, RadioIndicator, RadioItem, RadioItemDescription, RadioItemLabel, RadioItemMedia, RadioItemMeta, RadioItemText }
export type { RadioGroupProps }
