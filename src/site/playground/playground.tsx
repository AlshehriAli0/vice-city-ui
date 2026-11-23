import { RotateCcw } from "lucide-react";

import type { Control, Demo, Playground, Value, Values } from "../../gallery/demo";
import { Button } from "../../ui/forms/button";
import { Field, FieldLabel } from "../../ui/forms/field";
import { Input } from "../../ui/forms/input";
import { SegmentedControl, SegmentedControlItem } from "../../ui/forms/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from "../../ui/forms/select";
import { Slider } from "../../ui/forms/slider";
import { Switch, SwitchState, SwitchThumb } from "../../ui/forms/switch";
import { CopyButton } from "../code/copy-button";
import { HighlightedCode } from "../code/highlighted-code";
import type { PlaygroundState } from "./playground-state";

const same = (values: Values, preset: Values, defaults: Values = {}): boolean =>
  Object.entries({ ...defaults, ...preset }).every(([key, value]) => values[key] === value);

const ControlRow = ({
  control,
  value,
  set,
}: {
  control: Control;
  value: Value | undefined;
  set: Playground["set"];
}) => {
  if (control.type === "boolean")
    return (
      <Field>
        <FieldLabel>{control.label}</FieldLabel>
        <SwitchState />
        <Switch checked={Boolean(value)} onCheckedChange={on => set(control.name, on)}>
          <SwitchThumb />
        </Switch>
      </Field>
    );
  if (control.type === "number")
    return (
      <Field>
        <FieldLabel>{control.label}</FieldLabel>
        <Slider
          min={control.min}
          max={control.max}
          step={control.step ?? 1}
          value={Number(value ?? control.min)}
          onValueChange={next => {
            if (typeof next === "number") set(control.name, next);
          }}
          thumbLabels={[control.label]}
        />
      </Field>
    );
  if (control.type === "text")
    return (
      <Field>
        <FieldLabel>{control.label}</FieldLabel>
        <Input value={String(value ?? "")} onValueChange={next => set(control.name, next)} />
      </Field>
    );
  if (control.options.length <= 4)
    return (
      <Field>
        <FieldLabel>{control.label}</FieldLabel>
        <SegmentedControl
          aria-label={control.label}
          size="sm"
          value={String(value)}
          onValueChange={next => next != null && set(control.name, next)}
        >
          {control.options.map(option => (
            <SegmentedControlItem key={option.value} value={option.value}>
              {option.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </Field>
    );
  return (
    <Field>
      <FieldLabel>{control.label}</FieldLabel>
      <Select value={String(value)} onValueChange={next => next != null && set(control.name, next)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {control.options.map(option => (
            <SelectItem key={option.value} value={option.value} label={option.label}>
              <SelectItemText>{option.label}</SelectItemText>
              <SelectItemIndicator />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
};

const Examples = ({
  demo,
  values,
  apply,
  reset,
}: { demo: Demo } & Pick<PlaygroundState, "values" | "apply" | "reset">) => {
  const examples = demo.examples;
  const current = examples?.find(example => same(values, example.values, demo.defaults))?.label ?? null;
  if (!examples?.length && !demo.controls?.length) return null;
  return (
    <div className="pg-bar">
      {examples && examples.length > 0 && (
        <SegmentedControl
          aria-label="Examples"
          size="sm"
          value={current}
          onValueChange={label => {
            const example = examples.find(item => item.label === label);
            if (example) apply(example.values);
          }}
        >
          {examples.map(example => (
            <SegmentedControlItem key={example.label} value={example.label}>
              {example.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      )}
      {demo.controls?.length ? (
        <Button className="pg-bar__reset" size="sm" variant="ghost" onClick={reset}>
          <RotateCcw aria-hidden="true" /> Reset
        </Button>
      ) : null}
    </div>
  );
};

const ControlsPanel = ({ demo, state }: { demo: Demo; state: PlaygroundState }) => {
  if (!demo.controls?.length && !demo.actions?.length) return null;
  return (
    <section className="pg-panel" aria-labelledby="pg-title">
      <h2 id="pg-title">Controls</h2>
      {demo.controls?.length ? (
        <div className="pg-panel__rows">
          {demo.controls.map(control => (
            <ControlRow key={control.name} control={control} value={state.values[control.name]} set={state.set} />
          ))}
        </div>
      ) : null}
      {demo.actions?.length ? (
        <div className="pg-panel__actions" role="group" aria-label="Actions">
          {demo.actions.map(action => (
            <Button key={action.name} size="sm" variant="secondary" onClick={() => state.fire(action.name)}>
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}
    </section>
  );
};

const Usage = ({ demo, values }: { demo: Demo; values: Values }) => {
  const code = demo.code?.(values);
  if (!code) return null;
  return (
    <section className="pg-code" aria-labelledby="pg-code-title">
      <div className="pg-code__head">
        <h2 id="pg-code-title">Usage</h2>
        <CopyButton text={code} />
      </div>
      <pre className="code">
        <HighlightedCode text={code} />
      </pre>
    </section>
  );
};

export { ControlsPanel, Examples, Usage };
