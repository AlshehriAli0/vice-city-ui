import {
  Combobox as ComboboxRoot,
  ComboboxChip as ComboboxChipRoot,
  ComboboxChipRemove as ComboboxChipRemoveRoot,
  ComboboxChips as ComboboxChipsRoot,
  ComboboxContent as ComboboxContentRoot,
  ComboboxEmpty as ComboboxEmptyRoot,
  ComboboxInput as ComboboxInputRoot,
  ComboboxItem as ComboboxItemRoot,
  ComboboxItemIcon as ComboboxItemIconRoot,
  ComboboxItemIndicator as ComboboxItemIndicatorRoot,
  ComboboxItemText as ComboboxItemTextRoot,
  ComboboxLabel as ComboboxLabelRoot,
  ComboboxList,
  ComboboxTrigger as ComboboxTriggerRoot,
  ComboboxValue,
} from "@ui-sdk/react/combobox"
import { createContext, use, useMemo, useState, type ComponentProps, type ReactElement, type Ref, type SVGProps } from "react"
import { cx, merge, POPUP_CLEARANCE, styled } from "./cx"
import { Check, ChevronDown, Close, Search } from "./icons"
import "./ui.css"
import "./select.css"
import "./combobox.css"

// The list lines up with the whole field, not just the input, so ComboboxControl lends itself as the anchor.
const AnchorContext = createContext<{ anchor: HTMLElement | null; setAnchor: (el: HTMLElement | null) => void } | null>(null)

function AnchoredCombobox(props: object): ReactElement {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const Root = ComboboxRoot as (props: object) => ReactElement
  return (
    <AnchorContext value={{ anchor, setAnchor }}>
      <Root {...props} />
    </AnchorContext>
  )
}

const Combobox = AnchoredCombobox as typeof ComboboxRoot

function ComboboxControl({ className, ref, ...props }: ComponentProps<"div">): ReactElement {
  const setAnchor = use(AnchorContext)?.setAnchor
  const joined = useMemo(() => joinRefs(ref, setAnchor), [ref, setAnchor])
  return <div {...props} ref={joined} className={cx("vc-control vc-combo", className)} />
}

function ComboboxContent({ className, ...props }: ComponentProps<typeof ComboboxContentRoot>): ReactElement {
  const anchor = use(AnchorContext)?.anchor
  return (
    <ComboboxContentRoot
      anchor={anchor}
      sideOffset={6}
      collisionPadding={POPUP_CLEARANCE}
      {...props}
      className={merge("vc-pop vc-select__list", className)}
    />
  )
}

function ComboboxSearchIcon({ className, ...props }: SVGProps<SVGSVGElement>): ReactElement {
  return <Search {...props} className={cx("vc-combo__search", className)} />
}

function ComboboxTrigger({ className, children, ...props }: ComponentProps<typeof ComboboxTriggerRoot>): ReactElement {
  return (
    <ComboboxTriggerRoot aria-label="Show options" {...props} className={merge("vc-combo__trigger", className)}>
      {children ?? <ChevronDown className="vc-chevron" />}
    </ComboboxTriggerRoot>
  )
}

function ComboboxChipRemove({ className, children, ...props }: ComponentProps<typeof ComboboxChipRemoveRoot>): ReactElement {
  return (
    <ComboboxChipRemoveRoot {...props} className={merge("vc-chip__remove", className)}>
      {children ?? <Close />}
    </ComboboxChipRemoveRoot>
  )
}

function ComboboxItemIndicator({ className, children, ...props }: ComponentProps<typeof ComboboxItemIndicatorRoot>): ReactElement {
  return (
    <ComboboxItemIndicatorRoot {...props} className={merge("vc-row__check", className)}>
      {children ?? <Check />}
    </ComboboxItemIndicatorRoot>
  )
}

const ComboboxLabel = styled(ComboboxLabelRoot, "vc-label")
const ComboboxInput = styled(ComboboxInputRoot, "vc-combo__input")
const ComboboxChips = styled(ComboboxChipsRoot, "vc-combo__chips")
const ComboboxChip = styled(ComboboxChipRoot, "vc-chip")
const ComboboxEmpty = styled(ComboboxEmptyRoot, "vc-empty")
const ComboboxItem = styled(ComboboxItemRoot, "vc-row")
const ComboboxItemIcon = styled(ComboboxItemIconRoot, "vc-row__icon")
const ComboboxItemText = styled(ComboboxItemTextRoot, "vc-row__text")

function joinRefs<T>(...refs: (Ref<T> | ((el: T | null) => void) | undefined)[]) {
  return (el: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(el)
      else if (ref) ref.current = el
    }
  }
}

export {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxControl,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIcon,
  ComboboxItemIndicator,
  ComboboxItemText,
  ComboboxLabel,
  ComboboxList,
  ComboboxSearchIcon,
  ComboboxTrigger,
  ComboboxValue,
}
