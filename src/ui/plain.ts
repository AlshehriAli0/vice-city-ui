import { renderElement, type PartProps } from "@ui-sdk/react/primitive"
import type { JSX, ReactElement } from "react"
import { merge } from "./cx"

type Tag = keyof JSX.IntrinsicElements

// A part with no ui-sdk behavior behind it: a base class, a data-slot to style from, and ui-sdk's `render` prop.
function plain<T extends Tag>(tag: T, slot: string, base: string): (props: PartProps<T>) => ReactElement {
  function Plain({ render, className, ...props }: PartProps<T>): ReactElement {
    return renderElement(tag, { ...props, className: merge(base, className), "data-slot": slot }, render)
  }
  Plain.displayName = `Plain(${slot})`
  return Plain
}

export { plain }
