import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@ui-sdk/react/dialog"
import { useShortcut } from "@ui-sdk/react/shortcuts"
import { createContext, use, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ComponentProps, type ReactElement, type ReactNode, type RefObject } from "react"
import { merge } from "../ui/cx"
import { NeutralScene } from "./menu-backdrop"
import { dial as mainDial, type Slot } from "./mission-toast"
import { SCREENS } from "./phone-apps"
import { ACCENT, APPS, PhoneContext, WALLPAPERS, type AppId, type Entry, type PhoneApp, type PhoneState, type Prompt } from "./phone-data"
import { AppMark, Pinwheel, WeatherGlyph, type Weather } from "./phone-icons"
import { PhoneMenu, PhoneMenuItem } from "./phone-menu"
import { PhonePrompts } from "./phone-prompts"
import "./game-ui.css"
import "./phone-drawer.css"
import "./phone-apps.css"

type Phase = "black" | "fade" | "up" | "out"

// Measured at 1080p (spec §1.3, §1.4): on foot 100ms of black then a 200ms fade; in a car 167 + 183. Close holds 100 (67 in a car).
const TIMING = { foot: { hold: 100, fade: 200, close: 100 }, car: { hold: 167, fade: 183, close: 67 } }

const home = (focus: string | null = "whatup"): Entry => ({ screen: "home", focus })

function stackFor(app: PhoneApp): Entry[] {
  if (app === "home") return [home()]
  return [home(app), { screen: app, focus: null }]
}

function appOf(stack: Entry[]): PhoneApp {
  return (stack[1]?.screen as AppId | undefined) ?? "home"
}

// The hand's sway stops in the site's Still mode and under reduced motion.
function subscribeMotion(change: () => void): () => void {
  const observer = new MutationObserver(change)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] })
  const query = window.matchMedia?.("(prefers-reduced-motion: reduce)")
  query?.addEventListener?.("change", change)
  return () => {
    observer.disconnect()
    query?.removeEventListener?.("change", change)
  }
}

function useSway(): boolean {
  return useSyncExternalStore(
    subscribeMotion,
    () => document.documentElement.dataset.motion !== "still" && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    () => false,
  )
}

type Root = {
  open: boolean
  setOpen: (open: boolean) => void
  stack: Entry[]
  setStack: (next: (stack: Entry[]) => Entry[]) => void
  wallpaper: string
  setWallpaper: (id: string) => void
  ringtone: string
  setRingtone: (name: string) => void
  sent: string[]
  setSent: (next: (sent: string[]) => string[]) => void
  slot?: Slot
  circle: RefObject<(() => void) | null>
  close: RefObject<((hold?: number) => void) | null>
}

const RootContext = createContext<Root | null>(null)

function useRoot(): Root {
  const root = use(RootContext)
  if (!root) throw new Error("Phone parts must be inside PhoneDrawer")
  return root
}

type PhoneDrawerProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  // The app showing: home or a base app.
  app?: PhoneApp
  defaultApp?: PhoneApp
  onAppChange?: (app: PhoneApp) => void
  // Where a call from Contacts shows its HUD card. Defaults to the page's notification slot.
  slot?: Slot
  children?: ReactNode
}

/* The iFruit phone: a ui-sdk Dialog that renders inside its 1080p frame. Circle backs out of an app, then puts the phone away. */
function PhoneDrawer({ open, defaultOpen = false, onOpenChange, app, defaultApp = "home", onAppChange, slot, children }: PhoneDrawerProps): ReactElement {
  const [ownOpen, setOwnOpen] = useState(defaultOpen)
  const isOpen = open ?? ownOpen
  const [stack, setStackState] = useState<Entry[]>(() => stackFor(app ?? defaultApp))
  const [seenApp, setSeenApp] = useState(app)
  if (app !== seenApp) {
    setSeenApp(app)
    if (app !== undefined && app !== appOf(stack)) setStackState(stackFor(app))
  }
  const reported = useRef(appOf(stack))
  useEffect(() => {
    const now = appOf(stack)
    if (now === reported.current) return
    reported.current = now
    if (now !== app) onAppChange?.(now)
  }, [stack, app, onAppChange])

  const [wallpaper, setWallpaper] = useState("default")
  const [ringtone, setRingtone] = useState("Beeps")
  const [sent, setSent] = useState<string[]>([])
  const circle = useRef<(() => void) | null>(null)
  const close = useRef<((hold?: number) => void) | null>(null)

  function setOpen(next: boolean) {
    if (next === isOpen) return
    // Putting it away returns to home, so it comes back up on home with WhatUp focused.
    if (!next || app === undefined) setStackState([home()])
    setOwnOpen(next)
    onOpenChange?.(next)
  }

  const root: Root = { open: isOpen, setOpen, stack, setStack: setStackState, wallpaper, setWallpaper, ringtone, setRingtone, sent, setSent, slot, circle, close }
  return (
    <RootContext value={root}>
      <Dialog
        open={isOpen}
        modal="trap-focus"
        closeOnOutsidePress={false}
        onOpenChange={(next, details) => {
          if (next) return setOpen(true)
          // Every close goes through the phone's own cut to black.
          details.cancel()
          if (details.reason === "escape-key") circle.current?.()
          else close.current?.()
        }}
      >
        {children}
      </Dialog>
    </RootContext>
  )
}

/* The button that brings the phone up. D-pad Up (ArrowUp) does too while it has focus. */
function PhoneDrawerTrigger({ onKeyDown, ...props }: ComponentProps<typeof DialogTrigger>): ReactElement {
  const root = useRoot()
  return (
    <DialogTrigger
      {...props}
      aria-keyshortcuts="ArrowUp"
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.key === "ArrowUp" && !event.defaultPrevented) {
          event.preventDefault()
          root.setOpen(true)
        }
      }}
    />
  )
}

function Wallpaper({ id }: { id: string }): ReactElement {
  const art = WALLPAPERS.find((item) => item.id === id)?.art
  return (
    <div className="ld-home__wall ld-wallpaper" data-wallpaper={id} aria-hidden="true">
      {art && <img src={art} alt="" />}
    </div>
  )
}

function HomeScreen(): ReactElement {
  const phone = usePhoneState()
  const focused = APPS.find((app) => app.id === phone.entry.focus) ?? APPS[0]
  return (
    <div className="ld-home" data-slot="phone-home">
      <Wallpaper id={phone.wallpaper} />
      <div className="ld-home__status" data-slot="phone-status">
        <time>{phone.time}</time>
        <span className="ld-home__temp">
          <WeatherGlyph weather={phone.weather} className="ld-home__weather" />
          {phone.temperature}°
        </span>
      </div>
      <div className="ld-home__widget" data-slot="phone-reminders">
        <Pinwheel className="ld-home__pinwheel" />
        <b>Reminders</b>
        <small>{phone.reminders} Notifications</small>
      </div>
      <PhoneMenu
        className="ld-home__grid"
        aria-label="Apps"
        columns={4}
        value={phone.entry.focus}
        onValueChange={(value) => phone.setFocus(value)}
        onOpen={(id) => phone.go({ screen: id as AppId })}
      >
        {APPS.map((app) => (
          <PhoneMenuItem key={app.id} value={app.id} className="ld-home__app" aria-label={app.name}>
            <span className="ld-app-icon" data-slot="phone-app-icon" data-app={app.id}>
              <AppMark app={app.id} />
              {app.badge && <i className="ld-app-icon__badge" />}
            </span>
          </PhoneMenuItem>
        ))}
      </PhoneMenu>
      <span className="ld-home__pill" data-slot="phone-app-name" aria-hidden="true">
        {focused.name}
      </span>
    </div>
  )
}

function usePhoneState(): PhoneState {
  const phone = use(PhoneContext)
  if (!phone) throw new Error("Phone screens must be inside PhoneDrawerContent")
  return phone
}

function promptsFor(phone: PhoneState, select: () => void, square: () => void): Prompt[] {
  const { entry } = phone
  const back: Prompt = { label: "Back", key: "circle", run: phone.back }
  const pick: Prompt = { label: "Select", key: "cross", run: select }
  if (entry.screen === "home")
    return [
      { label: "Reminders", key: "square", run: square },
      pick,
      { label: "Exit", key: "circle", run: () => phone.close() },
    ]
  if (entry.sheet) return [pick, back]
  switch (entry.screen) {
    case "thread":
      return [{ label: "Scroll", key: "R" }, ...(phone.sent.includes(entry.param ?? "") || entry.focus === null ? [] : [{ label: "Send", key: "cross", run: select } as Prompt]), back]
    case "snapmatic":
      return entry.param === "liked"
        ? [{ label: "Tab", key: "L1" }, back]
        : [{ label: "Tab", key: "L1" }, { label: "Options", key: "square", run: square }, { label: "View comments", key: "cross", run: select }, back]
    case "profile":
      return [{ label: "View bio", key: "cross", run: select }, back]
    case "weather":
    case "article":
    case "comments":
    case "fitness-detail":
    case "waink":
      return [back]
    default:
      return [pick, back]
  }
}

type PhoneDrawerContentProps = Omit<ComponentProps<typeof DialogContent>, "children"> & {
  time?: string
  owner?: string
  temperature?: number
  weather?: Weather
  // First person from the driver's seat: the handset upright, right of centre.
  inCar?: boolean
  reminders?: number
}

/* The phone up, in its 1080p frame: a hard cut to black with the prompts already on, a short hold, then a defocused fade
   into the handset view. The world behind stays sharp and undimmed while it's up. */
function PhoneDrawerContent({ time = "8:00 am", owner = "Jason", temperature = 72, weather = "sun", inCar = false, reminders = 4, className, ...props }: PhoneDrawerContentProps): ReactElement {
  const root = useRoot()
  const timing = TIMING[inCar ? "car" : "foot"]
  const [phase, setPhase] = useState<Phase>("black")
  const [exit, setExit] = useState<"call" | undefined>()
  const [motion, setMotion] = useState<"in" | "cut">("in")
  const content = useRef<HTMLDivElement>(null)
  const view = useRef<HTMLDivElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const later = (ms: number, run: () => void) => timers.current.push(setTimeout(run, ms))
  // This part stays mounted while the dialog is closed, so each open starts the sequence again.
  const [seenOpen, setSeenOpen] = useState(root.open)
  if (root.open !== seenOpen) {
    setSeenOpen(root.open)
    if (root.open) {
      setPhase("black")
      setExit(undefined)
      setMotion("in")
    }
  }
  useEffect(() => {
    if (!root.open) return
    later(timing.hold, () => setPhase("fade"))
    later(timing.hold + timing.fade, () => setPhase("up"))
    return () => timers.current.forEach(clearTimeout)
  }, [root.open])

  const stack = root.stack
  const entry = stack[stack.length - 1]

  function patchTop(patch: Partial<Entry>) {
    root.setStack((all) => [...all.slice(0, -1), { ...all[all.length - 1], ...patch }])
  }

  function close(hold = timing.close, then?: () => void) {
    if (phase === "out") return
    setPhase("out")
    later(hold, () => {
      root.setOpen(false)
      then?.()
    })
  }

  const phone: PhoneState = {
    entry,
    depth: stack.length,
    motion,
    owner,
    time,
    temperature,
    weather,
    inCar,
    wallpaper: root.wallpaper,
    ringtone: root.ringtone,
    sent: root.sent,
    reminders,
    go: (next) => {
      setMotion("in")
      root.setStack((all) => [...all, { focus: null, ...next }])
    },
    back: () => {
      if (entry.sheet) return patchTop({ sheet: undefined })
      if (stack.length === 1) return close()
      setMotion("cut")
      root.setStack((all) => all.slice(0, -1))
    },
    setFocus: (focus) => patchTop({ focus }),
    update: patchTop,
    setWallpaper: root.setWallpaper,
    setRingtone: root.setRingtone,
    send: (thread) => root.setSent((all) => [...all, thread]),
    call: (contact) => {
      setExit("call")
      close(130, () => (root.slot ? root.slot.dial(contact.name) : mainDial(contact.name)))
    },
    close,
  }
  root.circle.current = phone.back
  root.close.current = close

  // A screen arrives whole: put D-pad focus on its focused item, or the screen itself when it has none.
  const first = useRef(true)
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    focusScreen()
  }, [stack.length, entry.screen, entry.sheet, entry.param])
  function focusScreen() {
    const items = view.current?.querySelectorAll<HTMLElement>('[data-slot="phone-menu-item"][tabindex="0"]')
    const target = items?.[items.length - 1] ?? view.current ?? content.current
    target?.focus({ preventScroll: false })
  }

  function select() {
    const items = view.current?.querySelectorAll<HTMLElement>('[data-slot="phone-menu-item"][tabindex="0"]')
    items?.[items.length - 1]?.click()
  }
  function square() {
    if (entry.screen === "home") phone.go({ screen: "reminders" })
    else if (entry.screen === "snapmatic" && entry.param !== "liked") patchTop({ sheet: "options" })
  }
  function tab(by: number) {
    if (entry.screen !== "snapmatic" || entry.sheet) return
    const tabs = ["home", "explore", "liked"]
    const at = tabs.indexOf(entry.param ?? "explore")
    const next = tabs[Math.min(tabs.length - 1, Math.max(0, at + by))]
    if (next !== tabs[at]) patchTop({ param: next, focus: null })
  }
  const layer = { layer: content }
  useShortcut("backspace", () => phone.back(), { ...layer, description: "Back (Circle)" })
  useShortcut("x", square, { ...layer, description: "Reminders or options (Square)" })
  useShortcut("q", () => tab(-1), { ...layer, description: "Previous tab (L1)" })
  useShortcut("e", () => tab(1), { ...layer, description: "Next tab (R1)" })

  const sway = useSway()
  const Screen = SCREENS[entry.screen]
  return (
    <PhoneContext value={phone}>
      <DialogContent
        {...props}
        ref={content}
        inline
        className={merge("ld-phone-layer", className)}
        data-phase={phase}
        data-pose={inCar ? "car" : "foot"}
        data-exit={exit}
        initialFocus={() => content.current?.querySelector<HTMLElement>('[data-slot="phone-view"] [data-slot="phone-menu-item"][tabindex="0"]') ?? view.current ?? content.current}
      >
        <DialogTitle className="ld-sr">Phone</DialogTitle>
        <DialogDescription className="ld-sr">{reminders} notifications</DialogDescription>
        <div className="ld-phone-world" data-slot="phone-world">
          <NeutralScene tone="day" />
          <div className="ld-phone-hold" data-slot="phone-hold" data-sway={sway ? "on" : "off"}>
            <div className="ld-phone" data-slot="phone">
              <i className="ld-phone__speaker" aria-hidden="true" />
              <div className="ld-phone__screen" data-slot="phone-screen">
                <div
                  ref={view}
                  key={`${stack.length}-${entry.screen}-${entry.param ?? ""}`}
                  className="ld-phone__view"
                  data-slot="phone-view"
                  data-screen={entry.screen}
                  data-focus={ACCENT[entry.screen] ?? "indigo"}
                  data-motion={motion}
                  tabIndex={-1}
                >
                  {entry.screen === "home" ? <HomeScreen /> : Screen && <Screen />}
                </div>
              </div>
              <i className="ld-phone__pill" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="ld-phone-curtain" data-slot="phone-curtain" aria-hidden="true" />
        <PhonePrompts label="Phone prompts" rows={promptsFor(phone, select, square)} />
      </DialogContent>
    </PhoneContext>
  )
}

export { PhoneDrawer, PhoneDrawerContent, PhoneDrawerTrigger }
export type { PhoneDrawerContentProps, PhoneDrawerProps }
