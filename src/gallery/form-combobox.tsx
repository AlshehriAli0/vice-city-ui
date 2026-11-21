import type { ReactElement } from "react";

import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxControl,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIcon,
  ComboboxItemIndicator,
  ComboboxItemText,
  ComboboxList,
  ComboboxSearchIcon,
  ComboboxTrigger,
  ComboboxValue,
} from "../ui/combobox";
import { Field, FieldLabel } from "../ui/field";
import { PLACES, flag, labelIn, str, type Choice } from "./form-options";
import { FormStage } from "./form-stage";
import type { Demo, Playground } from "./types";

function ComboboxItems({ items, icons }: { items: Choice[]; icons: boolean }): ReactElement {
  return (
    <ComboboxContent>
      <ComboboxEmpty>No matches.</ComboboxEmpty>
      <ComboboxList>
        {items.map(item => (
          <ComboboxItem key={item.value} value={item.value} label={item.label}>
            {icons && item.art && (
              <ComboboxItemIcon>
                <img src={`/vc/${item.art}.jpg`} alt="" />
              </ComboboxItemIcon>
            )}
            <ComboboxItemText>{item.label}</ComboboxItemText>
            <ComboboxItemIndicator />
          </ComboboxItem>
        ))}
      </ComboboxList>
    </ComboboxContent>
  );
}

function ComboboxDemo({ values: v }: Playground): ReactElement {
  const multiple = Boolean(v.multiple);
  const placeholder = String(v.placeholder);
  return (
    <FormStage>
      <Field layout={multiple ? "stack" : "row"}>
        <FieldLabel>{String(v.label)}</FieldLabel>
        <Combobox
          key={String(multiple)}
          multiple={multiple}
          disabled={Boolean(v.disabled)}
          itemToLabel={labelIn(PLACES)}
        >
          <ComboboxControl>
            {multiple ? (
              <ComboboxChips>
                <ComboboxValue>
                  {state =>
                    (Array.isArray(state.value) ? state.value : []).map((value, index) => (
                      <ComboboxChip key={value} value={value}>
                        {state.labels[index]}
                        <ComboboxChipRemove aria-label={`Remove ${state.labels[index]}`} />
                      </ComboboxChip>
                    ))
                  }
                </ComboboxValue>
                <ComboboxInput placeholder={placeholder} />
              </ComboboxChips>
            ) : (
              <>
                <ComboboxSearchIcon />
                <ComboboxInput placeholder={placeholder} />
              </>
            )}
            <ComboboxTrigger />
          </ComboboxControl>
          <ComboboxItems items={PLACES} icons={Boolean(v.icons)} />
        </Combobox>
      </Field>
    </FormStage>
  );
}

function comboboxCode(v: Playground["values"]): string {
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
}

const formComboboxDemos: Demo[] = [
  {
    id: "core-combobox",
    file: "ui/combobox",
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
