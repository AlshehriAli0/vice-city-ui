import { createElement, type ComponentType, type ReactElement } from "react";

type ClassName<S> = string | ((state: S) => string | undefined) | undefined;

function cx(base: string, extra?: string): string;
function cx<S>(base: string, extra: ClassName<S>): ClassName<S>;
function cx<S>(base: string, extra: ClassName<S>): ClassName<S> {
  if (typeof extra === "function") return (state: S) => `${base} ${extra(state) ?? ""}`.trim();
  return extra ? `${base} ${extra}` : base;
}

const merge = cx as <S>(base: string, extra: ClassName<S>) => ClassName<S>;

const styled = <P extends { className?: ClassName<never> }>(
  Component: ComponentType<P>,
  base: string
): ((props: P) => ReactElement) => {
  const Styled = (props: P): ReactElement => {
    "use memo";

    return createElement(Component, { ...props, className: merge(base, props.className) });
  };
  Styled.displayName = `Styled(${base})`;
  return Styled;
};

const POPUP_CLEARANCE = 72;

export { cx, merge, POPUP_CLEARANCE, styled };
