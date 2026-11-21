import { createRadioGroupController, Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio";
import {
  createSliderController,
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@ui-sdk/react/slider";
import { createSwitchController, Switch, SwitchThumb } from "@ui-sdk/react/switch";
import {
  createContext,
  use,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

import { cx } from "../ui/cx";
import { useFocus, useRow, type RowProps } from "./use-settings-row";

type SwitchRowProps = RowProps & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

function SettingsSwitch({
  id,
  label,
  disabled,
  checked,
  defaultChecked = false,
  onCheckedChange,
  className,
  style,
}: SwitchRowProps): ReactElement {
  const labelId = useId();
  const [control] = useState(createSwitchController);
  const [own, setOwn] = useState(defaultChecked);
  const on = checked ?? own;
  const row = useRow(id, useFocus(control), disabled);
  return (
    <div
      {...row}
      className={cx("ld-set__row", className)}
      data-kind="toggle"
      data-disabled={disabled ? true : undefined}
      style={style}
    >
      <span className="ld-set__label" id={labelId}>
        {label}
      </span>
      <span className="ld-set__state" aria-hidden="true">
        {on ? "On" : "Off"}
      </span>
      <Switch
        className="ld-set__switch"
        aria-labelledby={labelId}
        controller={control}
        checked={on}
        disabled={disabled}
        onCheckedChange={next => {
          setOwn(next);
          onCheckedChange?.(next);
        }}
        onKeyDown={event => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          control.toggle({ reason: "press", event: event.nativeEvent });
        }}
      >
        <SwitchThumb className="ld-set__knob" />
      </Switch>
    </div>
  );
}

type SliderRowProps = RowProps & {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
};

function SettingsSlider({
  id,
  label,
  disabled,
  value,
  defaultValue,
  min = 0,
  max = 10,
  onValueChange,
  className,
  style,
}: SliderRowProps): ReactElement {
  const labelId = useId();
  const [control] = useState(() => createSliderController());
  const [own, setOwn] = useState(defaultValue ?? min);
  const current = value ?? own;
  const row = useRow(id, useFocus(control), disabled);
  return (
    <div
      {...row}
      className={cx("ld-set__row", className)}
      data-kind="slider"
      data-disabled={disabled ? true : undefined}
      style={style}
    >
      <span className="ld-set__label" id={labelId}>
        {label}
      </span>
      <Slider
        className="ld-set__slider"
        aria-labelledby={labelId}
        controller={control}
        value={current}
        min={min}
        max={max}
        disabled={disabled}
        onValueChange={next => {
          const number = Array.isArray(next) ? next[0] : next;
          setOwn(number);
          onValueChange?.(number);
        }}
      >
        <SliderControl className="ld-set__slider-control">
          <SliderTrack className="ld-set__track">
            <SliderIndicator className="ld-set__fill" />
            <SliderThumb className="ld-set__thumb" aria-labelledby={labelId} />
          </SliderTrack>
        </SliderControl>
      </Slider>
      <span className="ld-set__number" aria-hidden="true">
        {current}
      </span>
    </div>
  );
}

type RadioGroupRowsProps = {
  id: string;
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
};

const Group = createContext<string>("");

function SettingsRadioGroup({
  id,
  label,
  value,
  defaultValue,
  onValueChange,
  children,
}: RadioGroupRowsProps): ReactElement {
  const [group] = useState(() => createRadioGroupController());
  return (
    <Group value={id}>
      <RadioGroup
        aria-label={label}
        controller={group}
        value={value}
        defaultValue={defaultValue}
        onValueChange={next => next && onValueChange?.(next)}
      >
        {children}
      </RadioGroup>
    </Group>
  );
}

type RadioRowProps = { value: string; children: ReactNode; className?: string; style?: CSSProperties };

function SettingsRadio({ value, children, className, style }: RadioRowProps): ReactElement {
  const group = use(Group);
  const radio = useRef<HTMLButtonElement>(null);
  const focus = useMemo(() => () => radio.current?.focus(), []);
  const row = useRow(`${group}:${value}`, focus);
  return (
    <label {...row} className={cx("ld-set__row", className)} data-kind="radio" style={style}>
      <span className="ld-set__label">{children}</span>
      <Radio ref={radio} className="ld-set__radio" value={value}>
        <RadioIndicator className="ld-set__dot" />
      </Radio>
    </label>
  );
}

function SettingsSection({
  title,
  children,
  style,
}: {
  title: string;
  children: ReactNode;
  style?: CSSProperties;
}): ReactElement {
  return (
    <section data-slot="settings-section">
      <h3 className="ld-set__heading" style={style}>
        {title}
      </h3>
      {children}
    </section>
  );
}

export { SettingsRadio, SettingsRadioGroup, SettingsSection, SettingsSlider, SettingsSwitch };
