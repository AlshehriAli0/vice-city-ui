import { useState, type ReactElement } from "react"
import {
  Button,
  Checkbox,
  CheckboxIndicator,
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
  Cycle,
  CycleCount,
  CycleNext,
  CyclePrevious,
  CycleValue,
  DatePicker,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldList,
  Input,
  InputClear,
  InputGroup,
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
  OTPInput,
  OTPInputGroup,
  OTPInputSeparator,
  OTPInputSlot,
  Radio,
  RadioGroup,
  RadioIndicator,
  RadioItem,
  RadioItemDescription,
  RadioItemLabel,
  RadioItemText,
  SegmentedControl,
  SegmentedControlItem,
  Select,
  SelectContent,
  SelectItem,
  SelectItemIcon,
  SelectItemIndicator,
  SelectItemText,
  SelectTrigger,
  SelectValue,
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
  Switch,
  SwitchState,
  SwitchThumb,
  Textarea,
  Toggle,
  ToggleGroup,
} from "../ui/forms"
import type { Demo, Playground, Value } from "./types"
import "./core-forms.css"

type Choice = { value: string; label: string; art?: string }
type Size = "sm" | "md" | "lg"

const slug = (label: string) => label.toLowerCase().replace(/[^a-z]+/g, "-")
const options = (list: Choice[]) => list.map(({ value, label }) => ({ value, label }))
const labelIn = (list: Choice[]) => (value: string) => list.find((item) => item.value === value)?.label ?? value

const SIZES = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
]

const PLACES: Choice[] = [
  { value: "vice-city", label: "Vice City" },
  { value: "leonida-keys", label: "Leonida Keys" },
  { value: "grassrivers", label: "Grassrivers" },
  { value: "port-gellhorn", label: "Port Gellhorn" },
  { value: "ambrosia", label: "Ambrosia" },
  { value: "kalaga", label: "Mount Kalaga" },
].map((place) => ({ ...place, art: `art-${place.value}` }))

const STATIONS: Choice[] = [
  { value: "flash", label: "Flash FM", art: "radio-flash-fm" },
  { value: "cocoteo", label: "Cocoteo FM", art: "radio-cocoteo-fm" },
  { value: "dirty-south", label: "Dirty South Classics", art: "radio-dirty-south-classics" },
  { value: "afrobank", label: "AfroBank FM", art: "radio-afrobank-fm" },
  { value: "back-country", label: "Back Country Radio", art: "radio-back-country-radio" },
]

const INVERT: Choice[] = ["Default", "Inverted X", "Inverted Y", "Inverted X & Y"].map((label) => ({ value: slug(label), label }))

const TEXT_SIZES = [
  { value: "small", label: "Small", description: "Smaller subtitles and menus." },
  { value: "default", label: "Default", description: "The standard size." },
  { value: "large", label: "Large", description: "Larger subtitles and menus." },
  { value: "xl", label: "Extra large", description: "Largest subtitles and menus." },
]

const TABS = ["Gameplay", "Display", "UI", "Camera", "Audio"]

// Usage snippet props: a string prop when set, a bare flag when on, nothing otherwise.
const str = (name: string, value: Value | undefined, skip?: Value) => (value === "" || value === undefined || value === skip ? "" : ` ${name}="${value}"`)
const flag = (name: string, on: Value | undefined) => (on ? ` ${name}` : "")

// A panel value the demo itself can change. Local state keeps it interactive where `set` is a no-op
// (catalogue cards, the preview harness), and a new panel value always wins.
function useMirror<T extends Value>({ values, set }: Playground, name: string): [T, (next: T) => void] {
  const value = values[name] as T
  const [local, setLocal] = useState(value)
  const [seen, setSeen] = useState(value)
  if (value !== seen) {
    setSeen(value)
    setLocal(value)
  }
  return [
    local,
    (next) => {
      setLocal(next)
      set(name, next)
    },
  ]
}

function Stage({ center, children }: { center?: boolean; children: ReactElement | ReactElement[] }): ReactElement {
  return <div className={center ? "cf-panel cf-stage cf-stage--center" : "cf-panel cf-stage"}>{children}</div>
}

/* Button */

function ButtonDemo({ values: v }: Playground): ReactElement {
  return (
    <Stage center>
      <Button
        variant={v.variant as "primary"}
        size={v.size as Size}
        disabled={Boolean(v.disabled)}
        onClick={v.pending ? () => new Promise((done) => setTimeout(done, 1600)) : undefined}
      >
        {String(v.label)}
      </Button>
    </Stage>
  )
}

/* Input */

function InputDemo({ values: v }: Playground): ReactElement {
  const size = v.size as Size
  const input = <Input placeholder={String(v.placeholder)} required={Boolean(v.required)} size={v.clearable ? undefined : size} />
  return (
    <Stage>
      <Field layout={v.layout as "row"} disabled={Boolean(v.disabled)} invalid={v.error ? true : undefined}>
        <FieldLabel>{String(v.label)}</FieldLabel>
        {v.multiline ? (
          <Textarea placeholder={String(v.placeholder)} required={Boolean(v.required)} />
        ) : v.clearable ? (
          <InputGroup size={size}>
            {input}
            <InputClear aria-label="Clear" />
          </InputGroup>
        ) : (
          input
        )}
        {v.error ? <FieldError match>{String(v.error)}</FieldError> : null}
      </Field>
    </Stage>
  )
}

function inputCode(v: Playground["values"]): string {
  const control = v.multiline ? "Textarea" : "Input"
  const field = `${str("layout", v.layout, "row")}${flag("disabled", v.disabled)}${flag("invalid", v.error)}`
  const own = `${str("placeholder", v.placeholder)}${flag("required", v.required)}`
  const lines = [`<Field${field}>`, `  <FieldLabel>${v.label}</FieldLabel>`]
  if (v.clearable && !v.multiline) lines.push(`  <InputGroup${str("size", v.size, "md")}>`, `    <Input${own} />`, `    <InputClear aria-label="Clear" />`, `  </InputGroup>`)
  else lines.push(`  <${control}${own}${v.multiline ? "" : str("size", v.size, "md")} />`)
  if (v.error) lines.push(`  <FieldError match>${v.error}</FieldError>`)
  return [...lines, "</Field>"].join("\n")
}

/* Select */

function SelectItems({ items, icons }: { items: Choice[]; icons: boolean }): ReactElement {
  return (
    <SelectContent>
      {items.map((item) => (
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
  )
}

function SelectDemo({ values: v }: Playground): ReactElement {
  const multiple = Boolean(v.multiple)
  return (
    <Stage>
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
          <SelectTrigger size={v.size as Size}>
            <SelectValue maxLabels={multiple ? 2 : undefined} />
          </SelectTrigger>
          <SelectItems items={STATIONS} icons={Boolean(v.icons)} />
        </Select>
      </Field>
    </Stage>
  )
}

function selectCode(v: Playground["values"]): string {
  const root = `${flag("multiple", v.multiple)}${str("placeholder", v.placeholder)}${flag("required", v.required)}${flag("disabled", v.disabled)}`
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
</Field>`
}

/* Combobox */

function ComboboxItems({ items, icons }: { items: Choice[]; icons: boolean }): ReactElement {
  return (
    <ComboboxContent>
      <ComboboxEmpty>No matches.</ComboboxEmpty>
      <ComboboxList>
        {items.map((item) => (
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
  )
}

function ComboboxDemo({ values: v }: Playground): ReactElement {
  const multiple = Boolean(v.multiple)
  const placeholder = String(v.placeholder)
  return (
    <Stage>
      <Field layout={multiple ? "stack" : "row"}>
        <FieldLabel>{String(v.label)}</FieldLabel>
        <Combobox key={String(multiple)} multiple={multiple} disabled={Boolean(v.disabled)} itemToLabel={labelIn(PLACES)}>
          <ComboboxControl>
            {multiple ? (
              <ComboboxChips>
                <ComboboxValue>
                  {(state) =>
                    (state.value as string[]).map((value, index) => (
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
    </Stage>
  )
}

function comboboxCode(v: Playground["values"]): string {
  const input = `<ComboboxInput${str("placeholder", v.placeholder)} />`
  const control = v.multiple
    ? `    <ComboboxChips>
      <ComboboxValue>{(state) => state.value.map((value, i) => (
        <ComboboxChip key={value} value={value}>{state.labels[i]}<ComboboxChipRemove /></ComboboxChip>
      ))}</ComboboxValue>
      ${input}
    </ComboboxChips>`
    : `    <ComboboxSearchIcon />
    ${input}`
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
</Combobox>`
}

/* Checkbox */

const CHECKED = [
  { value: "checked", label: "Checked" },
  { value: "unchecked", label: "Unchecked" },
  { value: "indeterminate", label: "Indeterminate" },
]

const toChecked = (state: string) => (state === "indeterminate" ? "indeterminate" : state === "checked")

function CheckboxDemo(playground: Playground): ReactElement {
  const v = playground.values
  const [state, setState] = useMirror<string>(playground, "checked")
  return (
    <Stage>
      <div className="cf-line">
        <Field layout="choice" disabled={Boolean(v.disabled)}>
          <Checkbox checked={toChecked(state)} required={Boolean(v.required)} onCheckedChange={(next) => setState(next === "indeterminate" ? next : next ? "checked" : "unchecked")}>
            <CheckboxIndicator />
          </Checkbox>
          <FieldLabel>{String(v.label)}</FieldLabel>
          {v.description ? <FieldDescription>{String(v.description)}</FieldDescription> : null}
        </Field>
      </div>
    </Stage>
  )
}

/* Radio group */

function RadioDemo(playground: Playground): ReactElement {
  const v = playground.values
  const [value, setValue] = useMirror<string>(playground, "value")
  return (
    <Stage>
      <p className="cf-panel__title">Text size</p>
      <RadioGroup aria-label="Text size" variant={v.variant as "stacked"} disabled={Boolean(v.disabled)} value={value} onValueChange={(next) => setValue(String(next))}>
        {TEXT_SIZES.map((size) => (
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
    </Stage>
  )
}

/* Switch */

function SwitchDemo(playground: Playground): ReactElement {
  const v = playground.values
  const [checked, setChecked] = useMirror<boolean>(playground, "checked")
  return (
    <Stage>
      <FieldList>
        <Field disabled={Boolean(v.disabled)}>
          <FieldLabel>{String(v.label)}</FieldLabel>
          {v.showState ? <SwitchState /> : null}
          <Switch size={v.size as Size} checked={checked} onCheckedChange={setChecked}>
            <SwitchThumb />
          </Switch>
        </Field>
      </FieldList>
    </Stage>
  )
}

/* Slider */

const RANGE_LABELS = ["Minimum", "Maximum"]

function SliderDemo({ values: v }: Playground): ReactElement {
  const range = Boolean(v.range)
  const step = Number(v.step)
  return (
    <Stage>
      <FieldList>
        <Field disabled={Boolean(v.disabled)}>
          <FieldLabel>{String(v.label)}</FieldLabel>
          <Slider key={`${range}-${step}`} defaultValue={range ? [2, 8] : 8} min={0} max={10} step={step}>
            <SliderControl>
              <SliderTrack>
                <SliderIndicator />
                {range ? RANGE_LABELS.map((label, index) => <SliderThumb key={label} index={index} aria-label={label} />) : <SliderThumb />}
              </SliderTrack>
            </SliderControl>
            {v.showValue ? <SliderValue /> : null}
          </Slider>
        </Field>
      </FieldList>
    </Stage>
  )
}

function sliderCode(v: Playground["values"]): string {
  const thumbs = v.range
    ? `        <SliderThumb index={0} aria-label="Minimum" />\n        <SliderThumb index={1} aria-label="Maximum" />`
    : `        <SliderThumb />`
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
</Field>`
}

/* Cycle */

function CycleDemo(playground: Playground): ReactElement {
  const v = playground.values
  const [value, setValue] = useMirror<string>(playground, "value")
  return (
    <Stage>
      <FieldList>
        <Field disabled={Boolean(v.disabled)}>
          <FieldLabel>{String(v.label)}</FieldLabel>
          <Cycle value={value} onValueChange={setValue}>
            {INVERT.map((item) => (
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
    </Stage>
  )
}

/* Number, date & code */

const ENTRY_KINDS = [
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "code", label: "Code" },
]

function CodeInput({ digits }: { digits: number }): ReactElement {
  const [code, setCode] = useState("")
  const half = Math.ceil(digits / 2)
  const slots = (from: number, to: number) => Array.from({ length: to - from }, (_, index) => <OTPInputSlot key={from + index} index={from + index} />)
  return (
    <>
      <OTPInput maxLength={digits} value={code} onValueChange={setCode}>
        <OTPInputGroup>{slots(0, half)}</OTPInputGroup>
        <OTPInputSeparator />
        <OTPInputGroup>{slots(half, digits)}</OTPInputGroup>
      </OTPInput>
      <FieldDescription>{code.length === digits ? "Code accepted." : "Sent to your email. Paste works."}</FieldDescription>
    </>
  )
}

function EntryDemo({ values: v }: Playground): ReactElement {
  const step = Number(v.step)
  const digits = Number(v.digits)
  return (
    <Stage>
      <FieldList>
        <Field disabled={Boolean(v.disabled)}>
          <FieldLabel>{String(v.label)}</FieldLabel>
          {v.kind === "date" ? (
            <DatePicker defaultValue="2000-01-01" />
          ) : v.kind === "code" ? (
            <CodeInput key={digits} digits={digits} />
          ) : (
            <NumberInput key={step} defaultValue={70} min={50} max={90} step={step}>
              <NumberInputGroup>
                <NumberInputDecrement />
                <NumberInputControl />
                <NumberInputIncrement />
              </NumberInputGroup>
            </NumberInput>
          )}
        </Field>
      </FieldList>
    </Stage>
  )
}

function entryCode(v: Playground["values"]): string {
  const digits = Number(v.digits)
  const half = Math.ceil(digits / 2)
  const slots = (from: number, to: number) =>
    Array.from({ length: to - from }, (_, index) => `<OTPInputSlot index={${from + index}} />`).join(" ")
  const control =
    v.kind === "date"
      ? `  <DatePicker defaultValue="2000-01-01" />`
      : v.kind === "code"
        ? `  <OTPInput maxLength={${digits}} value={code} onValueChange={setCode}>
    <OTPInputGroup>${slots(0, half)}</OTPInputGroup>
    <OTPInputSeparator />
    <OTPInputGroup>${slots(half, digits)}</OTPInputGroup>
  </OTPInput>`
        : `  <NumberInput defaultValue={70} min={50} max={90} step={${v.step}}>
    <NumberInputGroup>
      <NumberInputDecrement />
      <NumberInputControl />
      <NumberInputIncrement />
    </NumberInputGroup>
  </NumberInput>`
  return `<Field${flag("disabled", v.disabled)}>
  <FieldLabel>${v.label}</FieldLabel>
${control}
</Field>`
}

/* Toggles */

function TogglesDemo({ values: v }: Playground): ReactElement {
  const disabled = Boolean(v.disabled)
  if (v.kind === "segmented")
    return (
      <Stage center>
        <SegmentedControl aria-label="Map view" size={v.size as "md"} disabled={disabled} defaultValue="3d">
          <SegmentedControlItem value="3d">3D view</SegmentedControlItem>
          <SegmentedControlItem value="2d">2D view</SegmentedControlItem>
        </SegmentedControl>
      </Stage>
    )
  return (
    <Stage center>
      <ToggleGroup key={String(v.multiple)} aria-label="Settings tab" multiple={Boolean(v.multiple)} disabled={disabled} defaultValue={["ui"]}>
        {TABS.map((label) => (
          <Toggle key={label} value={label.toLowerCase()}>
            {label}
          </Toggle>
        ))}
      </ToggleGroup>
    </Stage>
  )
}

function togglesCode(v: Playground["values"]): string {
  if (v.kind === "segmented")
    return `<SegmentedControl aria-label="Map view"${str("size", v.size, "md")}${flag("disabled", v.disabled)} defaultValue="3d">
  <SegmentedControlItem value="3d">3D view</SegmentedControlItem>
  <SegmentedControlItem value="2d">2D view</SegmentedControlItem>
</SegmentedControl>`
  return `<ToggleGroup aria-label="Settings tab"${flag("multiple", v.multiple)}${flag("disabled", v.disabled)} defaultValue={["ui"]}>
${TABS.map((label) => `  <Toggle value="${label.toLowerCase()}">${label}</Toggle>`).join("\n")}
</ToggleGroup>`
}

const coreForms: Demo[] = [
  {
    id: "core-button", file: "ui/button", keys: [["Tab", "Move between buttons"], ["Space / Enter", "Press"]],
    name: "Button",
    sdk: "Button",
    caption: "Square display-caps boxes. Hover and focus snap to selection white in one frame. Return a promise to show the pending state.",
    controls: [
      { type: "text", name: "label", label: "Label" },
      {
        type: "select",
        name: "variant",
        label: "Variant",
        options: ["primary", "secondary", "outline", "ghost", "destructive", "link"].map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) })),
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
    code: (v) => `<Button${str("variant", v.variant, "primary")}${str("size", v.size, "md")}${flag("disabled", v.disabled)}${v.pending ? " onClick={save}" : ""}>
  ${v.label}
</Button>${v.pending ? "\n\n// save returns a promise, so the button shows pending until it settles." : ""}`,
    render: (playground) => <ButtonDemo {...playground} />,
  },
  {
    id: "core-input", file: "ui/input", keys: [["Tab", "Move between fields"], ["Escape", "Clear a field with a clear button"]],
    name: "Input",
    sdk: "Input · Textarea",
    caption: "Settings rows: label left, value right. Focus turns the row into the selection bar.",
    controls: [
      { type: "text", name: "label", label: "Label" },
      { type: "text", name: "placeholder", label: "Placeholder" },
      { type: "text", name: "error", label: "Error message" },
      { type: "select", name: "layout", label: "Layout", options: [{ value: "row", label: "Row" }, { value: "stack", label: "Stack" }] },
      { type: "select", name: "size", label: "Size", options: SIZES },
      { type: "boolean", name: "multiline", label: "Multiline" },
      { type: "boolean", name: "clearable", label: "Clear button" },
      { type: "boolean", name: "required", label: "Required" },
      { type: "boolean", name: "disabled", label: "Disabled" },
    ],
    defaults: { label: "Display name", placeholder: "Enter a name", error: "", layout: "row", size: "md", multiline: false, clearable: false, required: false, disabled: false },
    examples: [
      { label: "Default", values: {} },
      { label: "Clearable", values: { label: "Search", placeholder: "Search settings", clearable: true } },
      { label: "Error", values: { label: "Code", placeholder: "000000", error: "Enter all six digits." } },
      { label: "Multiline", values: { label: "Notes", placeholder: "Write a note", layout: "stack", multiline: true } },
      { label: "Disabled", values: { disabled: true } },
    ],
    code: inputCode,
    render: (playground) => <InputDemo {...playground} />,
  },
  {
    id: "core-select", file: "ui/select", keys: [["Space / Enter / ↓", "Open the list"], ["↑ ↓", "Move through options"], ["Enter", "Choose"], ["A–Z", "Jump by typing"], ["Escape", "Close"]],
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
    defaults: { label: "Radio station", placeholder: "Choose a station", size: "md", icons: false, multiple: false, required: false, disabled: false },
    examples: [
      { label: "Default", values: {} },
      { label: "With icons", values: { icons: true } },
      { label: "Multiple", values: { multiple: true, placeholder: "All stations" } },
      { label: "Disabled", values: { disabled: true } },
    ],
    code: selectCode,
    render: (playground) => <SelectDemo {...playground} />,
  },
  {
    id: "core-combobox", file: "ui/combobox", keys: [["A–Z", "Type to filter"], ["↓", "Open the list"], ["↑ ↓", "Move through matches"], ["Enter", "Choose"], ["Backspace", "Remove the last chip"], ["Escape", "Close"]],
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
    render: (playground) => <ComboboxDemo {...playground} />,
  },
  {
    id: "core-checkbox", file: "ui/checkbox", keys: [["Tab", "Move between checkboxes"], ["Space", "Check or uncheck"]],
    name: "Checkbox",
    sdk: "Checkbox",
    caption: "The legal screen's small square boxes. Indeterminate shows a dash, as a parent box does when only some of its group is checked.",
    controls: [
      { type: "select", name: "checked", label: "State", options: CHECKED },
      { type: "text", name: "label", label: "Label" },
      { type: "text", name: "description", label: "Description" },
      { type: "boolean", name: "required", label: "Required" },
      { type: "boolean", name: "disabled", label: "Disabled" },
    ],
    defaults: { checked: "checked", label: "Share usage data", description: "Helps improve performance.", required: false, disabled: false },
    examples: [
      { label: "Checked", values: {} },
      { label: "Unchecked", values: { checked: "unchecked" } },
      { label: "Indeterminate", values: { checked: "indeterminate", label: "Accept all", description: "" } },
      { label: "Disabled", values: { checked: "unchecked", label: "Cross-progression", description: "", disabled: true } },
    ],
    code: (v) => `<Field layout="choice"${flag("disabled", v.disabled)}>
  <Checkbox${v.checked === "checked" ? " defaultChecked" : v.checked === "indeterminate" ? ' defaultChecked="indeterminate"' : ""}${flag("required", v.required)}>
    <CheckboxIndicator />
  </Checkbox>
  <FieldLabel>${v.label}</FieldLabel>${v.description ? `\n  <FieldDescription>${v.description}</FieldDescription>` : ""}
</Field>`,
    render: (playground) => <CheckboxDemo {...playground} />,
  },
  {
    id: "core-radio", file: "ui/radio-group", keys: [["← → ↑ ↓", "Move and select"], ["Tab", "Leave the group"]],
    name: "Radio group",
    sdk: "Radio",
    caption: "The settings preview selector: a 14px hollow circle at the row's end that fills with a pink dot.",
    controls: [
      { type: "select", name: "value", label: "Value", options: options(TEXT_SIZES) },
      { type: "select", name: "variant", label: "Variant", options: [{ value: "stacked", label: "Stacked" }, { value: "inline", label: "Inline" }] },
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
    code: (v) => `<RadioGroup aria-label="Text size"${str("variant", v.variant, "stacked")}${flag("disabled", v.disabled)} value={size} onValueChange={setSize}>
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
    render: (playground) => <RadioDemo {...playground} />,
  },
  {
    id: "core-switch", file: "ui/switch", keys: [["Tab", "Move between switches"], ["Space", "Turn on or off"]],
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
    code: (v) => `<Field${flag("disabled", v.disabled)}>
  <FieldLabel>${v.label}</FieldLabel>${v.showState ? "\n  <SwitchState />" : ""}
  <Switch${str("size", v.size, "md")}${flag("defaultChecked", v.checked)}>
    <SwitchThumb />
  </Switch>
</Field>`,
    render: (playground) => <SwitchDemo {...playground} />,
  },
  {
    id: "core-slider", file: "ui/slider", keys: [["← →", "Step the value"], ["Page Up / Page Down", "Bigger steps"], ["Home / End", "Minimum or maximum"]],
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
    render: (playground) => <SliderDemo {...playground} />,
  },
  {
    id: "core-cycle", file: "ui/cycle", keys: [["← →", "Previous or next value"], ["Tab", "Leave the row"]],
    name: "Cycle",
    sdk: "Segmented Control",
    caption: "The settings cycle row: Value, 1 / 4 with a dimmed total, and bare ‹ › chevrons that wrap.",
    controls: [
      { type: "select", name: "value", label: "Value", options: options(INVERT) },
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
    code: (v) => `<Field${flag("disabled", v.disabled)}>
  <FieldLabel>${v.label}</FieldLabel>
  <Cycle value={value} onValueChange={setValue}>
${INVERT.map((item) => `    <CycleValue value="${item.value}">${item.label}</CycleValue>`).join("\n")}${v.count ? "\n    <CycleCount />" : ""}
    <CyclePrevious />
    <CycleNext />
  </Cycle>
</Field>`,
    render: (playground) => <CycleDemo {...playground} />,
  },
  {
    id: "core-entry", file: "ui/number-input", keys: [["↑ ↓", "Step the number"], ["Enter", "Open the calendar or commit"], ["Arrows", "Move between days"], ["0–9", "Type the code"]],
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
    render: (playground) => <EntryDemo {...playground} />,
  },
  {
    id: "core-toggles", file: "ui/toggle-group", keys: [["← →", "Move between toggles"], ["Space / Enter", "Press a toggle"]],
    name: "Toggles",
    sdk: "Toggle · Segmented",
    caption: "The settings tab chips as toggles and single-choice segments. The pressed chip is solid white.",
    controls: [
      { type: "select", name: "kind", label: "Component", options: [{ value: "toggles", label: "Toggle group" }, { value: "segmented", label: "Segmented control" }] },
      { type: "boolean", name: "multiple", label: "Multiple (toggle group)" },
      { type: "select", name: "size", label: "Size (segmented)", options: SIZES.slice(0, 2) },
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
    render: (playground) => <TogglesDemo {...playground} />,
  },
]

export { coreForms }
