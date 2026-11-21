import type { ReactElement } from "react";

import { Button } from "../ui/button";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input, InputClear, InputGroup, Textarea } from "../ui/input";
import { SIZES, str, flag } from "./form-options";
import { FormStage } from "./form-stage";
import { optionValue, options as labeledOptions } from "./options";
import type { Demo, Playground } from "./types";

const BUTTON_VARIANTS = labeledOptions(
  ["primary", "Primary"],
  ["secondary", "Secondary"],
  ["outline", "Outline"],
  ["ghost", "Ghost"],
  ["destructive", "Destructive"],
  ["link", "Link"]
);

const INPUT_LAYOUTS = labeledOptions(["row", "Row"], ["stack", "Stack"]);

function ButtonDemo({ values: v }: Playground): ReactElement {
  return (
    <FormStage center>
      <Button
        variant={optionValue(v.variant, BUTTON_VARIANTS)}
        size={optionValue(v.size, SIZES)}
        disabled={Boolean(v.disabled)}
        onClick={v.pending ? () => new Promise(done => setTimeout(done, 1600)) : undefined}
      >
        {String(v.label)}
      </Button>
    </FormStage>
  );
}

function DemoInput({ values }: Pick<Playground, "values">): ReactElement {
  const placeholder = String(values.placeholder);
  const required = Boolean(values.required);
  const size = optionValue(values.size, SIZES);

  if (values.multiline) return <Textarea placeholder={placeholder} required={required} />;
  if (!values.clearable) return <Input placeholder={placeholder} required={required} size={size} />;

  return (
    <InputGroup size={size}>
      <Input placeholder={placeholder} required={required} />
      <InputClear aria-label="Clear" />
    </InputGroup>
  );
}

function InputDemo({ values: v }: Playground): ReactElement {
  return (
    <FormStage>
      <Field
        layout={optionValue(v.layout, INPUT_LAYOUTS)}
        disabled={Boolean(v.disabled)}
        invalid={v.error ? true : undefined}
      >
        <FieldLabel>{String(v.label)}</FieldLabel>
        <DemoInput values={v} />
        {v.error ? <FieldError match>{String(v.error)}</FieldError> : null}
      </Field>
    </FormStage>
  );
}

function inputCode(v: Playground["values"]): string {
  const control = v.multiline ? "Textarea" : "Input";
  const field = `${str("layout", v.layout, "row")}${flag("disabled", v.disabled)}${flag("invalid", v.error)}`;
  const own = `${str("placeholder", v.placeholder)}${flag("required", v.required)}`;
  const lines = [`<Field${field}>`, `  <FieldLabel>${v.label}</FieldLabel>`];
  if (v.clearable && !v.multiline)
    lines.push(
      `  <InputGroup${str("size", v.size, "md")}>`,
      `    <Input${own} />`,
      `    <InputClear aria-label="Clear" />`,
      `  </InputGroup>`
    );
  else lines.push(`  <${control}${own}${v.multiline ? "" : str("size", v.size, "md")} />`);
  if (v.error) lines.push(`  <FieldError match>${v.error}</FieldError>`);
  return [...lines, "</Field>"].join("\n");
}

const formFieldsDemos: Demo[] = [
  {
    id: "core-button",
    file: "ui/button",
    keys: [
      ["Tab", "Move between buttons"],
      ["Space / Enter", "Press"],
    ],
    name: "Button",
    sdk: "Button",
    caption:
      "Square display-caps boxes. Hover and focus snap to selection white in one frame. Return a promise to show the pending state.",
    controls: [
      { type: "text", name: "label", label: "Label" },
      {
        type: "select",
        name: "variant",
        label: "Variant",
        options: BUTTON_VARIANTS,
      },
      { type: "select", name: "size", label: "Size", options: SIZES },
      { type: "boolean", name: "disabled", label: "Disabled" },
      { type: "boolean", name: "pending", label: "Pending on press" },
    ],
    defaults: { label: "Continue", variant: "primary", size: "md", disabled: false, pending: false },
    examples: [
      { label: "Primary", values: {} },
      { label: "Secondary", values: { variant: "secondary", label: "Save", pending: true } },
      { label: "Outline", values: { variant: "outline", label: "Next" } },
      { label: "Ghost", values: { variant: "ghost", label: "Cancel" } },
      { label: "Disabled", values: { disabled: true, label: "Unavailable" } },
    ],
    code: v => `<Button${str("variant", v.variant, "primary")}${str("size", v.size, "md")}${flag("disabled", v.disabled)}${v.pending ? " onClick={save}" : ""}>
  ${v.label}
</Button>${v.pending ? "\n\n// save returns a promise, so the button shows pending until it settles." : ""}`,
    render: playground => <ButtonDemo {...playground} />,
  },
  {
    id: "core-input",
    file: "ui/input",
    keys: [
      ["Tab", "Move between fields"],
      ["Escape", "Clear a field with a clear button"],
    ],
    name: "Input",
    sdk: "Input · Textarea",
    caption: "Settings rows: label left, value right. Focus turns the row into the selection bar.",
    controls: [
      { type: "text", name: "label", label: "Label" },
      { type: "text", name: "placeholder", label: "Placeholder" },
      { type: "text", name: "error", label: "Error message" },
      { type: "select", name: "layout", label: "Layout", options: INPUT_LAYOUTS },
      { type: "select", name: "size", label: "Size", options: SIZES },
      { type: "boolean", name: "multiline", label: "Multiline" },
      { type: "boolean", name: "clearable", label: "Clear button" },
      { type: "boolean", name: "required", label: "Required" },
      { type: "boolean", name: "disabled", label: "Disabled" },
    ],
    defaults: {
      label: "Display name",
      placeholder: "Enter a name",
      error: "",
      layout: "row",
      size: "md",
      multiline: false,
      clearable: false,
      required: false,
      disabled: false,
    },
    examples: [
      { label: "Default", values: {} },
      { label: "Clearable", values: { label: "Search", placeholder: "Search settings", clearable: true } },
      { label: "Error", values: { label: "Code", placeholder: "000000", error: "Enter all six digits." } },
      { label: "Multiline", values: { label: "Notes", placeholder: "Write a note", layout: "stack", multiline: true } },
      { label: "Disabled", values: { disabled: true } },
    ],
    code: inputCode,
    render: playground => <InputDemo {...playground} />,
  },
];

export { formFieldsDemos };
