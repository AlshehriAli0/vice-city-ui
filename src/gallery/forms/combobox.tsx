import { lazy } from "react";

import type { Demo, Playground } from "../demo";
import { flag, str } from "./options";

const ComboboxDemo = lazy(() => import("./combobox-demo").then(module => ({ default: module.ComboboxDemo })));

const comboboxCode = (v: Playground["values"]): string => {
  const input = `<ComboboxInput${str("placeholder", v.placeholder)} />`;
  const control = v.multiple
    ? `    <ComboboxChips>
      <ComboboxValue>{(state) => state.value.map((value, i) => (
        <ComboboxChip key={value} value={value}>{state.labels[i]}<ComboboxChipRemove /></ComboboxChip>
      ))}</ComboboxValue>
      ${input}
    </ComboboxChips>`
    : `    <ComboboxSearchIcon />
    ${input}`;
  return `<Combobox${flag("multiple", v.multiple)}${flag("disabled", v.disabled)} itemToLabel={labelOf}>
  <ComboboxControl>
${control}
    <ComboboxTrigger />
  </ComboboxControl>
  <ComboboxContent>
    <ComboboxEmpty>No matches.</ComboboxEmpty>
    <ComboboxList>
      {places.map((place) => (
        <ComboboxItem key={place.value} value={place.value} label={place.label}>
${v.icons ? `          <ComboboxItemIcon><img src={place.art} alt="" /></ComboboxItemIcon>\n` : ""}          <ComboboxItemText>{place.label}</ComboboxItemText>
          <ComboboxItemIndicator />
        </ComboboxItem>
      ))}
    </ComboboxList>
  </ComboboxContent>
</Combobox>`;
};

const formComboboxDemos: Demo[] = [
  {
    id: "core-combobox",
    source: {
      "combobox.tsx": () => import("../../ui/forms/combobox.tsx?raw"),
      "combobox.css": () => import("../../ui/forms/combobox.css?raw"),
    },
    blurb: "Type to narrow it down, then keep what you pick as chips.",
    keys: [
      ["A–Z", "Type to filter"],
      ["↓", "Open the list"],
      ["↑ ↓", "Move through matches"],
      ["Enter", "Choose"],
      ["Backspace", "Remove the last chip"],
      ["Escape", "Close"],
    ],
    name: "Combobox",
    sdk: "Combobox",
    caption: "Type to filter. Multiple values become white tab chips; Backspace removes the last.",
    controls: [
      { type: "text", name: "label", label: "Label" },
      { type: "text", name: "placeholder", label: "Placeholder" },
      { type: "boolean", name: "icons", label: "Icons" },
      { type: "boolean", name: "multiple", label: "Multiple" },
      { type: "boolean", name: "disabled", label: "Disabled" },
    ],
    defaults: { label: "Destination", placeholder: "Search places", icons: false, multiple: false, disabled: false },
    examples: [
      { label: "Default", values: {} },
      { label: "With icons", values: { icons: true } },
      { label: "Multiple", values: { multiple: true, label: "Destinations", placeholder: "Add a place" } },
      { label: "Disabled", values: { disabled: true } },
    ],
    code: comboboxCode,
    render: playground => <ComboboxDemo {...playground} />,
  },
];

export { formComboboxDemos };
