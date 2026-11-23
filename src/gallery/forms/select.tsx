import { Field, FieldLabel } from "../../ui/forms/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIcon,
  SelectItemIndicator,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from "../../ui/forms/select";
import type { Demo, Playground } from "../demo";
import { optionValue } from "../shared/options";
import { SIZES, flag, labelIn, str, type Choice } from "./options";
import { FormStage } from "./stage";

const STATIONS: Choice[] = [
  { value: "flash", label: "Flash FM", art: "radio-flash-fm" },
  { value: "cocoteo", label: "Cocoteo FM", art: "radio-cocoteo-fm" },
  { value: "dirty-south", label: "Dirty South Classics", art: "radio-dirty-south-classics" },
  { value: "afrobank", label: "AfroBank FM", art: "radio-afrobank-fm" },
  { value: "back-country", label: "Back Country Radio", art: "radio-back-country-radio" },
];

const SelectItems = ({ items, icons }: { items: Choice[]; icons: boolean }) => (
  <SelectContent>
    {items.map(item => (
      <SelectItem key={item.value} value={item.value} label={item.label}>
        {icons && item.art && (
          <SelectItemIcon>
            <img src={`/vc/${item.art}.jpg`} alt="" />
          </SelectItemIcon>
        )}
        <SelectItemText>{item.label}</SelectItemText>
        <SelectItemIndicator />
      </SelectItem>
    ))}
  </SelectContent>
);

const SelectDemo = ({ values: v }: Playground) => {
  const multiple = Boolean(v.multiple);
  return (
    <FormStage>
      <Field>
        <FieldLabel>{String(v.label)}</FieldLabel>
        <Select
          key={String(multiple)}
          multiple={multiple}
          placeholder={String(v.placeholder)}
          disabled={Boolean(v.disabled)}
          required={Boolean(v.required)}
          itemToLabel={multiple ? labelIn(STATIONS) : undefined}
        >
          <SelectTrigger size={optionValue(v.size, SIZES)}>
            <SelectValue maxLabels={multiple ? 2 : undefined} />
          </SelectTrigger>
          <SelectItems items={STATIONS} icons={Boolean(v.icons)} />
        </Select>
      </Field>
    </FormStage>
  );
};

const selectCode = (v: Playground["values"]): string => {
  const root = `${flag("multiple", v.multiple)}${str("placeholder", v.placeholder)}${flag("required", v.required)}${flag("disabled", v.disabled)}`;
  return `<Field>
  <FieldLabel>${v.label}</FieldLabel>
  <Select${root}${v.multiple ? " itemToLabel={labelOf}" : ""}>
    <SelectTrigger${str("size", v.size, "md")}>
      <SelectValue${v.multiple ? " maxLabels={2}" : ""} />
    </SelectTrigger>
    <SelectContent>
      {stations.map((station) => (
        <SelectItem key={station.value} value={station.value} label={station.label}>
${v.icons ? `          <SelectItemIcon><img src={station.art} alt="" /></SelectItemIcon>\n` : ""}          <SelectItemText>{station.label}</SelectItemText>
          <SelectItemIndicator />
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</Field>`;
};

const formSelectDemos: Demo[] = [
  {
    id: "core-select",
    source: {
      "select.tsx": () => import("../../ui/forms/select.tsx?raw"),
      "select.css": () => import("../../ui/forms/select.css?raw"),
    },
    blurb: "A list that opens on the pause menu's slate.",
    keys: [
      ["Space / Enter / ↓", "Open the list"],
      ["↑ ↓", "Move through options"],
      ["Enter", "Choose"],
      ["A–Z", "Jump by typing"],
      ["Escape", "Close"],
    ],
    name: "Select",
    sdk: "Select",
    caption: "The list opens on the pause panel's flat slate, with 64px legend rows and the selection bar.",
    controls: [
      { type: "text", name: "label", label: "Label" },
      { type: "text", name: "placeholder", label: "Placeholder" },
      { type: "select", name: "size", label: "Size", options: SIZES },
      { type: "boolean", name: "icons", label: "Icons" },
      { type: "boolean", name: "multiple", label: "Multiple" },
      { type: "boolean", name: "required", label: "Required" },
      { type: "boolean", name: "disabled", label: "Disabled" },
    ],
    defaults: {
      label: "Radio station",
      placeholder: "Choose a station",
      size: "md",
      icons: false,
      multiple: false,
      required: false,
      disabled: false,
    },
    examples: [
      { label: "Default", values: {} },
      { label: "With icons", values: { icons: true } },
      { label: "Multiple", values: { multiple: true, placeholder: "All stations" } },
      { label: "Disabled", values: { disabled: true } },
    ],
    code: selectCode,
    render: playground => <SelectDemo {...playground} />,
  },
];

export { formSelectDemos };
