import { createElement, type ComponentType } from "react";

type ClassName<S> = string | ((state: S) => string | undefined) | undefined;

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

const merge = <S>(base: string, extra: ClassName<S>): ClassName<S> => {
  if (typeof extra === "function") return (state: S) => `${base} ${extra(state) ?? ""}`.trim();
  return cx(base, extra);
};

const styled = <P extends { className?: ClassName<never> }>(Component: ComponentType<P>, base: string) => {
  const Styled = (props: P) => {
    "use memo";

    return createElement(Component, { ...props, className: merge(base, props.className) });
  };
  Styled.displayName = `Styled(${base})`;
  return Styled;
};

const POPUP_CLEARANCE = 72;

export { cx, merge, POPUP_CLEARANCE, styled };
