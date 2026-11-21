import { bindLayer } from "@ui-sdk/core"
import { sectorOf } from "@ui-sdk/core/gesture"
import { createRadioGroupController, Radio, RadioGroup } from "@ui-sdk/react/radio"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"
import { useEffect, useEffectEvent, useId, useRef, useState, type CSSProperties, type PointerEvent, type ReactElement } from "react"
import { PadGlyph } from "./button-prompt"
import { HudCash, HudVitals } from "./hud-meters"
import { GameFrame, KeyCap, MenuBackdrop, useMenuPhase } from "./menu-backdrop"
import { ICONS, type IconName } from "./weapon-wheel.icons"
import "./game-ui.css"
import "./weapon-wheel.css"

type Paint = "steel" | "gunmetal" | "wood" | "skin" | "teal" | "glass" | "red" | "fabric" | "khaki"

type Slot = {
  value: string
  // Category shown under the name: SIDEARM, LONGARM, MELEE, EQUIPMENT, EXPLOSIVES, EYEWEAR…
  category: string
  // Leave out for an empty slot, which reads EMPTY over its category.
  name?: string
  kind?: string
  icon?: IconName
  paint?: Paint
  clip?: number
  reserve?: number
  // Items carry an OFF/ON band instead of ammo.
  worn?: boolean
  equipped?: boolean
  rarity?: "teal" | "yellow"
  stats?: { damage: number; accuracy: number; handling: number; range: number }
}

/* Paint ramps for the icons: light from the top left, a darker underside. */
const PAINTS: Record<Paint, [string, string, string]> = {
  steel: ["#f1f2f4", "#a9adb5", "#5d6069"],
  gunmetal: ["#9a9ea8", "#55585f", "#26272c"],
  wood: ["#c98a55", "#8a5129", "#4a2a14"],
  skin: ["#f7cdb6", "#d9937a", "#9b5844"],
  teal: ["#9de8de", "#3c9a91", "#1b4f4c"],
  glass: ["#bfe3d9", "#6aa597", "#2e5049"],
  red: ["#ff7a6e", "#d0302c", "#7a1214"],
  fabric: ["#c7c9d1", "#7d808b", "#3b3d45"],
  khaki: ["#c7b48a", "#8b7650", "#4d3f26"],
}

/* 1080p tile boxes (left, top), clockwise from the top. The ring is two staggered columns around (960, 526); weapon-wheel.css places the tiles. */
const SPOTS: [number, number][] = [
  [866, 195],
  [1096, 305],
  [1157, 466],
  [1096, 628],
  [866, 738],
  [635, 628],
  [575, 466],
  [635, 305],
]

function GameIcon({ name, paint = "steel" }: { name: IconName; paint?: Paint }): ReactElement {
  const id = useId()
  const icon = ICONS[name]
  const [hi, mid, lo] = PAINTS[paint]
  return (
    <svg className="ld-icon" viewBox={icon.box} data-icon={name} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor={hi} />
          <stop offset="0.45" stopColor={mid} />
          <stop offset="1" stopColor={lo} />
        </linearGradient>
        <radialGradient id={`${id}h`} cx="0.25" cy="0.1" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={`rotate(${icon.rotate} 256 256)`}>
        <path d={icon.d} fill={`url(#${id}f)`} stroke="#141216" strokeWidth="1.4" vectorEffect="non-scaling-stroke" paintOrder="stroke" />
        <path d={icon.d} fill={`url(#${id}h)`} />
      </g>
    </svg>
  )
}

/* Heal items drawn as small rendered objects, like the footage: a red pill bottle with a white cap and label. */
function PillBottle(): ReactElement {
  return (
    <svg className="ld-heal-art" viewBox="0 0 40 60" aria-hidden="true">
      <defs>
        <linearGradient id="ld-bottle" x1="0" x2="1">
          <stop offset="0" stopColor="#7a0f14" />
          <stop offset="0.3" stopColor="#e2343a" />
          <stop offset="0.55" stopColor="#c81e25" />
          <stop offset="1" stopColor="#5c0a0e" />
        </linearGradient>
        <linearGradient id="ld-cap" x1="0" x2="1">
          <stop offset="0" stopColor="#bdbdc2" />
          <stop offset="0.35" stopColor="#ffffff" />
          <stop offset="1" stopColor="#9a9aa2" />
        </linearGradient>
        <linearGradient id="ld-label" x1="0" x2="1">
          <stop offset="0" stopColor="#c9c7c4" />
          <stop offset="0.35" stopColor="#f6f4f0" />
          <stop offset="1" stopColor="#b2afab" />
        </linearGradient>
      </defs>
      <ellipse cx="20" cy="57.5" rx="13" ry="2" fill="rgb(0 0 0 / 0.35)" />
      <rect x="7" y="13" width="26" height="44" rx="4" fill="url(#ld-bottle)" />
      <rect x="9" y="10" width="22" height="5" rx="1.5" fill="#8e1218" />
      <rect x="8" y="2" width="24" height="10" rx="2" fill="url(#ld-cap)" />
      <path d="M10 4.5h20M10 7h20M10 9.5h20" stroke="rgb(0 0 0 / 0.12)" strokeWidth="0.8" />
      <rect x="7" y="27" width="26" height="18" fill="url(#ld-label)" />
      <rect x="11" y="31" width="12" height="2.2" fill="#c81e25" />
      <rect x="11" y="35" width="17" height="1.4" fill="#8a8784" />
      <rect x="11" y="38" width="14" height="1.4" fill="#8a8784" />
      <rect x="11.5" y="15" width="3" height="40" rx="1.5" fill="#fff" opacity="0.35" />
    </svg>
  )
}

/* The grey adrenaline pen: a capped auto-injector with an orange tip band. */
function AdrenalinePen(): ReactElement {
  return (
    <svg className="ld-heal-art" viewBox="0 0 40 60" aria-hidden="true">
      <defs>
        <linearGradient id="ld-pen" x1="0" x2="1">
          <stop offset="0" stopColor="#4a4b52" />
          <stop offset="0.35" stopColor="#c9cad0" />
          <stop offset="0.6" stopColor="#8d8e96" />
          <stop offset="1" stopColor="#3a3b41" />
        </linearGradient>
        <linearGradient id="ld-pen-cap" x1="0" x2="1">
          <stop offset="0" stopColor="#2a2b30" />
          <stop offset="0.4" stopColor="#6b6c74" />
          <stop offset="1" stopColor="#1e1f23" />
        </linearGradient>
      </defs>
      <ellipse cx="20" cy="57.5" rx="7" ry="1.6" fill="rgb(0 0 0 / 0.35)" />
      <rect x="15" y="1" width="10" height="12" rx="2.5" fill="url(#ld-pen-cap)" />
      <rect x="14" y="12" width="12" height="44" rx="3" fill="url(#ld-pen)" />
      <rect x="14" y="48" width="12" height="5" fill="#e0782c" />
      <rect x="14" y="24" width="12" height="10" fill="rgb(255 255 255 / 0.25)" />
      <rect x="16.5" y="14" width="2" height="40" rx="1" fill="#fff" opacity="0.4" />
    </svg>
  )
}

const banded = (slot: Slot) => slot.clip !== undefined || slot.worn !== undefined

function Tile({ slot, inHand }: { slot: Slot; inHand: boolean }): ReactElement {
  return (
    <Radio
      value={slot.value}
      className="ld-wheel__tile"
      data-empty={slot.name ? undefined : ""}
      data-band={banded(slot) ? "" : undefined}
      data-rarity={slot.rarity}
      data-in-hand={inHand || undefined}
      aria-label={slot.name ? `${slot.name}, ${slot.category}` : `Empty ${slot.category}`}
    >
      {slot.icon && (
        <span className="ld-wheel__art" data-icon={slot.icon}>
          <GameIcon name={slot.icon} paint={slot.paint} />
        </span>
      )}
      {slot.clip !== undefined && (
        <span className="ld-wheel__band" aria-hidden="true">
          <b>{slot.clip}</b> <span>{slot.reserve}</span>
        </span>
      )}
      {slot.worn !== undefined && (
        <span className="ld-wheel__band" aria-hidden="true">
          <b>{slot.worn ? "ON" : "OFF"}</b>
        </span>
      )}
      {slot.equipped && (
        <span className="ld-wheel__check" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M6 12.5l4 4 8-9" />
          </svg>
        </span>
      )}
    </Radio>
  )
}

function Stats({ slot }: { slot: Slot }): ReactElement | null {
  if (!slot.stats || !slot.name) return null
  const rows: [string, number][] = [
    ["Damage", slot.stats.damage],
    ["Accuracy", slot.stats.accuracy],
    ["Handling", slot.stats.handling],
    ["Range", slot.stats.range],
  ]
  return (
    <div className="ld-wheel__stats" data-rarity={slot.rarity} aria-hidden="true">
      <div className="ld-wheel__pages">
        <i data-on="" />
        <i />
        <KeyCap>R3</KeyCap>
      </div>
      <div className="ld-wheel__stats-head">
        <b>{slot.name}</b>
        <span>{slot.kind}</span>
      </div>
      {rows.map(([label, value]) => (
        <div key={label} className="ld-wheel__stat">
          <span>{label}</span>
          <b>{value.toFixed(1)}</b>
          <i style={{ "--v": value / 10 } as CSSProperties} />
        </div>
      ))}
    </div>
  )
}

type WheelTab = "weapons" | "items"

type WeaponWheelProps = {
  weapons: Slot[]
  items?: Slot[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  // What the character holds now. It keeps the pink top glow while another tile has focus.
  inHand?: string
  defaultInHand?: string
  onEquip?: (value: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  // The ring on show: "weapons" or "items".
  tab?: WheelTab
  defaultTab?: WheelTab
  onTabChange?: (tab: WheelTab) => void
  heals?: [number, number]
  label?: string
}

/* Selection jumps with no tween; the centre label follows about 50ms later. Rapid moves never queue: the label shows whatever is current when the 50ms is up. */
function useLagged<T>(value: T, ms = 50): T {
  const [shown, setShown] = useState(value)
  const latest = useRef(value)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  latest.current = value
  useEffect(() => {
    if (timer.current) return
    timer.current = setTimeout(() => {
      timer.current = null
      setShown(latest.current)
    }, ms)
  }, [value, ms])
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = null
    },
    [],
  )
  return shown
}

function WeaponWheel({
  weapons,
  items = [],
  value,
  defaultValue,
  onValueChange,
  inHand,
  defaultInHand = "unarmed",
  onEquip,
  open,
  defaultOpen = true,
  onOpenChange,
  tab: tabProp,
  defaultTab = "weapons",
  onTabChange,
  heals = [2, 0],
  label = "Weapon wheel",
}: WeaponWheelProps): ReactElement {
  const [ownValue, setOwnValue] = useState(defaultValue ?? weapons[0]?.value)
  const [ownHand, setOwnHand] = useState(defaultInHand)
  const [ownOpen, setOwnOpen] = useState(defaultOpen)
  const [ownTab, setOwnTab] = useState<WheelTab>(defaultTab)
  const [rings] = useState(() => ({ weapons: createRadioGroupController<string>(), items: createRadioGroupController<string>() }))
  const canvas = useRef<HTMLDivElement>(null)
  const ui = useRef<HTMLFormElement>(null)
  const tab = tabProp ?? ownTab
  const held = inHand ?? ownHand
  const isOpen = open ?? ownOpen
  const phase = useMenuPhase(isOpen)
  const slots = tab === "items" ? items : weapons
  const firstOf = (list: Slot[]) => list.find((slot) => slot.name)?.value ?? list[0]?.value
  // A selection from the other ring (the tab changed from outside) falls back to this ring's first filled slot.
  const selected = slots.some((slot) => slot.value === (value ?? ownValue)) ? (value ?? ownValue) : firstOf(slots)
  const focused = slots.find((slot) => slot.value === selected) ?? slots[0]
  const shown = useLagged(focused)

  function select(next: string) {
    setOwnValue(next)
    onValueChange?.(next)
  }

  function setOpen(next: boolean) {
    setOwnOpen(next)
    onOpenChange?.(next)
    if (!next && focused?.name && tab === "weapons") {
      setOwnHand(focused.value)
      onEquip?.(focused.value)
    }
  }

  // Like the stick: the pointer's angle from the centre picks one of eight 45° sectors.
  function aim(event: PointerEvent<HTMLDivElement>) {
    const box = canvas.current?.getBoundingClientRect()
    if (!box || event.pointerType === "touch") return
    const k = box.width / 1920
    const sector = sectorOf((event.clientX - box.left) / k - 960, (event.clientY - box.top) / k - 526, 8, { deadZone: 120 })
    const slot = slots[sector]
    if (slot && slot.value !== selected) rings[tab === "items" ? "items" : "weapons"].setValue(slot.value, { reason: "item-press", event: event.nativeEvent })
  }

  const close = useEffectEvent(() => setOpen(false))
  useEffect(() => {
    if (phase !== "open" || !ui.current) return
    return bindLayer(ui.current, { onDismiss: (reason) => reason === "escape-key" && close() })
  }, [phase])

  const ring = (list: Slot[], name: string, ringOf: keyof typeof rings) => (
    <RadioGroup className="ld-wheel__ring" aria-label={name} controller={rings[ringOf]} value={selected} loop onValueChange={(next) => next && select(next)}>
      {list.map((slot) => (
        <Tile key={slot.value} slot={slot} inHand={slot.value === held} />
      ))}
    </RadioGroup>
  )

  return (
    <GameFrame className="ld-wheel">
      <div ref={canvas} className="ld-wheel__stage" data-phase={phase} onPointerMove={isOpen ? aim : undefined}>
        <MenuBackdrop phase={phase} />
        {phase !== "closed" && (
          // Enter on a slot submits the ring's form, as a radio group does: that equips the slot and closes.
          <form
            ref={ui}
            className="ld-menu-ui"
            inert={phase === "closing" || undefined}
            onSubmit={(event) => {
              event.preventDefault()
              setOpen(false)
            }}
          >
            <svg className="ld-wheel__guide" viewBox="0 0 1920 1080" aria-hidden="true">
              <mask id="ld-wheel-gaps">
                <rect width="1920" height="1080" fill="#fff" />
                {SPOTS.map(([x, y]) => (
                  <rect key={`${x}-${y}`} x={x - 6} y={y - 6} width="200" height="132" fill="#000" />
                ))}
              </mask>
              <circle cx="960" cy="526" r="300" mask="url(#ld-wheel-gaps)" />
            </svg>
            <Tabs
              className="ld-wheel__tabs"
              value={tab}
              onValueChange={(next) => {
                if (!next) return
                setOwnTab(next as WheelTab)
                onTabChange?.(next as WheelTab)
                select(firstOf(next === "items" ? items : weapons))
              }}
            >
              <span className="ld-wheel__r1" aria-hidden="true">
                <PadGlyph glyph="R1" />
              </span>
              <TabsList className="ld-wheel__tablist" aria-label="Wheel">
                <TabsTab value="weapons" className="ld-wheel__tab">
                  Weapons
                </TabsTab>
                <TabsTab value="items" className="ld-wheel__tab">
                  Items
                </TabsTab>
              </TabsList>
              <TabsPanel value="weapons" className="ld-wheel__panel">
                {ring(weapons, label, "weapons")}
              </TabsPanel>
              <TabsPanel value="items" className="ld-wheel__panel">
                {ring(items, "Items", "items")}
              </TabsPanel>
            </Tabs>
            {shown && (
              <p className="ld-wheel__label" data-rarity={shown.name ? shown.rarity : undefined} aria-live="polite">
                <b>{shown.name ?? "Empty"}</b>
                <span>{shown.value === held ? "In hand" : shown.category}</span>
              </p>
            )}
            <div className="ld-wheel__heals" aria-hidden="true">
              <span className="ld-wheel__heal" data-empty={heals[0] === 0 || undefined}>
                <span className="ld-wheel__heal-art">
                  <PillBottle />
                </span>
                <b>
                  {heals[0]} <i className="ld-wheel__badge" data-kind="health" />
                </b>
                <span className="ld-wheel__key">
                  <PadGlyph glyph="square" />
                </span>
              </span>
              <span className="ld-wheel__heal" data-empty={heals[1] === 0 || undefined}>
                <span className="ld-wheel__heal-art">
                  <AdrenalinePen />
                </span>
                <b>
                  {heals[1]} <i className="ld-wheel__badge" data-kind="boost" />
                </b>
                <span className="ld-wheel__key">
                  <PadGlyph glyph="triangle" />
                </span>
              </span>
            </div>
            {tab === "weapons" && focused && <Stats slot={focused} />}
            <p className="ld-wheel__prompt ld-prompt" aria-hidden="true">
              <span className="ld-prompt__label">{tab === "items" ? "Put on" : "Drop"}</span>
              <PadGlyph glyph={tab === "items" ? "cross" : "circle"} />
            </p>
            <div className="ld-wheel__vitals">
              <HudVitals health={72} stamina={70} focus={64} length={{ stamina: 128 }} />
            </div>
            <div className="ld-wheel__cash">
              <HudCash wallet={407} bank={2480} />
            </div>
          </form>
        )}
      </div>
    </GameFrame>
  )
}

export { GameIcon, WeaponWheel }
export type { Slot, Slot as Weapon, WheelTab }
