import { createElement, type ComponentType, type ReactElement } from "react"

type ClassName<S> = string | ((state: S) => string | undefined) | undefined

function cx(base: string, extra?: string): string
function cx<S>(base: string, extra: ClassName<S>): ClassName<S>
function cx<S>(base: string, extra: ClassName<S>): ClassName<S> {
  if (typeof extra === "function") return (state: S) => `${base} ${extra(state) ?? ""}`.trim()
  return extra ? `${base} ${extra}` : base
}

const merge = cx as <S>(base: string, extra: ClassName<S>) => ClassName<S>

// Shared by both kit halves: wraps a ui-sdk part so it always carries a base class.
function styled<P extends { className?: unknown }>(Component: ComponentType<P>, base: string): (props: P) => ReactElement {
  function Styled(props: P): ReactElement {
    return createElement(Component, { ...props, className: merge(base, props.className as ClassName<unknown>) })
  }
  Styled.displayName = `Styled(${base})`
  return Styled
}

// Popups keep clear of the 60px sticky site header.
const POPUP_CLEARANCE = 72

export { cx, merge, POPUP_CLEARANCE, styled }
