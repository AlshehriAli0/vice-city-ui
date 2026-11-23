import { lazy, useEffect, useState } from "react";

import { NotificationSlot, TextCardStill } from "../../leonida/notifications/mission-toast";
import { createSlot, type CallState, type Slot } from "../../leonida/notifications/notification-store";
import { GameFrame, NeutralScene } from "../../leonida/shared/menu-backdrop";

import "../shared/overlays.css";
import type { Demo, Playground } from "../demo";
import { optionValue } from "../shared/options";
import { useAction } from "../shared/use-action";
import { APP_OPTIONS } from "./phone-options";

const PhoneDemo = lazy(() => import("./phone-demo").then(module => ({ default: module.PhoneDemo })));

type Card = "text" | CallState;

const deliverCard = (slot: Slot, card: Card, name: string, body: string): void => {
  if (card === "text") slot.message(name, body);
  else if (card === "dialing") slot.dial(name);
  else slot.call(name, card);
};

const createCardPreview = (card: Card, name: string, body: string) => {
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
};

const NotificationDemo = ({ values, subscribeAction }: Playground) => {
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
};

const CARDS: { value: Card; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "incoming", label: "Incoming" },
  { value: "dialing", label: "Dialing" },
  { value: "connected", label: "Connected" },
];

const notificationCode = ({ card, name, body }: Playground["values"]): string => {
  const host = "<LeonidaToasts />\n\n";
  if (card === "text") return `${host}message("${name}", "${body}")`;
  if (card === "dialing") return `${host}dial("${name}")`;
  if (card === "incoming") return `${host}ring("${name}")`;
  return `${host}call("${name}", "connected")`;
};

const NOTIFICATION_CROP = { x: 1420, y: 880, w: 500, h: 200 };

const phone: Demo[] = [
  {
    id: "phone-drawer",
    source: {
      "phone-drawer.tsx": () => import("../../leonida/phone/phone-drawer.tsx?raw"),
      "phone-drawer.css": () => import("../../leonida/phone/phone-drawer.css?raw"),
    },
    blurb: "Contacts, messages and calls, one cut to black away.",
    captureCrop: { x: 585, y: 60, w: 660, h: 1000 },
    detailFrame: "phone",
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
    source: {
      "mission-toast.tsx": () => import("../../leonida/notifications/mission-toast.tsx?raw"),
      "mission-toast.css": () => import("../../leonida/notifications/mission-toast.css?raw"),
    },
    blurb: "Texts and calls land bottom right, one at a time.",
    captureCrop: NOTIFICATION_CROP,
    detailCrop: NOTIFICATION_CROP,
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
