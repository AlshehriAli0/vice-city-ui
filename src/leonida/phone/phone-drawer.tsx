import { DialogContent, DialogDescription, DialogTitle } from "@ui-sdk/react/dialog";
import {
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type ComponentProps,
  type Ref,
  type RefObject,
} from "react";

import { merge } from "../../shared/class-names";
import { dial as mainDial } from "../notifications/notification-store";
import { NeutralScene } from "../shared/menu-backdrop";
import { SCREENS } from "./apps/app-screens";
import { DrawerPrompts } from "./drawer-prompts";
import { ACCENT, PhoneContext, findApp, type Entry, type PhoneState } from "./phone-data";
import { useRoot } from "./phone-drawer-context";
import { HomeScreen } from "./phone-home";
import type { Weather } from "./phone-icons";
import { usePhonePhase } from "./use-phone-phase";
import { usePhoneShortcuts } from "./use-phone-shortcuts";

import "../shared/game-ui.css";
import "./phone-drawer.css";
import "./apps/phone-apps.css";

// what: The hand's sway stops in the site's Still mode and under reduced motion.
const subscribeMotion = (change: () => void): (() => void) => {
  const observer = new MutationObserver(change);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", change);
  return () => {
    observer.disconnect();
    query.removeEventListener("change", change);
  };
};

const useSway = (): boolean =>
  useSyncExternalStore(
    subscribeMotion,
    () =>
      document.documentElement.dataset.motion !== "still" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );

type HandsetProps = {
  view: Ref<HTMLDivElement>;
  entry: Entry;
  depth: number;
  motion: PhoneState["motion"];
  sway: boolean;
  settle: boolean;
};

const Handset = ({ view, entry, depth, motion, sway, settle }: HandsetProps) => {
  const Screen = SCREENS[entry.screen];
  return (
    <div className="ld-phone-world" data-slot="phone-world">
      <NeutralScene tone="day" />
      <div
        className="ld-phone-hold"
        data-slot="phone-hold"
        data-sway={sway ? "on" : "off"}
        data-settle={settle ? "" : undefined}
      >
        <div className="ld-phone" data-slot="phone">
          <i className="ld-phone__speaker" aria-hidden="true" />
          <div className="ld-phone__screen" data-slot="phone-screen">
            <div
              ref={view}
              key={`${depth}-${entry.screen}-${entry.param ?? ""}`}
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
  );
};

type PhoneDrawerContentProps = Omit<ComponentProps<typeof DialogContent>, "children"> & {
  time?: string;
  owner?: string;
  temperature?: number;
  weather?: Weather;
  inCar?: boolean;
  reminders?: number;
};

const PAGE_SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown"]);

const usePhoneScreenFocus = (
  screenKey: string,
  canMoveFocus: boolean,
  content: RefObject<HTMLDivElement | null>,
  view: RefObject<HTMLDivElement | null>
) => {
  const shown = useRef(screenKey);

  useLayoutEffect(() => {
    if (shown.current === screenKey) return;
    shown.current = screenKey;
    if (!canMoveFocus) return;
    const active = document.activeElement;
    if (active && active !== document.body && !content.current?.contains(active)) return;
    const items = view.current?.querySelectorAll<HTMLElement>('[data-slot="phone-menu-item"][tabindex="0"]');
    const target = items?.[items.length - 1] ?? view.current ?? content.current;
    target?.focus({ preventScroll: false });
  }, [screenKey, canMoveFocus, content, view]);
};

const PhoneDrawerContent = ({
  time = "8:00 am",
  owner = "Jason",
  temperature = 72,
  weather = "sun",
  inCar = false,
  reminders = 4,
  className,
  ...props
}: PhoneDrawerContentProps) => {
  const root = useRoot();
  const sway = useSway();
  const { phase, exit, setExit, settle, close } = usePhonePhase(root.open, inCar, sway, () => root.setOpen(false));
  const content = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const stack = root.stack;
  const entry = stack[stack.length - 1];

  const patchTop = (patch: Partial<Entry>) => {
    root.setStack(all => [...all.slice(0, -1), { ...all[all.length - 1], ...patch }]);
  };

  const phone: PhoneState = {
    entry,
    depth: stack.length,
    motion: root.motion,
    owner,
    time,
    temperature,
    weather,
    inCar,
    wallpaper: root.wallpaper,
    ringtone: root.ringtone,
    sent: root.sent,
    reminders,
    go: next => {
      root.setStack(all => [...all, { focus: null, ...next }], "in");
      if (stack.length === 1) root.reportApp(findApp(next.screen) ?? "home");
    },
    back: () => {
      if (entry.sheet) {
        patchTop({ sheet: undefined });
      } else if (stack.length === 1) {
        close();
      } else {
        root.setStack(all => all.slice(0, -1), "cut");
        if (stack.length === 2) root.reportApp("home");
      }
    },
    setFocus: focus => patchTop({ focus }),
    update: patchTop,
    setWallpaper: root.setWallpaper,
    setRingtone: root.setRingtone,
    send: thread => root.setSent(all => [...all, thread]),
    call: contact => {
      setExit("call");
      close(130, () => (root.slot ? root.slot.dial(contact.name) : mainDial(contact.name)));
    },
    close,
  };
  const { registerDismiss } = root;
  const dismissBack = useEffectEvent(phone.back);
  const dismissClose = useEffectEvent(() => close());
  useLayoutEffect(
    () =>
      registerDismiss(
        () => dismissBack(),
        () => dismissClose()
      ),
    [registerDismiss]
  );

  const screenKey = `${stack.length}-${entry.screen}-${entry.param ?? ""}-${entry.sheet ?? ""}`;
  usePhoneScreenFocus(screenKey, root.open && phase !== "out", content, view);

  const select = () => {
    const items = view.current?.querySelectorAll<HTMLElement>('[data-slot="phone-menu-item"][tabindex="0"]');
    items?.[items.length - 1]?.click();
  };
  const square = usePhoneShortcuts(content, phone);

  const initialFocus = () =>
    content.current?.querySelector<HTMLElement>(
      '[data-slot="phone-view"] [data-slot="phone-menu-item"][tabindex="0"]'
    ) ??
    view.current ??
    content.current;

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
        initialFocus={initialFocus}
        onKeyDown={event => {
          props.onKeyDown?.(event);
          if (PAGE_SCROLL_KEYS.has(event.key)) event.preventDefault();
        }}
      >
        <DialogTitle className="ld-sr">Phone</DialogTitle>
        <DialogDescription className="ld-sr">{reminders} notifications</DialogDescription>
        <Handset view={view} entry={entry} depth={stack.length} motion={root.motion} sway={sway} settle={settle} />
        <div className="ld-phone-curtain" data-slot="phone-curtain" aria-hidden="true" />
        <DrawerPrompts phone={phone} onSelect={select} onSquare={square} />
      </DialogContent>
    </PhoneContext>
  );
};

export { PhoneDrawer, PhoneDrawerTrigger } from "./phone-drawer-context";
export { PhoneDrawerContent };
export type { PhoneDrawerProps } from "./phone-drawer-context";
export type { PhoneDrawerContentProps };
