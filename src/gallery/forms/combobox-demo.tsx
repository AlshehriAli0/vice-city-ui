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
} from "../../ui/forms/combobox";
import { Field, FieldLabel } from "../../ui/forms/field";
import type { Playground } from "../demo";
import { PLACES, labelIn, type Choice } from "./options";
import { FormStage } from "./stage";

const ComboboxItems = ({ items, icons }: { items: Choice[]; icons: boolean }) => (
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

const ComboboxDemo = ({ values: v }: Playground) => {
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
};

export { ComboboxDemo };
