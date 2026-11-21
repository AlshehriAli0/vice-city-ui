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
import { PLACES, labelIn, type Choice } from "./form-options";
import { FormStage } from "./form-stage";
import type { Playground } from "./types";

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

export { ComboboxDemo };
