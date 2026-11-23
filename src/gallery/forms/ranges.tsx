import { Cycle, CycleCount, CycleNext, CyclePrevious, CycleValue } from "../../ui/forms/cycle";
import { Field, FieldLabel, FieldList } from "../../ui/forms/field";
import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack, SliderValue } from "../../ui/forms/slider";
import type { Demo, Playground } from "../demo";
import { useMirroredControl } from "../shared/use-mirrored-control";
import { flag } from "./options";
import { FormStage } from "./stage";

const RANGE_LABELS = ["Minimum", "Maximum"];

const sliderCode = (v: Playground["values"]): string => {
  const thumbs = v.range
    ? `        <SliderThumb index={0} aria-label="Minimum" />\n        <SliderThumb index={1} aria-label="Maximum" />`
    : `        <SliderThumb />`;
  return `<Field${flag("disabled", v.disabled)}>
  <FieldLabel>${v.label}</FieldLabel>
  <Slider defaultValue={${v.range ? "[2, 8]" : 8}} max={10}${Number(v.step) === 1 ? "" : ` step={${v.step}}`}>
    <SliderControl>
      <SliderTrack>
        <SliderIndicator />
${thumbs}
      </SliderTrack>
    </SliderControl>${v.showValue ? "\n    <SliderValue />" : ""}
  </Slider>
</Field>`;
};

const SliderDemo = ({ values: v }: Playground) => {
  const range = Boolean(v.range);
  const step = Number(v.step);
  return (
    <FormStage>
      <FieldList>
        <Field disabled={Boolean(v.disabled)}>
          <FieldLabel>{String(v.label)}</FieldLabel>
          <Slider key={`${range}-${step}`} defaultValue={range ? [2, 8] : 8} min={0} max={10} step={step}>
            <SliderControl>
              <SliderTrack>
                <SliderIndicator />
                {range ? (
                  RANGE_LABELS.map((label, index) => <SliderThumb key={label} index={index} aria-label={label} />)
                ) : (
                  <SliderThumb />
                )}
              </SliderTrack>
            </SliderControl>
            {v.showValue ? <SliderValue /> : null}
          </Slider>
        </Field>
      </FieldList>
    </FormStage>
  );
};

const slug = (label: string) => label.toLowerCase().replace(/[^a-z]+/g, "-");

const INVERT = ["Default", "Inverted X", "Inverted Y", "Inverted X & Y"].map(label => ({
  value: slug(label),
  label,
}));

const CycleDemo = (playground: Playground) => {
  const v = playground.values;
  const [value, setValue] = useMirroredControl(String(v.value), next => playground.set("value", next));
  return (
    <FormStage>
      <FieldList>
        <Field disabled={Boolean(v.disabled)}>
          <FieldLabel>{String(v.label)}</FieldLabel>
          <Cycle value={value} onValueChange={setValue}>
            {INVERT.map(item => (
              <CycleValue key={item.value} value={item.value}>
                {item.label}
              </CycleValue>
            ))}
            {v.count ? <CycleCount /> : null}
            <CyclePrevious />
            <CycleNext />
          </Cycle>
        </Field>
      </FieldList>
    </FormStage>
  );
};

const formRangesDemos: Demo[] = [
  {
    id: "core-slider",
    source: {
      "slider.tsx": () => import("../../ui/forms/slider.tsx?raw"),
      "slider.css": () => import("../../ui/forms/slider.css?raw"),
    },
    blurb: "Drag the pink fill to exactly where you want it.",
    keys: [
      ["← →", "Step the value"],
      ["Page Up / Page Down", "Bigger steps"],
      ["Home / End", "Minimum or maximum"],
    ],
    name: "Slider",
    sdk: "Slider",
    caption: "The settings slider: a 181×12 track with a #ff8ab8 fill, a dark-pink tick thumb and the value after it.",
    controls: [
      { type: "text", name: "label", label: "Label" },
      { type: "number", name: "step", label: "Step", min: 1, max: 5 },
      { type: "boolean", name: "range", label: "Range" },
      { type: "boolean", name: "showValue", label: "Show value" },
      { type: "boolean", name: "disabled", label: "Disabled" },
    ],
    defaults: { label: "Music Volume", step: 1, range: false, showValue: true, disabled: false },
    examples: [
      { label: "Single", values: {} },
      { label: "Range", values: { label: "Deadzone range", range: true } },
      { label: "Stepped", values: { step: 2 } },
      { label: "Disabled", values: { label: "Narration Speed", disabled: true } },
    ],
    code: sliderCode,
    render: playground => <SliderDemo {...playground} />,
  },
  {
    id: "core-cycle",
    source: {
      "cycle.tsx": () => import("../../ui/forms/cycle.tsx?raw"),
      "cycle.css": () => import("../../ui/forms/cycle.css?raw"),
    },
    blurb: "Arrow through the values. It wraps when you reach the end.",
    keys: [
      ["← →", "Previous or next value"],
      ["Tab", "Leave the row"],
    ],
    name: "Cycle",
    sdk: "Segmented Control",
    caption: "The settings cycle row: Value, 1 / 4 with a dimmed total, and bare ‹ › chevrons that wrap.",
    controls: [
      { type: "select", name: "value", label: "Value", options: INVERT },
      { type: "text", name: "label", label: "Label" },
      { type: "boolean", name: "count", label: "Count" },
      { type: "boolean", name: "disabled", label: "Disabled" },
    ],
    defaults: { value: "default", label: "Look", count: true, disabled: false },
    examples: [
      { label: "Default", values: {} },
      { label: "Inverted Y", values: { value: "inverted-y" } },
      { label: "Without count", values: { count: false } },
      { label: "Disabled", values: { disabled: true } },
    ],
    code: v => `<Field${flag("disabled", v.disabled)}>
  <FieldLabel>${v.label}</FieldLabel>
  <Cycle value={value} onValueChange={setValue}>
${INVERT.map(item => `    <CycleValue value="${item.value}">${item.label}</CycleValue>`).join("\n")}${v.count ? "\n    <CycleCount />" : ""}
    <CyclePrevious />
    <CycleNext />
  </Cycle>
</Field>`,
    render: playground => <CycleDemo {...playground} />,
  },
];

export { formRangesDemos };
