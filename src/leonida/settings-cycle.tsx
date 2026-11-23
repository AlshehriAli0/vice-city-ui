import { Button } from "@ui-sdk/react/button";
import {
  createSegmentedControlController,
  SegmentedControl,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import { useId, useState } from "react";

import { cx } from "../ui/cx";
import { useFocus, useRow, type RowProps } from "./use-settings-row";

const Chevron = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 10 16" width="10" height="16" aria-hidden="true">
    <path d={flip ? "M2 2l6 6-6 6" : "M8 2L2 8l6 6"} />
  </svg>
);

type CycleProps = RowProps & {
  options: string[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

const SettingsCycle = ({
  id,
  label,
  disabled,
  options,
  value,
  defaultValue,
  onValueChange,
  className,
  style,
}: CycleProps) => {
  const labelId = useId();
  const [control] = useState(() => createSegmentedControlController());
  const [own, setOwn] = useState(defaultValue ?? options[0]);
  const current = value ?? own;
  const at = options.indexOf(current);
  const row = useRow(id, useFocus(control), disabled);
  const step = (by: number, event: MouseEvent) =>
    control.setValue(options[(at + by + options.length) % options.length], { reason: "item-press", event });
  return (
    <div
      {...row}
      className={cx("ld-set__row", className)}
      data-kind="cycle"
      data-disabled={disabled ? true : undefined}
      style={style}
    >
      <span className="ld-set__label" id={labelId}>
        {label}
      </span>
      <SegmentedControl
        className="ld-set__cycle"
        aria-labelledby={labelId}
        controller={control}
        value={current}
        disabled={disabled}
        onValueChange={next => {
          if (!next) return;
          setOwn(next);
          onValueChange?.(next);
        }}
      >
        {options.map(option => (
          <SegmentedControlItem key={option} value={option} className="ld-set__option">
            {option}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
      <span className="ld-set__index" aria-hidden="true">
        <b>{at + 1}</b>
        <i>/</i>
        <span>{options.length}</span>
      </span>
      <span className="ld-set__chevrons" aria-hidden="true">
        <Button
          render={<span />}
          tabIndex={-1}
          aria-label={`Previous ${label} option`}
          onClick={event => step(-1, event.nativeEvent)}
        >
          <Chevron />
        </Button>
        <Button
          render={<span />}
          tabIndex={-1}
          aria-label={`Next ${label} option`}
          onClick={event => step(1, event.nativeEvent)}
        >
          <Chevron flip />
        </Button>
      </span>
    </div>
  );
};

export { SettingsCycle };
