import {
  createContext,
  use,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from "react";

import { cssVariables } from "../ui/css-variables";
import { cx } from "../ui/cx";

type RowEntry = { focus: () => void; el: () => HTMLElement | null; disabled?: boolean };

type ListContext = {
  active: string | null;
  setActive: (key: string) => void;
  register: (key: string, entry: RowEntry) => () => void;
};

const List = createContext<ListContext | null>(null);

const useList = (): ListContext => {
  "use memo";

  const list = use(List);
  if (!list) throw new Error("Settings rows go inside a SettingsList.");
  return list;
};

type SettingsListProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
};

const orderRows = (rows: Map<string, RowEntry>) =>
  [...rows].sort(([, a], [, b]) => {
    const [x, y] = [a.el(), b.el()];
    return x && y && x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
  });

const SettingsList = ({
  value,
  defaultValue = null,
  onValueChange,
  className,
  children,
  ...props
}: SettingsListProps) => {
  const [own, setOwn] = useState(defaultValue);
  const active = value === undefined ? own : value;
  const rows = useRef(new Map<string, RowEntry>());
  const view = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState(0);
  const [height, setHeight] = useState(0);
  const [shown, setShown] = useState(0);

  const register = useCallback((key: string, entry: RowEntry) => {
    rows.current.set(key, entry);
    return () => {
      if (rows.current.get(key) === entry) rows.current.delete(key);
    };
  }, []);
  const list = useMemo<ListContext>(
    () => ({
      active,
      register,
      setActive: key => {
        if (key === active) return;
        setOwn(key);
        onValueChange?.(key);
      },
    }),
    [active, onValueChange, register]
  );

  useLayoutEffect(() => {
    const total = content.current?.offsetHeight ?? 0;
    const window = view.current?.clientHeight ?? 0;
    setHeight(total);
    setShown(window);
    const order = orderRows(rows.current);
    const index = order.findIndex(([key]) => key === active);
    const row = index === -1 ? null : order[index][1].el();
    setScroll(current => {
      if (!row) return 0;
      const top = row.offsetTop;
      const pitch = row.offsetHeight;
      const max = Math.max(0, total - window);
      const low = top + pitch + Math.min(2 * pitch, total - top - pitch) - window;
      const high = index > 0 ? top - pitch : 0;
      return Math.min(max, Math.max(0, Math.max(low, Math.min(current, high))));
    });
  }, [active]);

  const onKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    event.stopPropagation();
    const order = orderRows(rows.current).filter(([, entry]) => !entry.disabled);
    const at = order.findIndex(([key]) => key === active);
    const next = order.at(Math.min(order.length - 1, Math.max(0, at + (event.key === "ArrowDown" ? 1 : -1))));
    next?.[1].focus();
  };

  const vars = cssVariables({ "--scroll": scroll, "--height": height, "--window": shown });
  return (
    <List value={list}>
      <div
        {...props}
        ref={view}
        className={cx("ld-set__view", className)}
        data-slot="settings-list"
        data-more-above={scroll > 0 || undefined}
        data-more-below={scroll < height - shown || undefined}
        style={vars}
        onKeyDownCapture={onKeyDownCapture}
      >
        <div ref={content} className="ld-set__rows">
          {children}
        </div>
      </div>
      {height > shown && <span className="ld-set__scrollbar" aria-hidden="true" style={vars} />}
    </List>
  );
};

export { SettingsList, useList };
export type { SettingsListProps };
