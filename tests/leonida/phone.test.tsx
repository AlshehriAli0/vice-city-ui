import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { settle } from "@ui-sdk/core/testing";
import { createAgent } from "@ui-sdk/react/agent";
import { StrictMode } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { phone } from "../../src/gallery/phone/phone-demos";
import { NotificationSlot } from "../../src/leonida/notifications/mission-toast";
import { createSlot, type Slot } from "../../src/leonida/notifications/notification-store";
import type { PhoneApp } from "../../src/leonida/phone/phone-data";
import { PhoneDrawer, PhoneDrawerContent, PhoneDrawerTrigger } from "../../src/leonida/phone/phone-drawer";
import { PlaygroundView } from "../support/playground-view";

const agent = createAgent();

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  delete document.documentElement.dataset.motion;
});

function Phone({ slot, defaultOpen = false, inCar = false }: { slot: Slot; defaultOpen?: boolean; inCar?: boolean }) {
  return (
    <>
      <PhoneDrawer defaultOpen={defaultOpen} slot={slot}>
        <PhoneDrawerTrigger>Open phone</PhoneDrawerTrigger>
        <PhoneDrawerContent inCar={inCar} />
      </PhoneDrawer>
      <NotificationSlot toaster={slot.toaster} inline />
    </>
  );
}

const wait = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));
const layer = () => document.querySelector<HTMLElement>(".ld-phone-layer");
const view = () => document.querySelector<HTMLElement>('[data-slot="phone-view"]');
const pill = () => document.querySelector('[data-slot="phone-app-name"]');

async function openPhone(options: { inCar?: boolean } = {}) {
  const slot = createSlot();
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Phone slot={slot} defaultOpen inCar={options.inCar} />);
  await wait(400);
  return { user, slot };
}

test("open cuts to black with the prompts on, holds, fades in; close cuts to black before the phone goes", async () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Phone slot={createSlot()} />);
  const trigger = screen.getByRole("button", { name: "Open phone" });
  trigger.focus();
  await user.keyboard("{ArrowUp}");
  const dialog = await screen.findByRole("dialog", { name: "Phone" });
  expect(dialog).toHaveAttribute("data-phase", "black");
  expect(
    within(screen.getByRole("group", { name: "Phone prompts" })).getByRole("button", { name: "Exit" })
  ).toBeInTheDocument();
  await wait(100);
  expect(dialog).toHaveAttribute("data-phase", "fade");
  await wait(200);
  expect(dialog).toHaveAttribute("data-phase", "up");
  expect(screen.getByRole("menuitem", { name: "WhatUp" })).toHaveFocus();

  await user.keyboard("{Escape}");
  expect(dialog).toHaveAttribute("data-phase", "out");
  expect(screen.getByRole("dialog", { name: "Phone" })).toBeInTheDocument();
  await wait(100);
  await act(() => settle());
  expect(screen.queryByRole("dialog", { name: "Phone" })).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();

  await user.click(trigger);
  expect(layer()).toHaveAttribute("data-phase", "black");
  await wait(300);
  expect(screen.getByRole("menuitem", { name: "WhatUp" })).toHaveFocus();
});

test("in a car the black holds longer and the handset sits upright", async () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Phone slot={createSlot()} inCar />);
  await user.click(screen.getByRole("button", { name: "Open phone" }));
  expect(layer()).toHaveAttribute("data-pose", "car");
  await wait(130);
  expect(layer()).toHaveAttribute("data-phase", "black");
  await wait(45);
  expect(layer()).toHaveAttribute("data-phase", "fade");
});

test("the home grid moves by D-pad in four columns without wrapping, and the pill names the focused app", async () => {
  const { user } = await openPhone();
  const apps = screen.getByRole("menu", { name: "Apps" });
  expect(within(apps).getAllByRole("menuitem")).toHaveLength(8);
  expect(
    within(apps)
      .getAllByRole("menuitem")
      .filter(item => item.tabIndex === 0)
  ).toHaveLength(1);
  expect(pill()).toHaveTextContent("WhatUp");
  const step = async (key: string, name: string) => {
    await user.keyboard(`{${key}}`);
    expect(screen.getByRole("menuitem", { name })).toHaveFocus();
    expect(screen.getByRole("menuitem", { name })).toHaveAttribute("data-focused");
    expect(pill()).toHaveTextContent(name);
  };
  await step("ArrowLeft", "WhatUp");
  await step("ArrowRight", "Contacts");
  await step("ArrowDown", "Weather");
  await step("ArrowDown", "Weather");
  await step("ArrowUp", "Contacts");
  await step("ArrowRight", "Fitness");
  await step("ArrowRight", "Snapmatic");
  await step("ArrowRight", "Snapmatic");
  await step("ArrowDown", "Settings");
  await step("ArrowLeft", "WAiNK");
  await step("ArrowUp", "Fitness");
});

test.each([
  ["WhatUp", "whatup", "indigo"],
  ["Contacts", "contacts", "green"],
  ["Fitness", "fitness", "white"],
  ["Snapmatic", "snapmatic", "indigo"],
  ["News", "news", "rose"],
  ["Weather", "weather", "indigo"],
  ["WAiNK", "waink", "indigo"],
  ["Settings", "settings", "indigo"],
])("%s opens, wears its own focus colour, and Back returns to its icon", async (name, id, focus) => {
  const { user } = await openPhone();
  screen.getByRole("menuitem", { name }).focus();
  await user.keyboard("{Enter}");
  expect(view()).toHaveAttribute("data-screen", id);
  expect(view()).toHaveAttribute("data-focus", focus);
  expect(view()).toHaveAttribute("data-motion", "in");
  expect(screen.getByRole("group", { name: "Phone prompts" })).toHaveTextContent(/Back/i);
  await user.keyboard(id === "news" ? "{Backspace}" : "{Escape}");
  expect(view()).toHaveAttribute("data-screen", "home");
  expect(view()).toHaveAttribute("data-motion", "cut");
  expect(screen.getByRole("menuitem", { name })).toHaveFocus();
  expect(pill()).toHaveTextContent(name);
});

test("Back returns to Home from two levels deep in Contacts", async () => {
  const { user } = await openPhone();

  screen.getByRole("menuitem", { name: "Contacts" }).focus();
  await user.keyboard("{Enter}{Enter}");
  expect(view()).toHaveAttribute("data-screen", "contacts-all");
  expect(view()).toHaveAttribute("data-focus", "green");
  await user.keyboard("{ArrowDown}");
  expect(screen.getByRole("menuitem", { name: "Bailey" })).toHaveFocus();
  await user.keyboard("{Escape}");
  expect(view()).toHaveAttribute("data-screen", "contacts");
  await user.keyboard("{Escape}");
  expect(view()).toHaveAttribute("data-screen", "home");
});

test("a WhatUp reply is sent as a bubble with SEND", async () => {
  const { user } = await openPhone();
  await user.keyboard("{Enter}");
  expect(screen.getByRole("menuitem", { name: "Alex, unread" })).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(view()).toHaveAttribute("data-screen", "thread");
  expect(screen.getByText("Messages encrypted")).toBeInTheDocument();
  expect(
    within(screen.getByRole("group", { name: "Phone prompts" })).getByRole("button", { name: "Send" })
  ).toBeInTheDocument();
  await user.click(within(screen.getByRole("group", { name: "Phone prompts" })).getByRole("button", { name: "Send" }));
  expect(screen.queryByRole("menuitem", { name: "Send: Reply option" })).not.toBeInTheDocument();
  expect(screen.getByText("Reply option")).toBeInTheDocument();
  expect(
    within(screen.getByRole("group", { name: "Phone prompts" })).queryByRole("button", { name: "Send" })
  ).not.toBeInTheDocument();
});

test("calling a contact puts the phone away and hands off to the HUD call card", async () => {
  const { user } = await openPhone();
  await user.keyboard("{ArrowRight}{Enter}{Enter}");
  expect(view()).toHaveAttribute("data-screen", "contacts-all");
  await user.keyboard("{Enter}");
  const sheet = screen.getByRole("menu", { name: "Alex actions" });
  expect(
    within(sheet)
      .getAllByRole("menuitem")
      .map(item => item.textContent)
  ).toEqual(["Call", "Open WhatUp", "Open Snapmatic"]);
  expect(screen.getByRole("menuitem", { name: "Call Alex" })).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(layer()).toHaveAttribute("data-phase", "out");
  expect(layer()).toHaveAttribute("data-exit", "call");
  await wait(130);
  await act(() => settle());
  expect(screen.queryByRole("dialog", { name: "Phone" })).not.toBeInTheDocument();
  expect(screen.getByText("Alex")).toBeInTheDocument();
  expect(screen.getByText("Dialing…")).toBeInTheDocument();
  await wait(2000);
  expect(screen.getByText("00:00")).toBeInTheDocument();
  await wait(2000);
  expect(screen.getByText("00:02")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Hang up" }));
  expect(screen.getByText("Call Ended")).toBeInTheDocument();
  await wait(1500);
  await act(() => settle());
  expect(screen.queryByText("Call Ended")).not.toBeInTheDocument();
  expect(document.querySelector('[data-slot="toast"]')).toBeNull();
});

test("an incoming call is answered with D-pad Up", async () => {
  const slot = createSlot();
  render(<NotificationSlot toaster={slot.toaster} inline />);
  act(() => {
    slot.ring("Jason");
  });
  await wait(50);
  expect(screen.getByText("Incoming Call…")).toBeInTheDocument();
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  await user.keyboard("{ArrowUp}");
  expect(screen.getByText("00:00")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Hang up" })).toBeInTheDocument();
  act(() => slot.endCall());
  await wait(1500);
});

test("Square jumps from home to Reminders", async () => {
  const { user } = await openPhone();
  await user.keyboard("x");
  expect(view()).toHaveAttribute("data-screen", "reminders");
  expect(screen.getByRole("menuitem", { name: "Missed call: Contact name" })).toHaveFocus();
  await user.keyboard("{Escape}");
  expect(view()).toHaveAttribute("data-screen", "home");
  await user.click(
    within(screen.getByRole("group", { name: "Phone prompts" })).getByRole("button", { name: "Reminders" })
  );
  expect(view()).toHaveAttribute("data-screen", "reminders");
});

test("the hand's sway stops in Still mode", async () => {
  await openPhone();
  const hold = document.querySelector('[data-slot="phone-hold"]');
  expect(hold).toHaveAttribute("data-sway", "on");
  act(() => {
    document.documentElement.dataset.motion = "still";
  });
  await wait(0);
  expect(hold).toHaveAttribute("data-sway", "off");
  act(() => {
    document.documentElement.dataset.motion = "live";
  });
  await wait(0);
  expect(hold).toHaveAttribute("data-sway", "on");
});

const waitForPhoneBehindTheCutToBlack = () =>
  waitFor(() => expect(agent.snapshot().some(entry => entry.label === "Phone")).toBe(true));

test("an agent finds the phone by name and opens apps through it", async () => {
  render(<PlaygroundView demo={phone.find(demo => demo.id === "phone-drawer")!} />);
  await act(() => settle());
  await waitForPhoneBehindTheCutToBlack();
  const entries = agent.snapshot().filter(entry => !entry.offPage && entry.component !== "more");
  for (const entry of entries) expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
  const labels = entries.map(entry => entry.label);
  for (const label of ["Phone", "Apps", "Select", "Exit"]) expect(labels, `${label} is missing`).toContain(label);
  const apps = entries.find(entry => entry.label === "Apps")!;
  expect(apps.actions).toEqual(expect.arrayContaining(["open", "focusItem"]));

  const opened = await agent.act({ steps: [{ ref: "Apps", action: "open", args: ["Contacts"] }] });
  expect(opened.ok, opened.error?.message).toBe(true);
  await act(() => settle());
  expect(view()).toHaveAttribute("data-screen", "contacts");
  expect(screen.getByRole("combobox", { name: "App" })).toHaveTextContent("Contacts");

  const deeper = await agent.act({ steps: [{ ref: "Contacts", action: "open", args: ["All Contacts"] }] });
  expect(deeper.ok, deeper.error?.message).toBe(true);
  await act(() => settle());
  expect(view()).toHaveAttribute("data-screen", "contacts-all");

  const missing = await agent.act({ steps: [{ ref: "All contacts", action: "open", args: ["Nobody"] }] });
  expect(missing.ok).toBe(false);
  expect(missing.error?.message).toMatch(/Alex/);
});

const hold = () => document.querySelector<HTMLElement>('[data-slot="phone-hold"]');

function Controlled({
  app,
  inCar = false,
  onAppChange,
}: {
  app?: PhoneApp;
  inCar?: boolean;
  onAppChange?: (app: PhoneApp) => void;
}) {
  return (
    <PhoneDrawer defaultOpen app={app} onAppChange={onAppChange} slot={createSlot()}>
      <PhoneDrawerTrigger>Open phone</PhoneDrawerTrigger>
      <PhoneDrawerContent inCar={inCar} />
    </PhoneDrawer>
  );
}

test("a close during the black hold stays black: the open's timers don't bring the phone back", async () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Phone slot={createSlot()} />);
  screen.getByRole("button", { name: "Open phone" }).focus();
  await user.keyboard("{ArrowUp}");
  await wait(40);
  expect(layer()).toHaveAttribute("data-phase", "black");
  await user.keyboard("{Escape}");
  expect(layer()).toHaveAttribute("data-phase", "out");
  await wait(70);
  expect(layer()).toHaveAttribute("data-phase", "out");
  await wait(40);
  await act(() => settle());
  expect(screen.queryByRole("dialog", { name: "Phone" })).not.toBeInTheDocument();
  await wait(300);
  expect(screen.queryByRole("dialog", { name: "Phone" })).not.toBeInTheDocument();
});

test("a close during the fade isn't overturned by the fade's end", async () => {
  await openPhone();
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  await user.keyboard("{Escape}");
  await wait(110);
  await act(() => settle());
  await user.click(screen.getByRole("button", { name: "Open phone" }));
  await wait(250);
  expect(layer()).toHaveAttribute("data-phase", "fade");
  await user.keyboard("{Escape}");
  await wait(60);
  expect(layer()).toHaveAttribute("data-phase", "out");
});

test("the settle holds its start pose from the first black frame, and Still never replays it", async () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Phone slot={createSlot()} />);
  await user.click(screen.getByRole("button", { name: "Open phone" }));
  expect(layer()).toHaveAttribute("data-phase", "black");
  expect(hold()).toHaveAttribute("data-settle");
  expect(hold()).toHaveAttribute("data-sway", "on");
  await wait(400);
  act(() => {
    document.documentElement.dataset.motion = "still";
  });
  await wait(0);
  expect(hold()).not.toHaveAttribute("data-settle");
  expect(hold()).toHaveAttribute("data-sway", "off");
  act(() => {
    document.documentElement.dataset.motion = "live";
  });
  await wait(0);
  expect(hold()).toHaveAttribute("data-sway", "on");
  expect(hold()).not.toHaveAttribute("data-settle");
});

test("opened in Still mode the handset rests: no settle", async () => {
  document.documentElement.dataset.motion = "still";
  await openPhone();
  expect(hold()).not.toHaveAttribute("data-settle");
  expect(hold()).toHaveAttribute("data-sway", "off");
});

test("mounting open never scrolls the page to the phone, even under StrictMode", async () => {
  const focus = vi.spyOn(HTMLElement.prototype, "focus");
  render(
    <StrictMode>
      <Phone slot={createSlot()} defaultOpen />
    </StrictMode>
  );
  await wait(400);
  expect(screen.getByRole("menuitem", { name: "WhatUp" })).toHaveFocus();
  expect(focus.mock.calls.filter(([options]) => !options?.preventScroll)).toEqual([]);
  focus.mockRestore();
});

test("putting the phone away doesn't bounce focus onto the home grid on its way out", async () => {
  const { user } = await openPhone();
  screen.getByRole("menuitem", { name: "Contacts" }).focus();
  await user.keyboard("{Enter}{Enter}{Enter}");
  expect(screen.getByRole("menuitem", { name: "Call Alex" })).toHaveFocus();
  const landed: string[] = [];
  const track = (event: FocusEvent) => {
    if (event.target instanceof HTMLElement) landed.push(event.target.getAttribute("aria-label") ?? "");
  };
  document.addEventListener("focusin", track);
  await user.keyboard("{Enter}");
  await wait(130);
  await act(() => settle());
  document.removeEventListener("focusin", track);
  expect(landed).not.toContain("WhatUp");
  expect(screen.getByRole("button", { name: "Open phone" })).toHaveFocus();
});

test("an avatar with a picture doesn't flash its initial before the picture", async () => {
  const { user } = await openPhone();
  screen.getByRole("menuitem", { name: "Fitness" }).focus();
  await user.keyboard("{Enter}");
  const face = document.querySelector(".ld-fit__head .ld-face")!;
  expect(face.querySelector(".ld-face__fallback")).toBeNull();
  await wait(650);
  expect(face.querySelector(".ld-face__fallback")).toHaveTextContent("J");
  await user.keyboard("{Escape}");
  screen.getByRole("menuitem", { name: "WhatUp" }).focus();
  await user.keyboard("{Enter}");
  expect(screen.getByRole("menuitem", { name: "Alex, unread" })).toHaveTextContent("A");
});

test("getting in a car while the phone is up cuts to black instead of jumping the handset", async () => {
  const { rerender } = render(<Controlled />);
  await wait(400);
  expect(layer()).toHaveAttribute("data-phase", "up");
  rerender(<Controlled inCar />);
  expect(layer()).toHaveAttribute("data-pose", "car");
  expect(layer()).toHaveAttribute("data-phase", "black");
  await wait(170);
  expect(layer()).toHaveAttribute("data-phase", "fade");
  await wait(190);
  expect(layer()).toHaveAttribute("data-phase", "up");
  expect(screen.getByRole("menuitem", { name: "WhatUp" })).toHaveFocus();
});

test("an app picked from outside opens like one picked on the phone, even after a Back", async () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const { rerender } = render(<Controlled app="news" />);
  await wait(400);
  await user.keyboard("{Enter}");
  expect(view()).toHaveAttribute("data-screen", "article");
  await user.keyboard("{Escape}");
  expect(view()).toHaveAttribute("data-motion", "cut");
  rerender(<Controlled app="weather" />);
  expect(view()).toHaveAttribute("data-screen", "weather");
  expect(view()).toHaveAttribute("data-motion", "in");
});

test("the ringtone and wallpaper pickers open on the current choice", async () => {
  const { user } = await openPhone();
  screen.getByRole("menuitem", { name: "Settings" }).focus();
  await user.keyboard("{Enter}{ArrowDown}{Enter}");
  expect(view()).toHaveAttribute("data-screen", "ringtone");
  expect(screen.getByRole("menuitem", { name: "Beeps, selected" })).toHaveFocus();
  await user.keyboard("{Escape}{ArrowUp}{Enter}");
  expect(view()).toHaveAttribute("data-screen", "wallpaper");
  expect(screen.getByRole("menuitem", { name: "Circles, current" })).toHaveFocus();
});

test("changing the app from a page control leaves focus on that control", async () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const { rerender } = render(
    <>
      <button type="button">Examples</button>
      <Controlled app="home" />
    </>
  );
  await wait(400);
  const outside = screen.getByRole("button", { name: "Examples" });
  await user.click(outside);
  rerender(
    <>
      <button type="button">Examples</button>
      <Controlled app="whatup" />
    </>
  );
  expect(view()).toHaveAttribute("data-screen", "whatup");
  expect(outside).toHaveFocus();

  await user.click(screen.getByRole("menuitem", { name: "Jordan" }));
  expect(view()).toHaveAttribute("data-screen", "thread");
  expect(view()).toHaveFocus();
});

test("the D-pad never scrolls the page, even on a screen with nothing to focus", async () => {
  const { user } = await openPhone();
  screen.getByRole("menuitem", { name: "Weather" }).focus();
  await user.keyboard("{Enter}");
  expect(view()).toHaveAttribute("data-screen", "weather");
  expect(view()).toHaveFocus();
  for (const key of ["ArrowDown", "ArrowUp", "PageDown"]) {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    view()!.dispatchEvent(event);
    expect(event.defaultPrevented, key).toBe(true);
  }
});

test("the demo's trigger says what it will do: put the phone away while it's up, open it once it's down", async () => {
  const user = userEvent.setup();
  render(<PlaygroundView demo={phone.find(demo => demo.id === "phone-drawer")!} />);
  await user.click(screen.getByRole("button", { name: "Put phone away" }));
  const open = await screen.findByRole("button", { name: "Open phone" }, { timeout: 2000 });
  await user.click(open);
  expect(await screen.findByRole("button", { name: "Put phone away" }, { timeout: 2000 })).toBeInTheDocument();
});
