import { Button } from "@ui-sdk/react/button"
import { useShortcut } from "@ui-sdk/react/shortcuts"
import { Toast, ToastAction, ToastDescription, ToastRegion, ToastTitle, createToaster } from "@ui-sdk/react/toast"
import { Phone } from "lucide-react"
import { useEffect, useState, type ComponentProps, type ReactElement, type ReactNode } from "react"
import { merge } from "../ui/cx"
import { ButtonGlyph } from "./button-prompt"
import "./game-ui.css"
import "./mission-toast.css"

type CallState = "dialing" | "incoming" | "connected" | "ended"

type CallHandlers = { onAnswer?: () => void; onHangUp?: () => void }

type SlotData = { kind?: "message" | "call"; avatar?: string; state?: CallState; since?: number } & CallHandlers

type CallOptions = { avatar?: string }

type Slot = {
  toaster: ReturnType<typeof createToaster<ReactNode>>
  message: (name: string, body: string, options?: { avatar?: string }) => string
  call: (name: string, state?: CallState, options?: CallOptions) => string
  // Calling out: Dialing…, then the timer once they pick up.
  dial: (name: string, options?: CallOptions & { pickup?: number }) => string
  // A call coming in: answered with D-pad Up, or answer().
  ring: (name: string, options?: CallOptions) => string
  answer: () => void
  // "Call Ended" for a beat, then the card goes.
  endCall: () => void
}

/* One bottom-right slot (specs/notify §1): a newer card replaces the one showing; they never stack. */
function createSlot(): Slot {
  const toaster = createToaster({ duration: 5500 })
  toaster.subscribe(() => {
    const [, ...older] = toaster.toasts()
    for (const item of older) toaster.dismiss(item.id)
  })
  let timer: ReturnType<typeof setTimeout> | undefined
  let current: { name: string; avatar?: string } = { name: "" }
  const call: Slot["call"] = (name, state = "dialing", options = {}) => {
    clearTimeout(timer)
    current = { name, avatar: options.avatar }
    const handlers: CallHandlers = state === "incoming" ? { onAnswer: answer } : state === "ended" ? {} : { onHangUp: endCall }
    return toaster({
      id: "call",
      title: name,
      duration: Infinity,
      data: { kind: "call", state, avatar: options.avatar, since: state === "connected" ? Date.now() : undefined, ...handlers } satisfies SlotData,
    })
  }
  function answer() {
    if (toaster.toasts().some((item) => item.id === "call")) call(current.name, "connected", current)
  }
  function endCall() {
    if (!toaster.toasts().some((item) => item.id === "call")) return
    call(current.name, "ended", current)
    timer = setTimeout(() => toaster.dismiss("call"), 1200)
  }
  return {
    toaster,
    // A text message: frosted card with the sender, the body and the D-pad hint to open it.
    message: (name, body, options = {}) =>
      toaster({ title: name, description: body, data: { kind: "message", avatar: options.avatar } satisfies SlotData }),
    call,
    dial: (name, { pickup = 2000, ...options } = {}) => {
      const id = call(name, "dialing", options)
      timer = setTimeout(() => call(name, "connected", options), pickup)
      return id
    },
    ring: (name, options) => call(name, "incoming", options),
    answer,
    endCall,
  }
}

const main = createSlot()
const toast = main.toaster
const { message, call, dial, ring, answer, endCall } = main

function CallLine({ data }: { data: Pick<SlotData, "state" | "since"> }): ReactElement {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (data.state !== "connected") return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [data.state])
  if (data.state === "dialing") return <span>Dialing…</span>
  if (data.state === "incoming") return <span>Incoming Call…</span>
  if (data.state === "ended") return <span>Call Ended</span>
  const seconds = Math.max(0, Math.floor((now - (data.since ?? now)) / 1000))
  return (
    <span className="ld-call__clock">
      {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
    </span>
  )
}

function DpadHint(): ReactElement {
  return (
    <span className="ld-text__hint" data-slot="notification-hint" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M9 1h6v7l-3 3-3-3z" fill="#fff" />
        <path d="M9 23h6v-7l-3-3-3 3zM1 9v6h7l3-3-3-3zM23 9v6h-7l-3-3 3-3z" fill="rgb(255 255 255 / 0.4)" />
      </svg>
    </span>
  )
}

type ToastProps = ComponentProps<typeof Toast>

/* A text message as a ui-sdk Toast: the D-pad hint, the sender's avatar and name, the body and its action. */
function TextNotification({ avatar, name, className, children, ...props }: Omit<ToastProps, "children"> & { avatar?: string; name?: string; children?: ReactNode }): ReactElement {
  return (
    <Toast {...props} className={merge("ld-text", className)}>
      <DpadHint />
      <span className="ld-text__head" data-slot="notification-head">
        <span className="ld-text__avatar" data-slot="notification-avatar" aria-hidden="true">
          {avatar ? <img src={avatar} alt="" /> : name?.slice(0, 1)}
        </span>
        <ToastTitle className="ld-text__name" />
      </span>
      <ToastDescription className="ld-text__body" />
      <ToastAction className="ld-text__action" />
      {children}
    </Toast>
  )
}

/* The HUD call card (spec §5): a dark bar fading out to the right. Dialing shows a green handset disc; once connected,
   or ringing, the avatar with a small handset badge. Left of it, ○ hangs up, or D-pad Up answers an incoming call. */
function CallNotification({
  state = "dialing",
  since,
  avatar,
  name,
  onAnswer,
  onHangUp,
  className,
  ...props
}: Omit<ToastProps, "children"> & { state?: CallState; since?: number; avatar?: string; name?: string } & CallHandlers): ReactElement {
  useShortcut("arrowup", () => onAnswer?.(), { when: () => state === "incoming" && Boolean(onAnswer), description: "Answer (D-pad Up)" })
  const face = state !== "dialing"
  return (
    <Toast {...props} className={merge("ld-call", className)} data-state={state}>
      {state === "incoming" && onAnswer && (
        <Button className="ld-call__key" aria-label="Answer call" onClick={onAnswer}>
          <DpadUp />
        </Button>
      )}
      {(state === "dialing" || state === "connected") && onHangUp && (
        <Button className="ld-call__key" aria-label="Hang up" onClick={onHangUp}>
          <ButtonGlyph shape="circle" />
        </Button>
      )}
      <span className="ld-call__icon" data-slot="notification-avatar" data-face={face || undefined} aria-hidden="true">
        {face && (avatar ? <img src={avatar} alt="" /> : <b>{name?.slice(0, 1)}</b>)}
        <i>
          <Phone />
        </i>
      </span>
      <span className="ld-call__copy" data-slot="notification-copy">
        <ToastTitle className="ld-call__name" />
        <CallLine data={{ state, since }} />
      </span>
    </Toast>
  )
}

function DpadUp(): ReactElement {
  return (
    <svg className="ld-call__dpad" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M12.6 3h6.8v7.4L16 13.8l-3.4-3.4z" data-on="" />
      <path d="M12.6 29h6.8v-7.4L16 18.2l-3.4 3.4zM3 12.6v6.8h7.4l3.4-3.4-3.4-3.4zM29 12.6v6.8h-7.4L18.2 16l3.4-3.4z" />
    </svg>
  )
}

function renderNotification(item: { title?: unknown; data?: unknown }): ReactElement {
  const data = (item.data ?? {}) as SlotData
  if (data.kind === "call")
    return <CallNotification state={data.state} since={data.since} avatar={data.avatar} name={String(item.title ?? "")} onAnswer={data.onAnswer} onHangUp={data.onHangUp} />
  return <TextNotification avatar={data.avatar} name={String(item.title ?? "")} />
}

type NotificationSlotProps = Omit<ComponentProps<typeof ToastRegion>, "children"> & {
  // Lays the slot out inside a 1080p GameFrame instead of the viewport corner.
  inline?: boolean
  children?: ComponentProps<typeof ToastRegion>["children"]
}

/* The one bottom-right slot: a ui-sdk ToastRegion that shows a single card. */
function NotificationSlot({ toaster = main.toaster, inline, className, children = renderNotification, ...props }: NotificationSlotProps): ReactElement {
  return (
    <ToastRegion
      side="bottom"
      align="end"
      maxVisible={1}
      shortcut={inline ? null : undefined}
      aria-label="Notifications"
      data-agent-hidden
      {...props}
      toaster={toaster}
      className={merge("ld-slot", className)}
      data-inline={inline || undefined}
    >
      {children}
    </ToastRegion>
  )
}

/* A still of a text card for previews, in 1080p frame pixels. It is not a toast, so it never reaches a toast host. */
function TextCardStill({ name, body }: { name: string; body: string }): ReactElement {
  return (
    <div className="ld-slot" data-slot="notification-still" data-inline="" data-still="" aria-hidden="true">
      <div className="ld-text">
        <DpadHint />
        <span className="ld-text__head" data-slot="notification-head">
          <span className="ld-text__avatar" data-slot="notification-avatar">
            {name.slice(0, 1)}
          </span>
          <b className="ld-text__name">{name}</b>
        </span>
        <p className="ld-text__body">{body}</p>
      </div>
    </div>
  )
}

function LeonidaToasts(): ReactElement {
  return <NotificationSlot />
}

export { CallNotification, LeonidaToasts, NotificationSlot, TextCardStill, TextNotification, answer, call, createSlot, dial, endCall, message, ring, toast }
export type { Slot }
export type { CallState }
