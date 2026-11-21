import { useEffect, useState } from "react";

import { HudCash } from "../leonida/hud-meters";
import { GameFrame, NeutralScene } from "../leonida/menu-backdrop";
import { NotificationSlot, TextCardStill } from "../leonida/mission-toast";
import { createSlot, type CallState, type Slot } from "../leonida/mission-toast.store";
import type { PhoneApp } from "../leonida/phone-data";
import { PhoneDrawer, PhoneDrawerContent, PhoneDrawerTrigger } from "../leonida/phone-drawer";

import "./overlays.css";
import { optionValue } from "./options";
import type { Demo, Playground } from "./types";
import { useAction } from "./use-action";
import { useMirroredControl } from "./use-mirrored-control";

type Card = "text" | CallState;

function deliverCard(slot: Slot, card: Card, name: string, body: string): void {
  if (card === "text") slot.message(name, body);
  else if (card === "dialing") slot.dial(name);
  else slot.call(name, card);
}

function createCardPreview(card: Card, name: string, body: string) {
  const slot = createSlot();
  const initial = { card, name, body };
  let previous = initial;

  return {
    slot,
    initial,
    sync: (nextCard: Card, nextName: string, nextBody: string) => {
      const unchanged = previous.card === nextCard && previous.name === nextName && previous.body === nextBody;
      if (unchanged) return;

      previous = { card: nextCard, name: nextName, body: nextBody };
      deliverCard(slot, nextCard, nextName, nextBody);
    },
  };
}

function NotificationDemo({ values, subscribeAction }: Playground) {
  const card = optionValue(values.card, CARDS) ?? "text";
  const name = String(values.name);
  const body = String(values.body);
  const [preview] = useState(() => createCardPreview(card, name, body));
  const { slot, initial: still } = preview;
  const edited = card !== still.card || name !== still.name || body !== still.body;
  const [live, setLive] = useState(false);
  if (edited && !live) setLive(true);

  useEffect(() => {
    preview.sync(card, name, body);
  }, [preview, card, name, body]);

  useAction(subscribeAction, "again", () => {
    setLive(true);
    deliverCard(slot, card, name, body);
  });
  useAction(subscribeAction, "answer", () => {
    setLive(true);
    slot.answer();
  });
  useAction(subscribeAction, "hangUp", () => {
    setLive(true);
    slot.endCall();
  });

  return (
    <div className="ov-demo">
      <div className="ov-demo__frame">
        <GameFrame>
          <NeutralScene />
          <NotificationSlot toaster={slot.toaster} inline />
          {!live && <TextCardStill name={still.name} body={still.body} />}
        </GameFrame>
      </div>
    </div>
  );
}

function PhoneDemo({ values, set }: Playground) {
  const [slot] = useState(createSlot);
  const [open, setOpen] = useMirroredControl(Boolean(values.open), next => set("open", next));
  const [app, setApp] = useMirroredControl(optionValue(values.app, APP_OPTIONS) ?? "home", next => set("app", next));
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
          <PhoneDrawerTrigger className="g-btn">{open ? "Put phone away" : "Open phone"}</PhoneDrawerTrigger>
        </div>
      </PhoneDrawer>
    </div>
  );
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
];

const CARDS: { value: Card; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "incoming", label: "Incoming" },
  { value: "dialing", label: "Dialing" },
  { value: "connected", label: "Connected" },
];

function notificationCode({ card, name, body }: Playground["values"]): string {
  const host = "<LeonidaToasts />\n\n";
  if (card === "text") return `${host}message("${name}", "${body}")`;
  if (card === "dialing") return `${host}dial("${name}")`;
  if (card === "incoming") return `${host}ring("${name}")`;
  return `${host}call("${name}", "connected")`;
}

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
    code: v => `const slot = createSlot()

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
    render: playground => <PhoneDemo {...playground} />,
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
    code: notificationCode,
    render: playground => <NotificationDemo {...playground} />,
  },
];

export { phone };
