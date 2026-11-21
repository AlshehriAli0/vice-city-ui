import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { settle } from "@ui-sdk/core/testing"
import { createAgent } from "@ui-sdk/react/agent"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { phone } from "../src/gallery/phone"
import { NotificationSlot, createSlot, type Slot } from "../src/leonida/mission-toast"
import { PhoneDrawer, PhoneDrawerContent, PhoneDrawerTrigger } from "../src/leonida/phone-drawer"
import { PlaygroundView } from "../src/site/playground"

const agent = createAgent()

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

afterEach(() => {
  vi.useRealTimers()
  delete document.documentElement.dataset.motion
})

function Phone({ slot, defaultOpen = false, inCar = false }: { slot: Slot; defaultOpen?: boolean; inCar?: boolean }) {
  return (
    <>
      <PhoneDrawer defaultOpen={defaultOpen} slot={slot}>
        <PhoneDrawerTrigger>Open phone</PhoneDrawerTrigger>
        <PhoneDrawerContent inCar={inCar} />
      </PhoneDrawer>
      <NotificationSlot toaster={slot.toaster} inline />
    </>
  )
}

const wait = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms))
const layer = () => document.querySelector<HTMLElement>(".ld-phone-layer")
const view = () => document.querySelector<HTMLElement>('[data-slot="phone-view"]')
const pill = () => document.querySelector('[data-slot="phone-app-name"]')

async function openPhone(options: { inCar?: boolean } = {}) {
  const slot = createSlot()
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  render(<Phone slot={slot} defaultOpen inCar={options.inCar} />)
  await wait(400)
  return { user, slot }
}

test("open cuts to black with the prompts on, holds, fades in; close cuts to black before the phone goes", async () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  render(<Phone slot={createSlot()} />)
  const trigger = screen.getByRole("button", { name: "Open phone" })
  trigger.focus()
  await user.keyboard("{ArrowUp}")
  const dialog = await screen.findByRole("dialog", { name: "Phone" })
  expect(dialog).toHaveAttribute("data-phase", "black")
  expect(within(screen.getByRole("group", { name: "Phone prompts" })).getByRole("button", { name: "Exit" })).toBeInTheDocument()
  await wait(100)
  expect(dialog).toHaveAttribute("data-phase", "fade")
  await wait(200)
  expect(dialog).toHaveAttribute("data-phase", "up")
  expect(screen.getByRole("menuitem", { name: "WhatUp" })).toHaveFocus()

  await user.keyboard("{Escape}")
  expect(dialog).toHaveAttribute("data-phase", "out")
  expect(screen.getByRole("dialog", { name: "Phone" })).toBeInTheDocument()
  await wait(100)
  await act(() => settle())
  expect(screen.queryByRole("dialog", { name: "Phone" })).not.toBeInTheDocument()
  expect(trigger).toHaveFocus()

  // Re-opening starts the sequence again, on home with WhatUp focused.
  await user.click(trigger)
  expect(layer()).toHaveAttribute("data-phase", "black")
  await wait(300)
  expect(screen.getByRole("menuitem", { name: "WhatUp" })).toHaveFocus()
})

test("in a car the black holds longer and the handset sits upright", async () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  render(<Phone slot={createSlot()} inCar />)
  await user.click(screen.getByRole("button", { name: "Open phone" }))
  expect(layer()).toHaveAttribute("data-pose", "car")
  await wait(130)
  expect(layer()).toHaveAttribute("data-phase", "black")
  await wait(45)
  expect(layer()).toHaveAttribute("data-phase", "fade")
})

test("the home grid moves by D-pad in four columns without wrapping, and the pill names the focused app", async () => {
  const { user } = await openPhone()
  const apps = screen.getByRole("menu", { name: "Apps" })
  expect(within(apps).getAllByRole("menuitem")).toHaveLength(8)
  expect(within(apps).getAllByRole("menuitem").filter((item) => item.tabIndex === 0)).toHaveLength(1)
  expect(pill()).toHaveTextContent("WhatUp")
  const step = async (key: string, name: string) => {
    await user.keyboard(`{${key}}`)
    expect(screen.getByRole("menuitem", { name })).toHaveFocus()
    expect(screen.getByRole("menuitem", { name })).toHaveAttribute("data-focused")
    expect(pill()).toHaveTextContent(name)
  }
  await step("ArrowLeft", "WhatUp")
  await step("ArrowRight", "Contacts")
  await step("ArrowDown", "Weather")
  await step("ArrowDown", "Weather")
  await step("ArrowUp", "Contacts")
  await step("ArrowRight", "Fitness")
  await step("ArrowRight", "Snapmatic")
  await step("ArrowRight", "Snapmatic")
  await step("ArrowDown", "Settings")
  await step("ArrowLeft", "WAiNK")
  await step("ArrowUp", "Fitness")
})

test("each app opens, wears its own focus colour, and Back returns to its icon", async () => {
  const { user } = await openPhone()
  const apps: [string, string, string][] = [
    ["WhatUp", "whatup", "indigo"],
    ["Contacts", "contacts", "green"],
    ["Fitness", "fitness", "white"],
    ["Snapmatic", "snapmatic", "indigo"],
    ["News", "news", "rose"],
    ["Weather", "weather", "indigo"],
    ["WAiNK", "waink", "indigo"],
    ["Settings", "settings", "indigo"],
  ]
  for (const [name, id, focus] of apps) {
    screen.getByRole("menuitem", { name }).focus()
    await user.keyboard("{Enter}")
    expect(view()).toHaveAttribute("data-screen", id)
    expect(view()).toHaveAttribute("data-focus", focus)
    expect(view()).toHaveAttribute("data-motion", "in")
    expect(screen.getByRole("group", { name: "Phone prompts" })).toHaveTextContent(/Back/i)
    await user.keyboard(id === "news" ? "{Backspace}" : "{Escape}")
    expect(view()).toHaveAttribute("data-screen", "home")
    expect(view()).toHaveAttribute("data-motion", "cut")
    expect(screen.getByRole("menuitem", { name })).toHaveFocus()
    expect(pill()).toHaveTextContent(name)
  }

  // Two levels deep: All Contacts, then out one level at a time.
  screen.getByRole("menuitem", { name: "Contacts" }).focus()
  await user.keyboard("{Enter}{Enter}")
  expect(view()).toHaveAttribute("data-screen", "contacts-all")
  expect(view()).toHaveAttribute("data-focus", "green")
  await user.keyboard("{ArrowDown}")
  expect(screen.getByRole("menuitem", { name: "Bailey" })).toHaveFocus()
  await user.keyboard("{Escape}")
  expect(view()).toHaveAttribute("data-screen", "contacts")
  await user.keyboard("{Escape}")
  expect(view()).toHaveAttribute("data-screen", "home")
})

test("a WhatUp reply is sent as a bubble with SEND", async () => {
  const { user } = await openPhone()
  await user.keyboard("{Enter}")
  expect(screen.getByRole("menuitem", { name: "Alex, unread" })).toHaveFocus()
  await user.keyboard("{Enter}")
  expect(view()).toHaveAttribute("data-screen", "thread")
  expect(screen.getByText("Messages encrypted")).toBeInTheDocument()
  expect(within(screen.getByRole("group", { name: "Phone prompts" })).getByRole("button", { name: "Send" })).toBeInTheDocument()
  await user.click(within(screen.getByRole("group", { name: "Phone prompts" })).getByRole("button", { name: "Send" }))
  expect(screen.queryByRole("menuitem", { name: "Send: Reply option" })).not.toBeInTheDocument()
  expect(screen.getByText("Reply option")).toBeInTheDocument()
  expect(within(screen.getByRole("group", { name: "Phone prompts" })).queryByRole("button", { name: "Send" })).not.toBeInTheDocument()
})

test("calling a contact puts the phone away and hands off to the HUD call card", async () => {
  const { user } = await openPhone()
  await user.keyboard("{ArrowRight}{Enter}{Enter}")
  expect(view()).toHaveAttribute("data-screen", "contacts-all")
  await user.keyboard("{Enter}")
  const sheet = screen.getByRole("menu", { name: "Alex actions" })
  expect(within(sheet).getAllByRole("menuitem").map((item) => item.textContent)).toEqual(["Call", "Open WhatUp", "Open Snapmatic"])
  expect(screen.getByRole("menuitem", { name: "Call Alex" })).toHaveFocus()
  await user.keyboard("{Enter}")
  expect(layer()).toHaveAttribute("data-phase", "out")
  expect(layer()).toHaveAttribute("data-exit", "call")
  await wait(130)
  await act(() => settle())
  expect(screen.queryByRole("dialog", { name: "Phone" })).not.toBeInTheDocument()
  expect(screen.getByText("Alex")).toBeInTheDocument()
  expect(screen.getByText("Dialing…")).toBeInTheDocument()
  await wait(2000)
  expect(screen.getByText("00:00")).toBeInTheDocument()
  await wait(2000)
  expect(screen.getByText("00:02")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "Hang up" }))
  expect(screen.getByText("Call Ended")).toBeInTheDocument()
  await wait(1500)
  await act(() => settle())
  expect(screen.queryByText("Call Ended")).not.toBeInTheDocument()
  expect(document.querySelector('[data-slot="toast"]')).toBeNull()
})

test("an incoming call is answered with D-pad Up", async () => {
  const slot = createSlot()
  render(<NotificationSlot toaster={slot.toaster} inline />)
  act(() => {
    slot.ring("Jason")
  })
  await wait(50)
  expect(screen.getByText("Incoming Call…")).toBeInTheDocument()
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  await user.keyboard("{ArrowUp}")
  expect(screen.getByText("00:00")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "Hang up" })).toBeInTheDocument()
  act(() => slot.endCall())
  await wait(1500)
})

test("Square jumps from home to Reminders", async () => {
  const { user } = await openPhone()
  await user.keyboard("x")
  expect(view()).toHaveAttribute("data-screen", "reminders")
  expect(screen.getByRole("menuitem", { name: "Missed call: Contact name" })).toHaveFocus()
  await user.keyboard("{Escape}")
  expect(view()).toHaveAttribute("data-screen", "home")
  await user.click(within(screen.getByRole("group", { name: "Phone prompts" })).getByRole("button", { name: "Reminders" }))
  expect(view()).toHaveAttribute("data-screen", "reminders")
})

test("the hand's sway stops in Still mode", async () => {
  await openPhone()
  const hold = document.querySelector('[data-slot="phone-hold"]')
  expect(hold).toHaveAttribute("data-sway", "on")
  act(() => {
    document.documentElement.dataset.motion = "still"
  })
  await wait(0)
  expect(hold).toHaveAttribute("data-sway", "off")
  act(() => {
    document.documentElement.dataset.motion = "live"
  })
  await wait(0)
  expect(hold).toHaveAttribute("data-sway", "on")
})

test("an agent finds the phone by name and opens apps through it", async () => {
  render(<PlaygroundView demo={phone.find((demo) => demo.id === "phone-drawer")!} />)
  await act(() => settle())
  const entries = agent.snapshot().filter((entry) => !entry.offPage && entry.component !== "more")
  for (const entry of entries) expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy()
  const labels = entries.map((entry) => entry.label)
  for (const label of ["Phone", "Apps", "Select", "Exit"]) expect(labels, `${label} is missing`).toContain(label)
  const apps = entries.find((entry) => entry.label === "Apps")!
  expect(apps.actions).toEqual(expect.arrayContaining(["open", "focusItem"]))

  const opened = await agent.act({ steps: [{ ref: "Apps", action: "open", args: ["Contacts"] }] })
  expect(opened.ok, opened.error?.message).toBe(true)
  await act(() => settle())
  expect(view()).toHaveAttribute("data-screen", "contacts")
  expect(screen.getByRole("combobox", { name: "App" })).toHaveTextContent("Contacts")

  const deeper = await agent.act({ steps: [{ ref: "Contacts", action: "open", args: ["All Contacts"] }] })
  expect(deeper.ok, deeper.error?.message).toBe(true)
  await act(() => settle())
  expect(view()).toHaveAttribute("data-screen", "contacts-all")

  const missing = await agent.act({ steps: [{ ref: "All contacts", action: "open", args: ["Nobody"] }] })
  expect(missing.ok).toBe(false)
  expect(missing.error?.message).toMatch(/Alex/)
})
