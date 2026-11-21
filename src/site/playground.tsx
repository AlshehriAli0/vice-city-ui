import { RotateCcw } from "lucide-react";
import type { ReactElement } from "react";

import type { Control, Demo, Playground, Value, Values } from "../gallery/types";
import { Button } from "../ui/button";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { SegmentedControl, SegmentedControlItem } from "../ui/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Switch, SwitchState, SwitchThumb } from "../ui/switch";
import { CopyButton } from "./copy-button";
import { HighlightedCode } from "./highlighted-code";
import { usePlayground, type PlaygroundState } from "./playground-state";

function same(values: Values, preset: Values, defaults: Values = {}): boolean {
  return Object.entries({ ...defaults, ...preset }).every(([key, value]) => values[key] === value);
}

function ControlRow({
  control,
  value,
  set,
}: {
  control: Control;
  value: Value | undefined;
  set: Playground["set"];
}): ReactElement {
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
}

function Examples({ demo, state }: { demo: Demo; state: PlaygroundState }): ReactElement | null {
  const examples = demo.examples ?? [];
  const current = examples.find(example => same(state.values, example.values, demo.defaults))?.label ?? null;
  if (!examples.length && !demo.controls?.length) return null;
  return (
    <div className="pg-bar">
      {examples.length > 0 && (
        <SegmentedControl
          aria-label="Examples"
          size="sm"
          value={current}
          onValueChange={label => {
            const example = examples.find(item => item.label === label);
            if (example) state.apply(example.values);
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
        <Button className="pg-bar__reset" size="sm" variant="ghost" onClick={state.reset}>
          <RotateCcw aria-hidden="true" /> Reset
        </Button>
      ) : null}
    </div>
  );
}

function ControlsPanel({ demo, state }: { demo: Demo; state: PlaygroundState }): ReactElement | null {
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
}

function Usage({ demo, values }: { demo: Demo; values: Values }): ReactElement | null {
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
}

function PlaygroundView({ demo }: { demo: Demo }): ReactElement {
  const state = usePlayground(demo);
  return (
    <>
      <Examples demo={demo} state={state} />
      {demo.render(state)}
      <ControlsPanel demo={demo} state={state} />
    </>
  );
}

export { ControlsPanel, Examples, PlaygroundView, Usage };
