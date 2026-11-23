import { Checkbox, CheckboxIndicator } from "../../ui/forms/checkbox";
import { Field, FieldDescription, FieldLabel, FieldList } from "../../ui/forms/field";
import {
  Radio,
  RadioGroup,
  RadioIndicator,
  RadioItem,
  RadioItemDescription,
  RadioItemLabel,
  RadioItemText,
} from "../../ui/forms/radio-group";
import { Switch, SwitchState, SwitchThumb } from "../../ui/forms/switch";
import type { Demo, Playground, Value } from "../demo";
import { optionValue, options as labeledOptions } from "../shared/options";
import { useMirroredControl } from "../shared/use-mirrored-control";
import { SIZES, str, flag } from "./options";
import { FormStage } from "./stage";

const CHECKED = [
  { value: "checked", label: "Checked" },
  { value: "unchecked", label: "Unchecked" },
  { value: "indeterminate", label: "Indeterminate" },
];

const toChecked = (state: string) => (state === "indeterminate" ? "indeterminate" : state === "checked");

const checkedValue = (value: boolean | "indeterminate"): string => {
  if (value === "indeterminate") return value;
  return value ? "checked" : "unchecked";
};

const defaultCheckedProp = (value: Value | undefined): string => {
  if (value === "checked") return " defaultChecked";
  if (value === "indeterminate") return ' defaultChecked="indeterminate"';
  return "";
};

const CheckboxDemo = (playground: Playground) => {
  const v = playground.values;
  const [state, setState] = useMirroredControl(String(v.checked), next => playground.set("checked", next));
  return (
    <FormStage>
      <div className="cf-line">
        <Field layout="choice" disabled={Boolean(v.disabled)}>
          <Checkbox
            checked={toChecked(state)}
            required={Boolean(v.required)}
            onCheckedChange={next => setState(checkedValue(next))}
          >
            <CheckboxIndicator />
          </Checkbox>
          <FieldLabel>{String(v.label)}</FieldLabel>
          {v.description ? <FieldDescription>{String(v.description)}</FieldDescription> : null}
        </Field>
      </div>
    </FormStage>
  );
};

const TEXT_SIZES = [
  { value: "small", label: "Small", description: "Smaller subtitles and menus." },
  { value: "default", label: "Default", description: "The standard size." },
  { value: "large", label: "Large", description: "Larger subtitles and menus." },
  { value: "xl", label: "Extra large", description: "Largest subtitles and menus." },
];

const RADIO_VARIANTS = labeledOptions(["stacked", "Stacked"], ["inline", "Inline"]);

const RadioDemo = (playground: Playground) => {
  const v = playground.values;
  const [value, setValue] = useMirroredControl(String(v.value), next => playground.set("value", next));
  return (
    <FormStage>
      <p className="cf-panel__title">Text size</p>
      <RadioGroup
        aria-label="Text size"
        variant={optionValue(v.variant, RADIO_VARIANTS)}
        disabled={Boolean(v.disabled)}
        value={value}
        onValueChange={next => setValue(String(next))}
      >
        {TEXT_SIZES.map(size => (
          <RadioItem key={size.value}>
            <Radio value={size.value}>
              <RadioIndicator />
            </Radio>
            <RadioItemText>
              <RadioItemLabel>{size.label}</RadioItemLabel>
              {v.descriptions ? <RadioItemDescription>{size.description}</RadioItemDescription> : null}
            </RadioItemText>
          </RadioItem>
        ))}
      </RadioGroup>
    </FormStage>
  );
};

const SwitchDemo = (playground: Playground) => {
  const v = playground.values;
  const [checked, setChecked] = useMirroredControl(Boolean(v.checked), next => playground.set("checked", next));
  return (
    <FormStage>
      <FieldList>
        <Field disabled={Boolean(v.disabled)}>
          <FieldLabel>{String(v.label)}</FieldLabel>
          {v.showState ? <SwitchState /> : null}
          <Switch size={optionValue(v.size, SIZES)} checked={checked} onCheckedChange={setChecked}>
            <SwitchThumb />
          </Switch>
        </Field>
      </FieldList>
    </FormStage>
  );
};

const formChoicesDemos: Demo[] = [
  {
    id: "core-checkbox",
    source: {
      "checkbox.tsx": () => import("../../ui/forms/checkbox.tsx?raw"),
      "checkbox.css": () => import("../../ui/forms/checkbox.css?raw"),
    },
    blurb: "Small square boxes for the fine print, and a parent that keeps count.",
    captureCrop: { x: 0, y: 0, w: 600, h: 340, world: 600 },
    keys: [
      ["Tab", "Move between checkboxes"],
      ["Space", "Check or uncheck"],
    ],
    name: "Checkbox",
    sdk: "Checkbox",
    caption:
      "The legal screen's small square boxes. Indeterminate shows a dash, as a parent box does when only some of its group is checked.",
    controls: [
      { type: "select", name: "checked", label: "State", options: CHECKED },
      { type: "text", name: "label", label: "Label" },
      { type: "text", name: "description", label: "Description" },
      { type: "boolean", name: "required", label: "Required" },
      { type: "boolean", name: "disabled", label: "Disabled" },
    ],
    defaults: {
      checked: "checked",
      label: "Share usage data",
      description: "Helps improve performance.",
      required: false,
      disabled: false,
    },
    examples: [
      { label: "Checked", values: {} },
      { label: "Unchecked", values: { checked: "unchecked" } },
      { label: "Indeterminate", values: { checked: "indeterminate", label: "Accept all", description: "" } },
      {
        label: "Disabled",
        values: { checked: "unchecked", label: "Cross-progression", description: "", disabled: true },
      },
    ],
    code: v => `<Field layout="choice"${flag("disabled", v.disabled)}>
  <Checkbox${defaultCheckedProp(v.checked)}${flag("required", v.required)}>
    <CheckboxIndicator />
  </Checkbox>
  <FieldLabel>${v.label}</FieldLabel>${v.description ? `\n  <FieldDescription>${v.description}</FieldDescription>` : ""}
</Field>`,
    render: playground => <CheckboxDemo {...playground} />,
  },
  {
    id: "core-radio",
    source: {
      "radio-group.tsx": () => import("../../ui/forms/radio-group.tsx?raw"),
      "radio-group.css": () => import("../../ui/forms/radio-group.css?raw"),
    },
    blurb: "One choice, marked with a pink dot.",
    keys: [
      ["← → ↑ ↓", "Move and select"],
      ["Tab", "Leave the group"],
    ],
    name: "Radio group",
    sdk: "Radio",
    caption: "The settings preview selector: a 14px hollow circle at the row's end that fills with a pink dot.",
    controls: [
      { type: "select", name: "value", label: "Value", options: TEXT_SIZES },
      { type: "select", name: "variant", label: "Variant", options: RADIO_VARIANTS },
      { type: "boolean", name: "descriptions", label: "Descriptions" },
      { type: "boolean", name: "disabled", label: "Disabled" },
    ],
    defaults: { value: "default", variant: "stacked", descriptions: true, disabled: false },
    examples: [
      { label: "Stacked", values: {} },
      { label: "Labels only", values: { descriptions: false } },
      { label: "Inline", values: { variant: "inline", descriptions: false } },
      { label: "Disabled", values: { disabled: true } },
    ],
    code: v => `<RadioGroup aria-label="Text size"${str("variant", v.variant, "stacked")}${flag("disabled", v.disabled)} value={size} onValueChange={setSize}>
  {sizes.map((size) => (
    <RadioItem key={size.value}>
      <Radio value={size.value}>
        <RadioIndicator />
      </Radio>
      <RadioItemText>
        <RadioItemLabel>{size.label}</RadioItemLabel>${v.descriptions ? "\n        <RadioItemDescription>{size.description}</RadioItemDescription>" : ""}
      </RadioItemText>
    </RadioItem>
  ))}
</RadioGroup>`,
    render: playground => <RadioDemo {...playground} />,
  },
  {
    id: "core-switch",
    source: {
      "switch.tsx": () => import("../../ui/forms/switch.tsx?raw"),
      "switch.css": () => import("../../ui/forms/switch.css?raw"),
    },
    blurb: "The settings toggle, ready for any yes or no.",
    keys: [
      ["Tab", "Move between switches"],
      ["Space", "Turn on or off"],
    ],
    name: "Toggle switch",
    sdk: "Switch",
    caption: "The settings toggle: On or Off, then a 60×30 pink pill with a 19px knob.",
    controls: [
      { type: "boolean", name: "checked", label: "Checked" },
      { type: "text", name: "label", label: "Label" },
      { type: "select", name: "size", label: "Size", options: SIZES },
      { type: "boolean", name: "showState", label: "On / Off text" },
      { type: "boolean", name: "disabled", label: "Disabled" },
    ],
    defaults: { checked: true, label: "Subtitles", size: "md", showState: true, disabled: false },
    examples: [
      { label: "On", values: {} },
      { label: "Off", values: { checked: false } },
      { label: "Small", values: { size: "sm" } },
      { label: "Disabled", values: { checked: false, label: "Photo Studio Grid", disabled: true } },
    ],
    code: v => `<Field${flag("disabled", v.disabled)}>
  <FieldLabel>${v.label}</FieldLabel>${v.showState ? "\n  <SwitchState />" : ""}
  <Switch${str("size", v.size, "md")}${flag("defaultChecked", v.checked)}>
    <SwitchThumb />
  </Switch>
</Field>`,
    render: playground => <SwitchDemo {...playground} />,
  },
];

export { formChoicesDemos };
