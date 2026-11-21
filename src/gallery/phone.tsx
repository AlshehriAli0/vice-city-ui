import { useEffect, useRef, useState } from "react"
import { HudCash } from "../leonida/hud-meters"
import { GameFrame, NeutralScene } from "../leonida/menu-backdrop"
import { NotificationSlot, TextCardStill, createSlot, type CallState } from "../leonida/mission-toast"
import type { PhoneApp } from "../leonida/phone-data"
import { PhoneDrawer, PhoneDrawerContent, PhoneDrawerTrigger } from "../leonida/phone-drawer"
import "./overlays.css"
import type { Demo, Playground } from "./types"
import { useAction } from "./use-action"

type Card = "text" | CallState

function NotificationDemo({ values, fired }: Playground) {
  const [slot] = useState(createSlot)
  const card = values.card as Card
  const name = String(values.name)
  const body = String(values.body)
  // The frame shows a still of the default card until a value changes or an action runs; nothing fires on mount.
  const [live, setLive] = useState(false)
  const show = () => {
    setLive(true)
    if (card === "text") slot.message(name, body)
    else if (card === "dialing") slot.dial(name)
    else slot.call(name, card)
  }
  const [still] = useState({ card, name, body })
  const changed = useRef(false)
  useEffect(() => {
    if (!changed.current && card === still.card && name === still.name && body === still.body) return
    changed.current = true
    show()
  }, [card, name, body])
  useAction(fired.again, show)
  useAction(fired.answer, () => {
    setLive(true)
    slot.answer()
  })
  useAction(fired.hangUp, () => {
    setLive(true)
    slot.endCall()
  })
  return (
    <div className="ov-demo">
      <div className="ov-demo__frame">
        <GameFrame>
          <NeutralScene />
          {/* The slot is always placed, so the slot's toaster never falls back to the page's overlay host. */}
          <NotificationSlot toaster={slot.toaster} inline />
          {!live && <TextCardStill name={still.name} body={still.body} />}
        </GameFrame>
      </div>
    </div>
  )
}

// Mirrors a panel value locally, so the phone still opens and closes where the panel is read-only (catalogue, harness).
function useMirror<T>(value: T, set: (next: T) => void): [T, (next: T) => void] {
  const [own, setOwn] = useState(value)
  const [seen, setSeen] = useState(value)
  if (value !== seen) {
    setSeen(value)
    setOwn(value)
  }
  return [
    own,
    (next) => {
      setOwn(next)
      set(next)
    },
  ]
}

function PhoneDemo({ values, set }: Playground) {
  const [slot] = useState(createSlot)
  const [open, setOpen] = useMirror(Boolean(values.open), (next) => set("open", next))
  const [app, setApp] = useMirror(values.app as PhoneApp, (next) => set("app", next))
  return (
    <div className="ov-demo">
      <PhoneDrawer open={open} onOpenChange={setOpen} app={app} onAppChange={setApp} slot={slot}>
        <div className="ov-demo__frame">
          <GameFrame className="ov-phone-frame">
            <NeutralScene />
            <HudCash className="ov-phone-cash" wallet={0} bank={3880} />
            <PhoneDrawerContent time={String(values.time)} inCar={Boolean(values.inCar)} />
            <NotificationSlot toaster={slot.toaster} inline />
          </GameFrame>
        </div>
        <div className="ov-demo__trigger">
          <PhoneDrawerTrigger className="g-btn">Open phone</PhoneDrawerTrigger>
        </div>
      </PhoneDrawer>
    </div>
  )
}

const APP_OPTIONS: { value: PhoneApp; label: string }[] = [
  { value: "home", label: "Home" },
  { value: "whatup", label: "WhatUp" },
  { value: "contacts", label: "Contacts" },
  { value: "fitness", label: "Fitness" },
  { value: "snapmatic", label: "Snapmatic" },
  { value: "news", label: "News" },
  { value: "weather", label: "Weather" },
  { value: "waink", label: "WAiNK" },
  { value: "settings", label: "Settings" },
]

const CARDS: { value: Card; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "incoming", label: "Incoming" },
  { value: "dialing", label: "Dialing" },
  { value: "connected", label: "Connected" },
]

const phone: Demo[] = [
  {
    id: "phone-drawer",
    file: "leonida/phone-drawer",
    frame: false,
    name: "Phone",
    sdk: "Dialog · Tabs · Avatar · Toast",
    wide: true,
    caption:
      "D-pad Up cuts to black, holds, then fades in defocused over the handset; the world stays sharp. Eight round apps, a thin white focus ring and the name pill. Apps cut to an empty page, then their text fades in. Calls put the phone away and ring on the HUD card.",
    keys: [
      ["↑ on the trigger", "Bring the phone up (D-pad Up)"],
      ["← → ↑ ↓", "Move focus (D-pad)"],
      ["Enter", "Select (Cross)"],
      ["Escape / Backspace", "Back, then put the phone away (Circle)"],
      ["X", "Reminders from home, Options in Snapmatic (Square)"],
      ["Q / E", "Snapmatic tabs (L1 / R1)"],
    ],
    controls: [
      { type: "boolean", name: "open", label: "Open" },
      { type: "select", name: "app", label: "App", options: APP_OPTIONS },
      { type: "boolean", name: "inCar", label: "In car" },
      { type: "text", name: "time", label: "Clock" },
    ],
    defaults: { open: true, app: "home", inCar: false, time: "8:00 am" },
    examples: [
      { label: "Home", values: {} },
      { label: "Messages", values: { app: "whatup" } },
      { label: "Contacts", values: { app: "contacts" } },
      { label: "In car", values: { inCar: true, time: "5:43 pm" } },
    ],
    code: (v) => `const slot = createSlot()

<PhoneDrawer
  open={${v.open}}
  onOpenChange={setOpen}
  app="${v.app}"
  onAppChange={setApp}
  slot={slot}
>
  <PhoneDrawerTrigger>Open phone</PhoneDrawerTrigger>
  <PhoneDrawerContent time="${v.time}"${v.inCar ? " inCar" : ""} />
</PhoneDrawer>
<NotificationSlot toaster={slot.toaster} />`,
    render: (playground) => <PhoneDemo {...playground} />,
  },
  {
    id: "mission-toast",
    file: "leonida/mission-toast",
    frame: false,
    name: "Notification",
    sdk: "Toast · Button",
    wide: true,
    caption:
      "One bottom-right slot that replaces itself: a frosted text bubble, or the dark call card. Dialing shows a green handset and ○ to hang up; an incoming call shows D-pad Up to answer; once connected the timer counts.",
    keys: [
      ["↑", "Answer an incoming call (D-pad Up)"],
      ["Hang up", "○ on the card"],
    ],
    controls: [
      { type: "select", name: "card", label: "Card", options: CARDS },
      { type: "text", name: "name", label: "Name" },
      { type: "text", name: "body", label: "Message" },
    ],
    defaults: { card: "text", name: "Contact name", body: "Message preview that runs on to a second line." },
    actions: [
      { name: "again", label: "Show again" },
      { name: "answer", label: "Answer" },
      { name: "hangUp", label: "Hang up" },
    ],
    examples: [
      { label: "Text", values: {} },
      { label: "Incoming call", values: { card: "incoming", name: "Jason" } },
      { label: "Dialing", values: { card: "dialing" } },
      { label: "On a call", values: { card: "connected" } },
    ],
    code: (v) => `<LeonidaToasts />

${v.card === "text" ? `message("${v.name}", "${v.body}")` : v.card === "dialing" ? `dial("${v.name}")` : v.card === "incoming" ? `ring("${v.name}")` : `call("${v.name}", "connected")`}`,
    render: (playground) => <NotificationDemo {...playground} />,
  },
]

export { phone }
