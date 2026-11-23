import { lazy, useState } from "react";

import { Field, FieldDescription, FieldLabel, FieldList } from "../../ui/forms/field";
import {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from "../../ui/forms/number-input";
import { OTPInput, OTPInputGroup, OTPInputSeparator, OTPInputSlot } from "../../ui/forms/otp-input";
import { SegmentedControl, SegmentedControlItem } from "../../ui/forms/segmented-control";
import { Toggle, ToggleGroup } from "../../ui/forms/toggle-group";
import type { Demo, Playground } from "../demo";
import { optionValue, options as labeledOptions } from "../shared/options";
import { str, flag } from "./options";
import { FormStage } from "./stage";

const DatePicker = lazy(() => import("../../ui/forms/date-picker").then(module => ({ default: module.DatePicker })));

const ENTRY_KINDS = [
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "code", label: "Code" },
];

const CodeInput = ({ digits }: { digits: number }) => {
  const [code, setCode] = useState("");
  const half = Math.ceil(digits / 2);
  const slots = (from: number, to: number) =>
    Array.from({ length: to - from }, (_, index) => <OTPInputSlot key={from + index} index={from + index} />);
  return (
    <>
      <OTPInput maxLength={digits} value={code} onValueChange={setCode}>
        <OTPInputGroup>{slots(0, half)}</OTPInputGroup>
        <OTPInputSeparator />
        <OTPInputGroup>{slots(half, digits)}</OTPInputGroup>
      </OTPInput>
      <FieldDescription>
        {code.length === digits ? "Code accepted." : "Sent to your email. Paste works."}
      </FieldDescription>
    </>
  );
};

const EntryControl = ({ values: v }: Pick<Playground, "values">) => {
  if (v.kind === "date") return <DatePicker defaultValue="2000-01-01" />;

  const digits = Number(v.digits);
  if (v.kind === "code") return <CodeInput key={digits} digits={digits} />;

  const step = Number(v.step);
  return (
    <NumberInput key={step} defaultValue={70} min={50} max={90} step={step}>
      <NumberInputGroup>
        <NumberInputDecrement />
        <NumberInputControl />
        <NumberInputIncrement />
      </NumberInputGroup>
    </NumberInput>
  );
};

const EntryDemo = ({ values: v }: Playground) => (
  <FormStage>
    <FieldList>
      <Field disabled={Boolean(v.disabled)}>
        <FieldLabel>{String(v.label)}</FieldLabel>
        <EntryControl values={v} />
      </Field>
    </FieldList>
  </FormStage>
);

const entryControlCode = (v: Playground["values"]): string => {
  if (v.kind === "date") return `  <DatePicker defaultValue="2000-01-01" />`;

  if (v.kind === "code") {
    const digits = Number(v.digits);
    const half = Math.ceil(digits / 2);
    const slots = (from: number, to: number) =>
      Array.from({ length: to - from }, (_, index) => `<OTPInputSlot index={${from + index}} />`).join(" ");
    return `  <OTPInput maxLength={${digits}} value={code} onValueChange={setCode}>
    <OTPInputGroup>${slots(0, half)}</OTPInputGroup>
    <OTPInputSeparator />
    <OTPInputGroup>${slots(half, digits)}</OTPInputGroup>
  </OTPInput>`;
  }

  return `  <NumberInput defaultValue={70} min={50} max={90} step={${v.step}}>
    <NumberInputGroup>
      <NumberInputDecrement />
      <NumberInputControl />
      <NumberInputIncrement />
    </NumberInputGroup>
  </NumberInput>`;
};

const entryCode = (v: Playground["values"]): string => `<Field${flag("disabled", v.disabled)}>
  <FieldLabel>${v.label}</FieldLabel>
${entryControlCode(v)}
</Field>`;

const SEGMENT_SIZES = labeledOptions(["sm", "Small"], ["md", "Medium"]);

const TABS = ["Gameplay", "Display", "UI", "Camera", "Audio"];

const TogglesDemo = ({ values: v }: Playground) => {
  const disabled = Boolean(v.disabled);
  if (v.kind === "segmented")
    return (
      <FormStage center>
        <SegmentedControl
          aria-label="Map view"
          size={optionValue(v.size, SEGMENT_SIZES)}
          disabled={disabled}
          defaultValue="3d"
        >
          <SegmentedControlItem value="3d">3D view</SegmentedControlItem>
          <SegmentedControlItem value="2d">2D view</SegmentedControlItem>
        </SegmentedControl>
      </FormStage>
    );
  return (
    <FormStage center>
      <ToggleGroup
        key={String(v.multiple)}
        aria-label="Settings tab"
        multiple={Boolean(v.multiple)}
        disabled={disabled}
        defaultValue={["ui"]}
      >
        {TABS.map(label => (
          <Toggle key={label} value={label.toLowerCase()}>
            {label}
          </Toggle>
        ))}
      </ToggleGroup>
    </FormStage>
  );
};

const togglesCode = (v: Playground["values"]): string => {
  if (v.kind === "segmented")
    return `<SegmentedControl aria-label="Map view"${str("size", v.size, "md")}${flag("disabled", v.disabled)} defaultValue="3d">
  <SegmentedControlItem value="3d">3D view</SegmentedControlItem>
  <SegmentedControlItem value="2d">2D view</SegmentedControlItem>
</SegmentedControl>`;
  return `<ToggleGroup aria-label="Settings tab"${flag("multiple", v.multiple)}${flag("disabled", v.disabled)} defaultValue={["ui"]}>
${TABS.map(label => `  <Toggle value="${label.toLowerCase()}">${label}</Toggle>`).join("\n")}
</ToggleGroup>`;
};

const formEntryDemos: Demo[] = [
  {
    id: "core-entry",
    source: {
      "number-input.tsx": () => import("../../ui/forms/number-input.tsx?raw"),
      "number-input.css": () => import("../../ui/forms/number-input.css?raw"),
    },
    blurb: "Numbers, dates and codes, entered the way the game does it.",
    keys: [
      ["↑ ↓", "Step the number"],
      ["Enter", "Open the calendar or commit"],
      ["Arrows", "Move between days"],
      ["0–9", "Type the code"],
    ],
    name: "Number, date & code",
    sdk: "Number · Date · OTP",
    caption: "Values on settings rows: a stepper, a typed or picked date, and a code split into two groups.",
    controls: [
      { type: "select", name: "kind", label: "Component", options: ENTRY_KINDS },
      { type: "text", name: "label", label: "Label" },
      { type: "number", name: "step", label: "Number step", min: 1, max: 10 },
      { type: "number", name: "digits", label: "Code digits", min: 4, max: 8 },
      { type: "boolean", name: "disabled", label: "Disabled" },
    ],
    defaults: { kind: "number", label: "Field of view", step: 5, digits: 6, disabled: false },
    examples: [
      { label: "Number", values: {} },
      { label: "Date", values: { kind: "date", label: "Date of birth" } },
      { label: "Code", values: { kind: "code", label: "Verification code" } },
      { label: "Disabled", values: { disabled: true } },
    ],
    code: entryCode,
    render: playground => <EntryDemo {...playground} />,
  },
  {
    id: "core-toggles",
    source: {
      "toggle-group.tsx": () => import("../../ui/forms/toggle-group.tsx?raw"),
      "toggle-group.css": () => import("../../ui/forms/toggle-group.css?raw"),
    },
    blurb: "Chips that press and stay pressed, solid white when on.",
    keys: [
      ["← →", "Move between toggles"],
      ["Space / Enter", "Press a toggle"],
    ],
    name: "Toggles",
    sdk: "Toggle · Segmented",
    caption: "The settings tab chips as toggles and single-choice segments. The pressed chip is solid white.",
    controls: [
      {
        type: "select",
        name: "kind",
        label: "Component",
        options: [
          { value: "toggles", label: "Toggle group" },
          { value: "segmented", label: "Segmented control" },
        ],
      },
      { type: "boolean", name: "multiple", label: "Multiple (toggle group)" },
      { type: "select", name: "size", label: "Size (segmented)", options: SEGMENT_SIZES },
      { type: "boolean", name: "disabled", label: "Disabled" },
    ],
    defaults: { kind: "toggles", multiple: false, size: "md", disabled: false },
    examples: [
      { label: "Tabs", values: {} },
      { label: "Multiple", values: { multiple: true } },
      { label: "Segmented", values: { kind: "segmented" } },
      { label: "Small segmented", values: { kind: "segmented", size: "sm" } },
      { label: "Disabled", values: { disabled: true } },
    ],
    code: togglesCode,
    render: playground => <TogglesDemo {...playground} />,
  },
];

export { formEntryDemos };
