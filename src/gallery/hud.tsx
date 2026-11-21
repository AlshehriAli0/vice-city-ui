import { useEffect, useRef, useState, type ReactElement } from "react"
import { ButtonPrompt, ButtonPrompts, type Glyph, type Shoulder } from "../leonida/button-prompt"
import { HelpBox, HelpButton, HelpEvidence, HelpStar, HintTooltip, HintTooltipContent, HintTooltipTrigger } from "../leonida/hint-tooltip"
import { HudFeed, Objective, Subtitle, type FeedKind, type FeedLine } from "../leonida/hud-feed"
import { HudAmmo, HudCash, HudVitals } from "../leonida/hud-meters"
import { HudMinimap, TurnCard, type Blip, type Wash } from "../leonida/hud-minimap"
import { HudStage, useAnnouncement } from "../leonida/hud-stage"
import { toast } from "../leonida/mission-toast"
import { EVIDENCE_LABEL, STATE_LABEL, WantedEvidence, WantedEvidenceItem, WantedHud, WantedLevel, type Evidence, type WantedState } from "../leonida/wanted-level"
import "./hud.css"
import type { Demo, Playground } from "./types"
import { useAction } from "./use-action"

const STATES = (Object.keys(STATE_LABEL) as WantedState[]).map((value) => ({ value, label: STATE_LABEL[value].split(",")[0] }))
const EVIDENCE: Evidence[] = ["clothing", "face", "vehicle", "cctv", "weapon"]
const BLIPS: Blip[] = [
  { id: "goal", bearing: 72, kind: "destination", label: "Destination" },
  { id: "store", bearing: 290, kind: "store", label: "Store" },
  { id: "car", bearing: 125, kind: "vehicle", label: "Your vehicle" },
]

function washOf(heat: number, state: WantedState): Wash {
  if (heat === 0 || state === "escaped") return "none"
  return state === "seen" ? "seen" : "search"
}

function WantedDemo({ values, set }: Playground) {
  const heat = Number(values.heat ?? 2)
  const state = (values.police ?? "seen") as WantedState
  const shown = heat > 0 && state !== "seen" ? EVIDENCE.filter((item) => values[item]) : []
  useAnnouncement(heat === 0 ? "Not wanted" : `${heat} ${heat === 1 ? "star" : "stars"}, ${STATE_LABEL[state].toLowerCase()}`)
  return (
    <div className="hud-demo">
      <HudStage label="Wanted level demo">
        <div data-hud="right">
          <WantedHud>
            <WantedLevel value={heat} onValueChange={(next) => set("heat", next)} state={state} />
            {shown.length > 0 && (
              <WantedEvidence>
                {shown.map((item) => (
                  <WantedEvidenceItem key={item} value={item} />
                ))}
              </WantedEvidence>
            )}
          </WantedHud>
        </div>
        <div data-hud="map">
          <HudMinimap heading={160} wash={washOf(heat, state)} />
        </div>
      </HudStage>
    </div>
  )
}

const FEED: { kind: FeedKind; text: string }[] = [
  { kind: "crime", text: "Crime reported" },
  { kind: "pickup", text: "Painkillers" },
  { kind: "map", text: "Map updated" },
]

function useFeed(first: FeedKind[] = []) {
  const [lines, setLines] = useState<FeedLine[]>(() => first.map((kind, index) => ({ id: `start-${index}`, ...FEED.find((item) => item.kind === kind)! })))
  const [next, setNext] = useState(() => (first.length ? FEED.findIndex((item) => item.kind === first[first.length - 1]) + 1 : 0))
  return {
    lines,
    push: () => {
      const item = FEED[next % FEED.length]
      setNext(next + 1)
      setLines((all) => [...all.slice(-2), { id: `${item.kind}-${next}`, ...item }])
    },
    done: (id: string) => setLines((all) => all.filter((line) => line.id !== id)),
  }
}

function FullHud({ values, set, fired }: Playground) {
  const heat = Number(values.heat ?? 2)
  const state = (values.police ?? "seen") as WantedState
  const sprinting = Boolean(values.sprinting)
  const driving = Boolean(values.driving) && !sprinting
  const [health, setHealth] = useState(78)
  const [stamina, setStamina] = useState(100)
  const [feet, setFeet] = useState(448)
  const feed = useFeed(["crime"])
  useAction(fired.damage, () => setHealth((value) => Math.max(0, value - 18)))
  useAction(fired.heal, () => setHealth(100))
  useAction(fired.feed, feed.push)

  // Sprinting and driving can't both be on: whichever was switched on last wins.
  const before = useRef(values)
  useEffect(() => {
    const was = before.current
    before.current = values
    if (values.sprinting && values.driving) set(was.sprinting ? "sprinting" : "driving", false)
  }, [values, set])

  useEffect(() => {
    if (!sprinting && stamina >= 100) return
    const timer = setInterval(() => setStamina((value) => (sprinting ? Math.max(0, value - 2) : Math.min(100, value + 4))), 100)
    return () => clearInterval(timer)
  }, [sprinting, stamina])

  useEffect(() => {
    if (!driving) return
    const timer = setInterval(() => setFeet((value) => (value <= -200 ? 448 : value - 6)), 100)
    return () => clearInterval(timer)
  }, [driving])

  const wanted = heat > 0
  const profiled = wanted && state !== "seen"
  return (
    <div className="hud-demo">
      <HudStage>
        <div data-hud="vitals">
          <HudVitals health={health} stamina={stamina} focus={100} show={sprinting ? "stamina" : "all"} length={{ stamina: 128, focus: 118 }} />
        </div>
        {!sprinting && (
          <div data-hud="help">
            {profiled ? (
              <HelpBox>
                Out of sight for now. Change your look <HelpEvidence items={["face", "clothing"]} /> and wait out the search <HelpStar />
              </HelpBox>
            ) : (
              <HelpBox>
                Hold <HelpButton glyph="L1" /> and press <HelpButton glyph="square" /> to heal.
              </HelpBox>
            )}
          </div>
        )}
        <div data-hud="right">
          {wanted && (
            <WantedHud>
              <WantedLevel aria-label="Police heat" value={heat} state={state} readOnly />
              {profiled && (
                <WantedEvidence>
                  <WantedEvidenceItem value="clothing" />
                  <WantedEvidenceItem value="face" />
                </WantedEvidence>
              )}
            </WantedHud>
          )}
          <div className="hud-demo__money" data-wanted={wanted || undefined}>
            <HudCash wallet={407} bank={2480} />
          </div>
          <div className="hud-demo__ammo">
            <HudAmmo clip={12} reserve={48} />
          </div>
        </div>
        <HudFeed lines={feed.lines} onDone={feed.done} />
        <div data-hud="map">
          {driving && feet > 0 && (
            <div className="hud-demo__turn">
              <TurnCard turn="right" distance={`${feet} ft`} />
            </div>
          )}
          <HudMinimap heading={driving ? 0 : 160} wash={washOf(heat, state)} route={driving ? "mission" : "none"} distance="0.69 mi" blips={BLIPS} />
        </div>
        <Subtitle speaker="Jason" color="#f0a040">
          Keep it steady. We don't want any more attention tonight.
        </Subtitle>
        <Objective>
          {wanted ? (
            <>
              Leave the <em>search area</em>
            </>
          ) : (
            <>
              Drive to the <em>marina</em>
            </>
          )}
        </Objective>
        {driving && (
          <div data-hud="prompts">
            <ButtonPrompts label="Vehicle prompts" stack>
              <ButtonPrompt glyph="triangle" onClick={() => set("driving", false)}>
                Exit vehicle
              </ButtonPrompt>
            </ButtonPrompts>
          </div>
        )}
      </HudStage>
    </div>
  )
}

const HELP_ANCHOR = "hud-help-anchor"

// The three help prompts, with their help as JSX and as source for the usage snippet.
const HINTS: { value: string; label: string; glyph: Glyph | Shoulder; help: ReactElement; text: string; run: () => void }[] = [
  {
    value: "hotwire",
    label: "Hotwire",
    glyph: "square",
    help: <>Hold <HelpButton glyph="square" /> to hotwire the vehicle.</>,
    text: `Hold <HelpButton glyph="square" /> to hotwire the vehicle.`,
    run: () => toast("Engine running"),
  },
  {
    value: "heal",
    label: "Heal",
    glyph: "L1",
    help: <>Hold <HelpButton glyph="L1" /> and press <HelpButton glyph="square" /> to heal.</>,
    text: `Hold <HelpButton glyph="L1" /> and press <HelpButton glyph="square" /> to heal.`,
    run: () => toast("Healed"),
  },
  {
    value: "atm",
    label: "Use ATM",
    glyph: "circle",
    help: <>Press <HelpButton glyph="circle" /> to use the ATM.</>,
    text: `Press <HelpButton glyph="circle" /> to use the ATM.`,
    run: () => toast.success("Withdrew $500"),
  },
]

function HintDemo({ values, set }: Playground) {
  // Hovering from one prompt to the next opens the new help before the old one closes, so track the latest here.
  const showing = useRef(values.showing)
  showing.current = values.showing
  const openChange = (value: string, open: boolean) => {
    if (open) showing.current = value
    else if (showing.current === value) showing.current = "none"
    else return
    set("showing", showing.current)
  }
  return (
    <HudStage label="Help text demo">
      <span id={HELP_ANCHOR} className="hud-demo__anchor" aria-hidden="true" />
      <div data-hud="help" className="hud-demo__idle">
        <HelpBox>
          Stay out of sight <HelpStar /> and they'll lose your description <HelpEvidence items={["face", "clothing"]} />
        </HelpBox>
      </div>
      <Objective>
        Meet your contact at the <em>diner</em>
      </Objective>
      <div data-hud="prompts">
        <ButtonPrompts label="Help prompts" stack>
          {HINTS.map((hint) => (
            <HintTooltip key={hint.value} delay={Number(values.delay ?? 150)} open={values.showing === hint.value} onOpenChange={(open) => openChange(hint.value, open)}>
              <HintTooltipTrigger glyph={hint.glyph} onClick={hint.run}>
                {hint.label}
              </HintTooltipTrigger>
              <HintTooltipContent anchor={`#${HELP_ANCHOR}`}>{hint.help}</HintTooltipContent>
            </HintTooltip>
          ))}
        </ButtonPrompts>
      </div>
    </HudStage>
  )
}

function PromptsDemo({ values }: Playground) {
  const feed = useFeed(["map"])
  return (
    <HudStage label="Button prompts demo">
      <HudFeed lines={feed.lines} onDone={feed.done} />
      <div data-hud="prompts">
        <ButtonPrompts label="Screen prompts" stack={Boolean(values.stack)}>
          <ButtonPrompt glyph="square" onClick={feed.push}>
            Reminders
          </ButtonPrompt>
          <ButtonPrompt glyph={values.glyph as Glyph | Shoulder} muted={Boolean(values.muted)} onClick={() => toast("Selected")}>
            {String(values.label)}
          </ButtonPrompt>
          <ButtonPrompt glyph="circle" onClick={() => toast("Back")}>
            Exit
          </ButtonPrompt>
        </ButtonPrompts>
      </div>
    </HudStage>
  )
}

const GLYPHS: (Glyph | Shoulder)[] = ["cross", "circle", "square", "triangle", "touchpad", "L1", "R1", "L2", "R2"]
const EVIDENCE_CONTROLS = EVIDENCE.map((item) => ({ type: "boolean" as const, name: item, label: EVIDENCE_LABEL[item] }))

const hud: Demo[] = [
  {
    id: "wanted-level",
    file: "leonida/wanted-level",
    name: "Wanted Level",
    sdk: "Rating",
    caption: "Six star slots that fill from the right. White with a bloom while seen, grey when they lose you, a slow pulse while they search, dark red with evidence discs once you escape.",
    wide: true,
    frame: false,
    keys: [
      ["← →", "Raise or lower the wanted level (it fills from the right)"],
      ["Home / End", "Go to one star or six"],
      ["Space", "On the current level, clear it"],
    ],
    controls: [
      { type: "number", name: "heat", label: "Stars", min: 0, max: 6 },
      { type: "select", name: "police", label: "Police", options: STATES },
      ...EVIDENCE_CONTROLS,
    ],
    defaults: { heat: 2, police: "seen", clothing: true, face: true, vehicle: false, cctv: false, weapon: false },
    examples: [
      { label: "Seen", values: {} },
      { label: "Lost sight", values: { police: "lost" } },
      { label: "Searching", values: { heat: 3, police: "search" } },
      { label: "Escaped", values: { heat: 3, police: "escaped", vehicle: true } },
    ],
    code: (v) => {
      const items = Number(v.heat) > 0 && v.police !== "seen" ? EVIDENCE.filter((item) => v[item]) : []
      const evidence = items.length ? `\n  <WantedEvidence>\n${items.map((item) => `    <WantedEvidenceItem value="${item}" />`).join("\n")}\n  </WantedEvidence>` : ""
      return `<WantedHud>\n  <WantedLevel value={${v.heat}} onValueChange={setLevel} state="${v.police}" />${evidence}\n</WantedHud>`
    },
    render: (playground) => <WantedDemo {...playground} />,
  },
  {
    id: "hud-meters",
    file: "leonida/hud-meters",
    frame: false,
    name: "HUD",
    sdk: "Meter",
    wide: true,
    caption: "The full 1080p HUD: vitals, help box, stars, cash and ammo, the right-edge feed, the tilted minimap with its turn card, subtitles and the objective. Sprinting hides everything but stamina.",
    controls: [
      { type: "number", name: "heat", label: "Wanted level", min: 0, max: 6 },
      { type: "select", name: "police", label: "Police", options: STATES },
      { type: "boolean", name: "driving", label: "Driving" },
      { type: "boolean", name: "sprinting", label: "Sprinting" },
    ],
    defaults: { heat: 2, police: "seen", driving: true, sprinting: false },
    actions: [
      { name: "damage", label: "Take damage" },
      { name: "heal", label: "Heal" },
      { name: "feed", label: "New feed line" },
    ],
    examples: [
      { label: "Driving", values: {} },
      { label: "Calm", values: { heat: 0, driving: false } },
      { label: "Searching", values: { heat: 3, police: "search", driving: false } },
      { label: "Sprinting", values: { heat: 0, driving: false, sprinting: true } },
    ],
    code: (v) => `<HudStage>
  <HudVitals health={78} stamina={100} focus={100}${v.sprinting ? ' show="stamina"' : ""} />
${Number(v.heat) > 0 ? `  <WantedHud>\n    <WantedLevel aria-label="Police heat" value={${v.heat}} state="${v.police}" readOnly />\n  </WantedHud>\n` : ""}  <HudCash wallet={407} bank={2480} />
  <HudAmmo clip={12} reserve={48} />
  <HudMinimap heading={${v.driving ? 0 : 160}} route="${v.driving ? "mission" : "none"}" />
</HudStage>`,
    render: (playground) => <FullHud {...playground} />,
  },
  {
    id: "hint-tooltip",
    file: "leonida/hint-tooltip",
    frame: false,
    name: "Help Text",
    sdk: "Tooltip",
    wide: true,
    caption: "The top-left help box with inline stars, evidence and buttons. Hover or focus a prompt to show its help there.",
    keys: [
      ["Tab", "Focus a prompt and show its help"],
      ["Space / Enter", "Run the prompt"],
      ["Escape", "Hide the help"],
    ],
    controls: [
      { type: "select", name: "showing", label: "Help shown", options: [{ value: "none", label: "None" }, ...HINTS.map((hint) => ({ value: hint.value, label: hint.label }))] },
      { type: "number", name: "delay", label: "Hover delay (ms)", min: 0, max: 1000, step: 50 },
    ],
    defaults: { showing: "none", delay: 150 },
    examples: [
      { label: "Idle", values: {} },
      ...HINTS.map((hint) => ({ label: hint.label, values: { showing: hint.value } })),
    ],
    code: (v) => {
      const hint = HINTS.find((item) => item.value === v.showing) ?? HINTS[0]
      return `<HintTooltip delay={${v.delay}}${v.showing === hint.value ? " open" : ""}>
  <HintTooltipTrigger glyph="${hint.glyph}">${hint.label}</HintTooltipTrigger>
  <HintTooltipContent anchor="#help-anchor">
    ${hint.text}
  </HintTooltipContent>
</HintTooltip>`
    },
    render: (playground) => <HintDemo {...playground} />,
  },
  {
    id: "button-prompt",
    file: "leonida/button-prompt",
    frame: false,
    name: "Button Prompts",
    sdk: "Button",
    wide: true,
    caption: "Bottom-right prompts: outlined condensed caps and a white button disc, stacked 52px apart. Reminders adds a feed line.",
    keys: [
      ["Tab", "Move between prompts"],
      ["Space / Enter", "Press the prompt"],
    ],
    controls: [
      { type: "boolean", name: "stack", label: "Stacked" },
      { type: "text", name: "label", label: "Label" },
      { type: "select", name: "glyph", label: "Button", options: GLYPHS.map((glyph) => ({ value: glyph, label: glyph.length === 2 ? glyph : glyph[0].toUpperCase() + glyph.slice(1) })) },
      { type: "boolean", name: "muted", label: "Muted" },
    ],
    defaults: { stack: true, label: "Select", glyph: "cross", muted: false },
    examples: [
      { label: "Stacked", values: {} },
      { label: "Footer row", values: { stack: false } },
      { label: "Muted", values: { muted: true } },
    ],
    code: (v) => `<ButtonPrompts label="Screen prompts"${v.stack ? " stack" : ""}>
  <ButtonPrompt glyph="square">Reminders</ButtonPrompt>
  <ButtonPrompt glyph="${v.glyph}"${v.muted ? " muted" : ""}>${v.label}</ButtonPrompt>
  <ButtonPrompt glyph="circle">Exit</ButtonPrompt>
</ButtonPrompts>`,
    render: (playground) => <PromptsDemo {...playground} />,
  },
]

export { hud }
