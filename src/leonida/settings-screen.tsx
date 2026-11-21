import { Button } from "@ui-sdk/react/button"
import { createRadioGroupController, Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"
import { createSegmentedControlController, SegmentedControl, SegmentedControlItem } from "@ui-sdk/react/segmented-control"
import { createSliderController, Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack } from "@ui-sdk/react/slider"
import { createSwitchController, Switch, SwitchThumb } from "@ui-sdk/react/switch"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"
import {
  createContext,
  use,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react"
import { cx } from "../ui/cx"
import { ButtonPrompt, ButtonPrompts, PadGlyph } from "./button-prompt"
import { GameScreen } from "./game-screen"
import { CATEGORIES, defaults, type Category, type Preview, type Row, type Value } from "./settings-screen.data"
import { Controller, Legend, PreviewArt } from "./settings-screen.previews"
import "./settings-screen.css"

type RowEntry = { focus: () => void; el: () => HTMLElement | null; disabled?: boolean }

type ListContext = {
  active: string | null
  setActive: (key: string) => void
  register: (key: string, entry: RowEntry) => () => void
}

const List = createContext<ListContext | null>(null)

function useList(): ListContext {
  const list = use(List)
  if (!list) throw new Error("Settings rows go inside a SettingsList.")
  return list
}

type SettingsListProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
  // The key of the row with the bar.
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string) => void
}

function SettingsList({ value, defaultValue = null, onValueChange, className, children, ...props }: SettingsListProps): ReactElement {
  const [own, setOwn] = useState(defaultValue)
  const active = value === undefined ? own : value
  const rows = useRef(new Map<string, RowEntry>())
  const view = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const [scroll, setScroll] = useState(0)
  const [height, setHeight] = useState(0)
  const [shown, setShown] = useState(0)

  const register = useCallback((key: string, entry: RowEntry) => {
    rows.current.set(key, entry)
    return () => {
      if (rows.current.get(key) === entry) rows.current.delete(key)
    }
  }, [])
  const list = useMemo<ListContext>(
    () => ({
      active,
      register,
      setActive: (key) => {
        if (key === active) return
        setOwn(key)
        onValueChange?.(key)
      },
    }),
    [active, onValueChange, register],
  )

  const ordered = () =>
    [...rows.current].sort(([, a], [, b]) => {
      const [x, y] = [a.el(), b.el()]
      return x && y && x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1
    })

  // Keep two rows below and one above the bar in view; the list glides one row at a time.
  useLayoutEffect(() => {
    const total = content.current?.offsetHeight ?? 0
    const window = view.current?.clientHeight ?? 0
    setHeight(total)
    setShown(window)
    const order = ordered()
    const index = order.findIndex(([key]) => key === active)
    const row = index === -1 ? null : order[index][1].el()
    setScroll((current) => {
      if (!row) return 0
      const top = row.offsetTop
      const pitch = row.offsetHeight
      const max = Math.max(0, total - window)
      const low = top + pitch + Math.min(2 * pitch, total - top - pitch) - window
      const high = index > 0 ? top - pitch : 0
      return Math.min(max, Math.max(0, Math.max(low, Math.min(current, high))))
    })
  }, [active])

  // Up and Down belong to the list, so they're taken in the capture phase, before the slider or radio group in the row sees them.
  const onKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return
    event.preventDefault()
    event.stopPropagation()
    const order = ordered().filter(([, entry]) => !entry.disabled)
    const at = order.findIndex(([key]) => key === active)
    const next = order[Math.min(order.length - 1, Math.max(0, at + (event.key === "ArrowDown" ? 1 : -1)))]
    next?.[1].focus()
  }

  const vars = { "--scroll": scroll, "--height": height, "--window": shown } as CSSProperties
  return (
    <List value={list}>
      <div
        {...props}
        ref={view}
        className={cx("ld-set__view", className)}
        data-slot="settings-list"
        data-more-above={scroll > 0 || undefined}
        data-more-below={scroll < height - shown || undefined}
        style={vars}
        onKeyDownCapture={onKeyDownCapture}
      >
        <div ref={content} className="ld-set__rows">
          {children}
        </div>
      </div>
      {height > shown && <span className="ld-set__scrollbar" aria-hidden="true" style={vars} />}
    </List>
  )
}

type RowProps = { id: string; label: string; disabled?: boolean; className?: string; style?: CSSProperties }

function useFocus(control: { focus: () => void }): () => void {
  return useMemo(() => () => control.focus(), [control])
}

function useRow(key: string, focus: () => void, disabled?: boolean) {
  const list = useList()
  const el = useRef<HTMLElement | null>(null)
  const ref = useCallback((node: HTMLElement | null) => {
    el.current = node
  }, [])
  const { register, setActive } = list
  useLayoutEffect(() => register(key, { focus, el: () => el.current, disabled }), [register, key, focus, disabled])
  return {
    ref,
    "data-slot": "settings-row",
    "data-key": key,
    "data-active": list.active === key || undefined,
    onFocus: () => setActive(key),
    onPointerEnter: () => setActive(key),
  }
}

function Chevron({ flip }: { flip?: boolean }): ReactElement {
  return (
    <svg viewBox="0 0 10 16" width="10" height="16" aria-hidden="true">
      <path d={flip ? "M2 2l6 6-6 6" : "M8 2L2 8l6 6"} />
    </svg>
  )
}

type CycleProps = RowProps & { options: string[]; value?: string; defaultValue?: string; onValueChange?: (value: string) => void }

function SettingsCycle({ id, label, disabled, options, value, defaultValue, onValueChange, className, style }: CycleProps): ReactElement {
  const labelId = useId()
  const [control] = useState(() => createSegmentedControlController<string>())
  const [own, setOwn] = useState(defaultValue ?? options[0])
  const current = value ?? own
  const at = options.indexOf(current)
  const row = useRow(id, useFocus(control), disabled)
  const step = (by: number, event: MouseEvent) => control.setValue(options[(at + by + options.length) % options.length], { reason: "item-press", event })
  return (
    <div {...row} className={cx("ld-set__row", className)} data-kind="cycle" data-disabled={disabled || undefined} style={style}>
      <span className="ld-set__label" id={labelId}>
        {label}
      </span>
      <SegmentedControl
        className="ld-set__cycle"
        aria-labelledby={labelId}
        controller={control}
        value={current}
        disabled={disabled}
        onValueChange={(next) => {
          if (!next) return
          setOwn(next)
          onValueChange?.(next)
        }}
      >
        {options.map((option) => (
          <SegmentedControlItem key={option} value={option} className="ld-set__option">
            {option}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
      <span className="ld-set__index" aria-hidden="true">
        <b>{at + 1}</b>
        <i>/</i>
        <span>{options.length}</span>
      </span>
      {/* Pointer shortcuts; the keyboard and agents use the segmented control itself. */}
      <span className="ld-set__chevrons" aria-hidden="true">
        <span onClick={(event) => step(-1, event.nativeEvent)}>
          <Chevron />
        </span>
        <span onClick={(event) => step(1, event.nativeEvent)}>
          <Chevron flip />
        </span>
      </span>
    </div>
  )
}

type SwitchRowProps = RowProps & { checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (checked: boolean) => void }

function SettingsSwitch({ id, label, disabled, checked, defaultChecked = false, onCheckedChange, className, style }: SwitchRowProps): ReactElement {
  const labelId = useId()
  const [control] = useState(createSwitchController)
  const [own, setOwn] = useState(defaultChecked)
  const on = checked ?? own
  const row = useRow(id, useFocus(control), disabled)
  return (
    <div {...row} className={cx("ld-set__row", className)} data-kind="toggle" data-disabled={disabled || undefined} style={style}>
      <span className="ld-set__label" id={labelId}>
        {label}
      </span>
      <span className="ld-set__state" aria-hidden="true">
        {on ? "On" : "Off"}
      </span>
      <Switch
        className="ld-set__switch"
        aria-labelledby={labelId}
        controller={control}
        checked={on}
        disabled={disabled}
        onCheckedChange={(next) => {
          setOwn(next)
          onCheckedChange?.(next)
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
          event.preventDefault()
          control.toggle({ reason: "press", event: event.nativeEvent })
        }}
      >
        <SwitchThumb className="ld-set__knob" />
      </Switch>
    </div>
  )
}

type SliderRowProps = RowProps & { value?: number; defaultValue?: number; onValueChange?: (value: number) => void; min?: number; max?: number }

function SettingsSlider({ id, label, disabled, value, defaultValue, min = 0, max = 10, onValueChange, className, style }: SliderRowProps): ReactElement {
  const labelId = useId()
  const [control] = useState(() => createSliderController())
  const [own, setOwn] = useState(defaultValue ?? min)
  const current = value ?? own
  const row = useRow(id, useFocus(control), disabled)
  return (
    <div {...row} className={cx("ld-set__row", className)} data-kind="slider" data-disabled={disabled || undefined} style={style}>
      <span className="ld-set__label" id={labelId}>
        {label}
      </span>
      <Slider
        className="ld-set__slider"
        aria-labelledby={labelId}
        controller={control}
        value={current}
        min={min}
        max={max}
        disabled={disabled}
        onValueChange={(next) => {
          const number = Array.isArray(next) ? next[0] : next
          setOwn(number)
          onValueChange?.(number)
        }}
      >
        <SliderControl className="ld-set__slider-control">
          <SliderTrack className="ld-set__track">
            <SliderIndicator className="ld-set__fill" />
            <SliderThumb className="ld-set__thumb" aria-labelledby={labelId} />
          </SliderTrack>
        </SliderControl>
      </Slider>
      <span className="ld-set__number" aria-hidden="true">
        {current}
      </span>
    </div>
  )
}

type RadioGroupRowsProps = { id: string; label: string; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; children: ReactNode }

const Group = createContext<string>("")

function SettingsRadioGroup({ id, label, value, defaultValue, onValueChange, children }: RadioGroupRowsProps): ReactElement {
  const [group] = useState(() => createRadioGroupController<string>())
  return (
    <Group value={id}>
      <RadioGroup aria-label={label} controller={group} value={value} defaultValue={defaultValue} onValueChange={(next) => next && onValueChange?.(next)}>
        {children}
      </RadioGroup>
    </Group>
  )
}

type RadioRowProps = { value: string; children: ReactNode; className?: string; style?: CSSProperties }

function SettingsRadio({ value, children, className, style }: RadioRowProps): ReactElement {
  const group = use(Group)
  const radio = useRef<HTMLButtonElement>(null)
  const focus = useMemo(() => () => radio.current?.focus(), [])
  const row = useRow(`${group}:${value}`, focus)
  return (
    <label {...row} className={cx("ld-set__row", className)} data-kind="radio" style={style}>
      <span className="ld-set__label">{children}</span>
      <Radio ref={radio} className="ld-set__radio" value={value}>
        <RadioIndicator className="ld-set__dot" />
      </Radio>
    </label>
  )
}

function SettingsSection({ title, children, style }: { title: string; children: ReactNode; style?: CSSProperties }): ReactElement {
  return (
    <section data-slot="settings-section">
      <h3 className="ld-set__heading" style={style}>
        {title}
      </h3>
      {children}
    </section>
  )
}

type Detail = { key: string; id: string; label: string; info: string; preview?: Preview }

function details(category: Category): Detail[] {
  return category.sections.flatMap((section) =>
    "radio" in section
      ? section.radio.options.map((choice) => ({ key: `${section.radio.id}:${choice.value}`, id: section.radio.id, label: choice.label, info: section.radio.info, preview: section.radio.preview }))
      : section.rows.map((row) => ({ key: row.id, id: row.id, label: row.label, info: row.info, preview: row.preview })),
  )
}

function rich(text: string): ReactNode {
  return text.split("\n\n").map((paragraph, p) => (
    <p key={p}>{paragraph.split(/\*([^*]+)\*/g).map((part, index) => (index % 2 ? <b key={index}>{part}</b> : part))}</p>
  ))
}

type Change = (id: string, value: Value) => void

function SettingRow({ row, value, onChange, style }: { row: Row; value: Value; onChange: Change; style: CSSProperties }): ReactElement {
  const common = { id: row.id, label: row.label, disabled: row.disabled, style }
  if (row.kind === "toggle") return <SettingsSwitch {...common} checked={value as boolean} onCheckedChange={(next) => onChange(row.id, next)} />
  if (row.kind === "slider") return <SettingsSlider {...common} value={value as number} min={row.min ?? 0} max={row.max ?? 10} onValueChange={(next) => onChange(row.id, next)} />
  return <SettingsCycle {...common} options={row.options} value={value as string} onValueChange={(next) => onChange(row.id, next)} />
}

type SettingsScreenProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onBack?: () => void
}

function SettingsScreen({ value, defaultValue = "controller", onValueChange, onBack }: SettingsScreenProps): ReactElement {
  const [ownTab, setOwnTab] = useState(defaultValue)
  const tab = value ?? ownTab
  const [values, setValues] = useState<Record<string, Value>>(defaults)
  const initial = useMemo(defaults, [])
  const category = CATEGORIES.find((item) => item.value === tab) ?? CATEGORIES[0]
  const at = CATEGORIES.indexOf(category)
  const rows = useMemo(() => details(category), [category])
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const active = rows.find((row) => row.key === activeKey) ?? rows[0]
  const index = active ? rows.indexOf(active) : -1

  const change: Change = (id, next) => setValues((current) => ({ ...current, [id]: next }))

  const select = (next: string) => {
    setOwnTab(next)
    setActiveKey(null)
    onValueChange?.(next)
  }
  const bump = (by: number) => select(CATEGORIES[(at + by + CATEGORIES.length) % CATEGORIES.length].value)

  const activeId = active?.id ?? ""
  const isDefault = values[activeId] === initial[activeId]
  const scheme = tab === "scheme"
  const schemeTitle =
    CATEGORIES[0].sections.flatMap((section) => ("radio" in section ? section.radio.options : [])).find((choice) => choice.value === values["scheme-preview"])?.label ?? ""

  const panel = (item: Category) => {
    let order = 0
    const stagger = () => ({ "--i": Math.min(order++, 12) }) as CSSProperties
    return (
      <SettingsList value={active?.key ?? null} onValueChange={setActiveKey}>
        {item.sections.map((section) => (
          <SettingsSection key={section.title} title={section.title} style={stagger()}>
            {"radio" in section ? (
              <SettingsRadioGroup id={section.radio.id} label={section.radio.label} value={values[section.radio.id] as string} onValueChange={(next) => change(section.radio.id, next)}>
                {section.radio.options.map((choice) => (
                  <SettingsRadio key={choice.value} value={choice.value} style={stagger()}>
                    {choice.label}
                  </SettingsRadio>
                ))}
              </SettingsRadioGroup>
            ) : (
              section.rows.map((row) => <SettingRow key={row.id} row={row} value={values[row.id]} onChange={change} style={stagger()} />)
            )}
          </SettingsSection>
        ))}
      </SettingsList>
    )
  }

  return (
    <GameScreen className="ld-set" data-tab={tab}>
      <img className="ld-set__palms" src="/vc/ui-palms.png" alt="" aria-hidden="true" />
      <p className="ld-set__title" aria-hidden="true">
        Settings
      </p>
      <Tabs className="ld-set__tabs" value={tab} onValueChange={(next) => next && select(next as string)}>
        <div className="ld-set__strip">
          <Button className="ld-set__bumper" aria-label="Previous category" onClick={() => bump(-1)}>
            <PadGlyph glyph="L1" />
          </Button>
          {/* The strip clips at x 990: the eighth chip shows as "ACCO" and is never reached, as in the footage. */}
          <div className="ld-set__clip">
            <TabsList className="ld-set__chips" aria-label="Settings categories">
              {CATEGORIES.map((item) => (
                <TabsTab key={item.value} value={item.value} className="ld-set__chip">
                  {item.label}
                </TabsTab>
              ))}
            </TabsList>
            <span className="ld-set__chip" aria-hidden="true">
              Account
            </span>
          </div>
          <Button className="ld-set__bumper" aria-label="Next category" onClick={() => bump(1)}>
            <PadGlyph glyph="R1" />
          </Button>
        </div>
        {CATEGORIES.map((item) =>
          item === category ? (
            <TabsPanel key={item.value} value={item.value} className="ld-set__panel">
              {panel(item)}
              <p className="ld-set__count" aria-hidden="true" hidden={!active}>
                <b>{index + 1}</b> <i>/</i> {rows.length}
              </p>
            </TabsPanel>
          ) : (
            <TabsPanel key={item.value} value={item.value} />
          ),
        )}
      </Tabs>

      <aside key={tab} className="ld-set__detail" aria-live="polite">
        {!active ? null : scheme ? (
          <Controller title={schemeTitle} />
        ) : (
          <>
            <h2 className="ld-set__detail-title">{active.label}</h2>
            {active.preview && active.preview !== "legend" && (
              <div className="ld-set__preview">
                <PreviewArt kind={active.preview} value={String(values[activeId])} />
              </div>
            )}
            <div className="ld-set__desc">{rich(active.info)}</div>
            {active.preview === "legend" && <Legend />}
          </>
        )}
      </aside>

      <ButtonPrompts label="Settings prompts">
        <ButtonPrompt glyph="triangle" onClick={() => setValues(defaults())}>
          Restore All
        </ButtonPrompt>
        <ButtonPrompt glyph="square" muted={isDefault} disabled={isDefault} onClick={() => change(activeId, initial[activeId])}>
          Restore Default
        </ButtonPrompt>
        <ButtonPrompt glyph="circle" onClick={() => onBack?.()}>
          Back
        </ButtonPrompt>
      </ButtonPrompts>
    </GameScreen>
  )
}

export { CATEGORIES, SettingsCycle, SettingsList, SettingsRadio, SettingsRadioGroup, SettingsScreen, SettingsSection, SettingsSlider, SettingsSwitch }
export type { SettingsListProps, SettingsScreenProps }
