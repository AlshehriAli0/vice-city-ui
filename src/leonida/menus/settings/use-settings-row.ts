import { useCallback, useLayoutEffect, useMemo, useRef, type CSSProperties } from "react";

import { useList } from "./settings-list";

type RowProps = { id: string; label: string; disabled?: boolean; className?: string; style?: CSSProperties };

const useFocus = (control: { focus: () => void }): (() => void) => useMemo(() => () => control.focus(), [control]);

const useRow = (key: string, focus: () => void, disabled?: boolean) => {
  const list = useList();
  const el = useRef<HTMLElement | null>(null);
  const ref = useCallback((node: HTMLElement | null) => {
    el.current = node;
  }, []);
  const { register, setActive } = list;
  useLayoutEffect(() => register(key, { focus, el: () => el.current, disabled }), [register, key, focus, disabled]);
  return {
    ref,
    "data-slot": "settings-row",
    "data-key": key,
    "data-active": list.active === key || undefined,
    onFocus: () => setActive(key),
    onPointerEnter: () => setActive(key),
  };
};

export { useFocus, useRow };
export type { RowProps };
