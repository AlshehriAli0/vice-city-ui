import { bindLayer } from "@ui-sdk/core"
import { Button } from "@ui-sdk/react/button"
import { createRadioGroupController, Radio, RadioGroup } from "@ui-sdk/react/radio"
import { useShortcut } from "@ui-sdk/react/shortcuts"
import { CarFront, DoorOpen, Lamp, Lightbulb, TriangleAlert, type LucideIcon } from "lucide-react"
import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState, type CSSProperties, type ReactElement } from "react"
import { PadGlyph } from "./button-prompt"
import { GameFrame, MenuBackdrop, useMenuPhase } from "./menu-backdrop"
import "./game-ui.css"
import "./radio-dial.css"

// `track` is a real song from that station's preview on rockstargames.com/VI/music.
type Station = { value: string; name: string; genre: string; art: string; track: [string, string] }

const STATIONS: Station[] = [
  { value: "cocoteo", name: "Cocoteo FM", genre: "Latin and reggaeton", art: "radio-cocoteo-fm", track: ["EoO", "Bad Bunny"] },
  { value: "dirty-south", name: "Dirty South Classics", genre: "Southern rap", art: "radio-dirty-south-classics", track: ["Like A Pimp", "David Banner ft. Lil' Flip"] },
  { value: "flash", name: "Flash FM", genre: "Pop hits, past and present", art: "radio-flash-fm", track: ["Good Ones", "Charli xcx"] },
  { value: "afrobank", name: "AfroBank FM", genre: "Afrobeats", art: "radio-afrobank-fm", track: ["Joha", "Asake"] },
  { value: "circoloco", name: "Circoloco Records Radio", genre: "House and techno", art: "radio-circoloco-records-radio", track: ["Baby", "Prospa & Murda Beatz"] },
  { value: "back-country", name: "Back Country Radio", genre: "Country", art: "radio-back-country-radio", track: ["Need a Little Time Off for Bad Behavior", "David Allan Coe"] },
  { value: "chamber", name: "The Chamber 106.6", genre: "Late-night cuts", art: "radio-the-chamber-106", track: ["I", "Black Sabbath"] },
]

type Feature = { value: string; name: string; icon: LucideIcon; states: [string, string]; action: [string, string] }

const FEATURES: Feature[] = [
  { value: "headlights", name: "Headlights", icon: Lightbulb, states: ["Off", "Low beam"], action: ["Turn on", "Turn on - high"] },
  { value: "hazards", name: "Hazards", icon: TriangleAlert, states: ["Off", "On"], action: ["Turn on", "Turn off"] },
  { value: "doors", name: "Doors", icon: DoorOpen, states: ["Closed", "Open"], action: ["Toggle", "Toggle"] },
  { value: "interior", name: "Interior light", icon: Lamp, states: ["Off", "On"], action: ["Turn on", "Turn off"] },
  { value: "engine", name: "Engine", icon: CarFront, states: ["Running", "Off"], action: ["Toggle", "Toggle"] },
]

// On Demand shows aren't public yet: neutral covers with station-style names.
const SHOWS = [
  { value: "show-1", name: "Leonida Talk", cover: "a" },
  { value: "show-2", name: "Night Desk", cover: "b" },
  { value: "show-3", name: "Keys Hour", cover: "c" },
  { value: "show-4", name: "The Weekly", cover: "d" },
  { value: "show-5", name: "Vice City Tonight", cover: "e" },
]

type Source = "vehicle" | "radio" | "demand"

const SOURCES: [Source, string][] = [
  ["vehicle", "Vehicle"],
  ["radio", "Radio"],
  ["demand", "On demand"],
]

const NOUNS: Record<Source, string> = { vehicle: "feature", radio: "station", demand: "show" }

const FONT = { fontFamily: "var(--font-cond)", fontWeight: 900 } as const

/* Original printed-style covers for the placeholder shows: one bold mark each, like the station tiles. */
function ShowCover({ cover }: { cover: string }): ReactElement {
  return (
    <svg className="ld-radio__cover" viewBox="0 0 108 108" aria-hidden="true">
      {cover === "a" && (
        <>
          <rect width="108" height="108" fill="#efe6d2" />
          <path d="M16 18h76a8 8 0 0 1 8 8v40a8 8 0 0 1-8 8H48L30 92V74H16a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8z" fill="#1b1a20" />
          <text x="54" y="58" textAnchor="middle" fontSize="34" fill="#f2c33e" style={FONT}>
            LT
          </text>
          <text x="100" y="100" textAnchor="end" fontSize="11" fill="#1b1a20" style={FONT}>
            LEONIDA TALK
          </text>
        </>
      )}
      {cover === "b" && (
        <>
          <rect width="108" height="108" fill="#101a33" />
          <circle cx="56" cy="46" r="26" fill="#e9e4da" />
          <circle cx="68" cy="38" r="24" fill="#101a33" />
          <path d="M80 18l2.4 5 5.4.6-4 3.8 1 5.4-4.8-2.6-4.8 2.6 1-5.4-4-3.8 5.4-.6z" fill="#e9e4da" />
          <text x="10" y="98" fontSize="18" fill="#e9e4da" style={FONT}>
            NIGHT DESK
          </text>
        </>
      )}
      {cover === "c" && (
        <>
          <rect width="108" height="108" fill="#1fa3a0" />
          <clipPath id="ld-sun">
            <rect x="14" y="14" width="80" height="44" />
          </clipPath>
          <circle cx="54" cy="58" r="40" fill="#ffb347" clipPath="url(#ld-sun)" />
          {[30, 38, 46, 54].map((y) => (
            <rect key={y} x="14" y={y} width="80" height="3" fill="#1fa3a0" />
          ))}
          <text x="54" y="88" textAnchor="middle" fontSize="26" fill="#fff6e6" style={FONT}>
            KEYS HOUR
          </text>
        </>
      )}
      {cover === "d" && (
        <>
          <rect width="108" height="108" fill="#c2283a" />
          <circle cx="54" cy="50" r="34" fill="none" stroke="#f6efe2" strokeWidth="5" />
          <text x="54" y="68" textAnchor="middle" fontSize="54" fill="#f6efe2" style={FONT}>
            W
          </text>
          <text x="54" y="101" textAnchor="middle" fontSize="12" letterSpacing="2" fill="#f6efe2" style={FONT}>
            THE WEEKLY
          </text>
        </>
      )}
      {cover === "e" && (
        <>
          <rect width="108" height="108" fill="#16131c" />
          <text x="10" y="44" fontSize="40" fill="#f976b0" style={FONT}>
            VICE
          </text>
          <text x="10" y="78" fontSize="40" fill="#f2c33e" style={FONT}>
            CITY
          </text>
          <rect x="10" y="86" width="88" height="12" fill="#f976b0" />
          <text x="54" y="96" textAnchor="middle" fontSize="10" letterSpacing="3" fill="#16131c" style={FONT}>
            TONIGHT
          </text>
        </>
      )}
    </svg>
  )
}

/* Ring distance from the focused tile: -3..3 for seven tiles, so the strip wraps like a carousel. */
function offset(index: number, focus: number, count: number): number {
  const half = Math.floor(count / 2)
  return ((index - focus + count + half) % count) - half
}

type Tile = { value: string; name: string; art?: string; icon?: LucideIcon; lit?: boolean; cover?: string }

type RadioDialProps = {
  label?: string
  value?: string
  defaultValue?: string
  on?: boolean
  defaultOn?: boolean
  onValueChange?: (value: string) => void
  onOnChange?: (on: boolean) => void
  // What the strip shows: vehicle features, radio stations or On Demand shows.
  source?: Source
  defaultSource?: Source
  onSourceChange?: (source: Source) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

/* The radio and vehicle selector: one top-centre strip, a fixed focus frame, the row slides underneath. */
function RadioDial({
  label = "Radio station",
  value,
  defaultValue = "flash",
  on,
  defaultOn = false,
  onValueChange,
  onOnChange,
  source: sourceProp,
  defaultSource = "radio",
  onSourceChange,
  open,
  defaultOpen = true,
  onOpenChange,
}: RadioDialProps): ReactElement {
  const [ownValue, setOwnValue] = useState(defaultValue)
  const [ownOn, setOwnOn] = useState(defaultOn)
  const [ownOpen, setOwnOpen] = useState(defaultOpen)
  const [ownSource, setOwnSource] = useState<Source>(defaultSource)
  const source = sourceProp ?? ownSource
  // Any source change after the first render plays the strip's fade-in, whichever side made it.
  const [lastSource, setLastSource] = useState(source)
  const [switched, setSwitched] = useState(false)
  if (lastSource !== source) {
    setLastSource(source)
    setSwitched(true)
  }
  const [feature, setFeature] = useState(FEATURES[0].value)
  const [lit, setLit] = useState<Record<string, boolean>>({ headlights: true })
  const [show, setShow] = useState(SHOWS[1].value)
  const [strip] = useState(() => createRadioGroupController<string>())
  const ui = useRef<HTMLDivElement>(null)
  const station = value ?? ownValue
  const playing = on ?? ownOn
  const isOpen = open ?? ownOpen
  const phase = useMenuPhase(isOpen)

  const tiles: Tile[] =
    source === "radio"
      ? STATIONS.map((item) => ({ value: item.value, name: item.name, art: item.art }))
      : source === "vehicle"
        ? FEATURES.map((item) => ({ value: item.value, name: item.name, icon: item.icon, lit: lit[item.value] }))
        : SHOWS.map((item) => ({ value: item.value, name: item.name, cover: item.cover }))
  const current = source === "radio" ? station : source === "vehicle" ? feature : show
  const index = Math.max(0, tiles.findIndex((tile) => tile.value === current))

  // Remember where the row was, so tiles that wrap round jump instead of sliding across.
  const track = useRef<HTMLDivElement>(null)
  const last = useRef({ source, index })
  useLayoutEffect(() => {
    const before = last.current
    last.current = { source, index }
    const row = track.current
    if (!row || before.source !== source || before.index === index) return
    const step = offset(index, before.index, tiles.length)
    if (Math.abs(step) !== 1) return
    row.animate?.(
      [
        { translate: `${step * 124}px 0`, filter: "blur(2px)" },
        { filter: "blur(0px)", offset: 0.45 },
        { translate: "0 0" },
      ],
      { duration: 90, easing: "cubic-bezier(.2,.8,.2,1)" },
    )
  }, [source, index, tiles.length])

  function pick(next: string) {
    if (source === "radio") {
      setOwnValue(next)
      onValueChange?.(next)
    } else if (source === "vehicle") setFeature(next)
    else setShow(next)
  }

  function step(by: number, event: MouseEvent | KeyboardEvent) {
    const reason = event instanceof KeyboardEvent ? "list-navigation" : "item-press"
    strip.setValue(tiles[(index + by + tiles.length) % tiles.length].value, { reason, event })
  }

  function act() {
    if (source === "radio") {
      setOwnOn(!playing)
      onOnChange?.(!playing)
    } else if (source === "vehicle") setLit((now) => ({ ...now, [feature]: !now[feature] }))
  }

  function setOpen(next: boolean) {
    setOwnOpen(next)
    onOpenChange?.(next)
  }

  const dismiss = useEffectEvent(() => setOpen(false))
  useEffect(() => {
    if (phase !== "open" || !ui.current) return
    return bindLayer(ui.current, { onDismiss: (reason) => reason === "escape-key" && dismiss() })
  }, [phase])
  useShortcut("q", (event) => step(-1, event), { layer: ui, when: () => isOpen, description: "Previous (L1)" })
  useShortcut("e", (event) => step(1, event), { layer: ui, when: () => isOpen, description: "Next (R1)" })

  const featureNow = FEATURES.find((item) => item.value === feature) ?? FEATURES[0]
  const tileNow = tiles[index]
  const lines =
    source === "radio"
      ? playing
        ? STATIONS[index].track
        : ["Off"]
      : source === "vehicle"
        ? [featureNow.states[lit[feature] ? 1 : 0]]
        : ["Off"]
  const action = source === "radio" ? (playing ? "Turn off" : "Turn on") : source === "vehicle" ? featureNow.action[lit[feature] ? 1 : 0] : "Play"

  return (
    <GameFrame className="ld-radio">
      <div className="ld-radio__stage" data-phase={phase}>
        <MenuBackdrop phase={phase} />
        {phase !== "closed" && (
          <div
            ref={ui}
            className="ld-menu-ui"
            data-power={(source === "radio" && !playing) || source === "demand" ? "off" : "on"}
            data-source={source}
            inert={phase === "closing" || undefined}
          >
            <RadioGroup
              className="ld-radio__rail"
              aria-label="Source"
              value={source}
              onValueChange={(next) => {
                if (!next) return
                setOwnSource(next as Source)
                onSourceChange?.(next as Source)
              }}
            >
              {SOURCES.map(([id, name]) => (
                <label key={id} className="ld-radio__source">
                  <span>{name}</span>
                  <Radio value={id} className="ld-radio__node">
                    <svg viewBox="0 0 28 28" aria-hidden="true">
                      <path d="M14 4.5l2.6 3h-5.2zM14 23.5l2.6-3h-5.2z" />
                      <text x="14" y="18.2">R</text>
                    </svg>
                  </Radio>
                </label>
              ))}
            </RadioGroup>

            <Button className="ld-radio__chev" data-side="prev" aria-label={`Previous ${NOUNS[source]}`} onClick={(event) => step(-1, event.nativeEvent)}>
              <svg viewBox="0 0 8 14" aria-hidden="true">
                <path d="M7 1L1.5 7 7 13" />
              </svg>
            </Button>
            <div className="ld-radio__window" data-switched={switched || undefined}>
              <div ref={track} className="ld-radio__track">
                <RadioGroup
                  key={source}
                  className="ld-radio__strip"
                  controller={strip}
                  aria-label={source === "radio" ? label : source === "vehicle" ? "Vehicle" : "On demand"}
                  value={current}
                  loop
                  onValueChange={(next) => next && pick(next)}
                >
                  {tiles.map((tile, at) => {
                    const pos = offset(at, index, tiles.length)
                    return (
                      <Radio
                        key={tile.value}
                        value={tile.value}
                        className="ld-radio__tile"
                        data-pos={pos}
                        data-lit={tile.lit || undefined}
                        aria-label={tile.name}
                        style={{ "--pos": pos } as CSSProperties}
                      >
                        {tile.art && <img className="ld-radio__art" src={`/vc/${tile.art}.jpg`} alt="" draggable={false} />}
                        {tile.icon && <tile.icon className="ld-radio__icon" strokeWidth={1.75} aria-hidden="true" />}
                        {tile.cover && <ShowCover cover={tile.cover} />}
                      </Radio>
                    )
                  })}
                </RadioGroup>
              </div>
            </div>
            <span className="ld-radio__focus" aria-hidden="true" />
            <Button className="ld-radio__chev" data-side="next" aria-label={`Next ${NOUNS[source]}`} onClick={(event) => step(1, event.nativeEvent)}>
              <svg viewBox="0 0 8 14" aria-hidden="true">
                <path d="M1 1l5.5 6L1 13" />
              </svg>
            </Button>

            <div className="ld-radio__actions">
              <Button className="ld-radio__action" onClick={act}>
                <PadGlyph glyph="cross" />
                {action}
              </Button>
              {source === "demand" && (
                <span className="ld-radio__action" aria-hidden="true">
                  <PadGlyph glyph="touchpad" />
                  View episodes
                </span>
              )}
            </div>

            <div className="ld-radio__scrub" aria-hidden="true">
              <PadGlyph glyph="L1" />
              <span className="ld-radio__track-bar">
                <i style={{ "--at": tiles.length > 1 ? index / (tiles.length - 1) : 0, "--n": tiles.length } as CSSProperties} />
              </span>
              <PadGlyph glyph="R1" />
            </div>
            <p className="ld-radio__now" aria-live="polite">
              <b>{tileNow?.name}</b>
              {lines.map((line) => (
                <span key={line} data-off={line === "Off" || undefined}>
                  {line}
                </span>
              ))}
            </p>
          </div>
        )}
      </div>
    </GameFrame>
  )
}

export { RadioDial, STATIONS }
export type { Source as RadioSource, Station }
