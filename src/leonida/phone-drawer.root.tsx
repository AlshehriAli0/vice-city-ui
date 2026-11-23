import { Dialog, DialogTrigger } from "@ui-sdk/react/dialog";
import { createContext, use, useCallback, useRef, useState, type ComponentProps, type ReactNode } from "react";

import type { Slot } from "./mission-toast.store";
import { findApp, type Entry, type PhoneApp } from "./phone-data";

const home = (focus: string | null = "whatup"): Entry => ({ screen: "home", focus });

const stackFor = (app: PhoneApp): Entry[] => {
  if (app === "home") return [home()];
  return [home(app), { screen: app, focus: null }];
};

const appOf = (stack: Entry[]): PhoneApp => findApp(stack.at(1)?.screen) ?? "home";

type Motion = "in" | "cut";

type Root = {
  open: boolean;
  setOpen: (open: boolean) => void;
  stack: Entry[];
  motion: Motion;
  setStack: (next: (stack: Entry[]) => Entry[], motion?: Motion) => void;
  wallpaper: string;
  setWallpaper: (id: string) => void;
  ringtone: string;
  setRingtone: (name: string) => void;
  sent: string[];
  setSent: (next: (sent: string[]) => string[]) => void;
  slot?: Slot;
  registerDismiss: (onBack: () => void, onClose: () => void) => () => void;
  reportApp: (app: PhoneApp) => void;
};

const RootContext = createContext<Root | null>(null);

const useRoot = (): Root => {
  "use memo";

  const root = use(RootContext);
  if (!root) throw new Error("Phone parts must be inside PhoneDrawer");
  return root;
};

type PhoneDrawerProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  app?: PhoneApp;
  defaultApp?: PhoneApp;
  onAppChange?: (app: PhoneApp) => void;
  slot?: Slot;
  children?: ReactNode;
};

const PhoneDrawer = ({
  open,
  defaultOpen = false,
  onOpenChange,
  app,
  defaultApp = "home",
  onAppChange,
  slot,
  children,
}: PhoneDrawerProps) => {
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const isOpen = open ?? ownOpen;
  const [nav, setNav] = useState<{ stack: Entry[]; motion: Motion }>(() => ({
    stack: stackFor(app ?? defaultApp),
    motion: "in",
  }));
  const stack = nav.stack;
  const setStack = (next: (stack: Entry[]) => Entry[], motion?: Motion) =>
    setNav(now => ({ stack: next(now.stack), motion: motion ?? now.motion }));
  const [seenApp, setSeenApp] = useState(app);
  if (app !== seenApp) {
    setSeenApp(app);
    if (app !== undefined && app !== appOf(stack)) setNav({ stack: stackFor(app), motion: "in" });
  }
  const currentApp = appOf(stack);

  const reportApp = (next: PhoneApp) => {
    if (next !== currentApp && next !== app) onAppChange?.(next);
  };

  const [wallpaper, setWallpaper] = useState("default");
  const [ringtone, setRingtone] = useState("Beeps");
  const [sent, setSent] = useState<string[]>([]);
  const dismiss = useRef<{ back: () => void; close: () => void } | null>(null);
  const registerDismiss = useCallback((back: () => void, close: () => void) => {
    const handlers = { back, close };
    dismiss.current = handlers;
    return () => {
      if (dismiss.current === handlers) dismiss.current = null;
    };
  }, []);

  const setOpen = (next: boolean) => {
    if (next === isOpen) return;
    if (!next || app === undefined) {
      setNav({ stack: [home()], motion: "in" });
      reportApp("home");
    }
    setOwnOpen(next);
    onOpenChange?.(next);
  };

  const root: Root = {
    open: isOpen,
    setOpen,
    stack,
    motion: nav.motion,
    setStack,
    wallpaper,
    setWallpaper,
    ringtone,
    setRingtone,
    sent,
    setSent,
    slot,
    registerDismiss,
    reportApp,
  };
  return (
    <RootContext value={root}>
      <Dialog
        open={isOpen}
        modal="trap-focus"
        closeOnOutsidePress={false}
        onOpenChange={(next, details) => {
          if (next) return setOpen(true);
          details.cancel();
          if (details.reason === "escape-key") dismiss.current?.back();
          else dismiss.current?.close();
        }}
      >
        {children}
      </Dialog>
    </RootContext>
  );
};

const PhoneDrawerTrigger = ({ onKeyDown, ...props }: ComponentProps<typeof DialogTrigger>) => {
  const root = useRoot();
  return (
    <DialogTrigger
      {...props}
      aria-keyshortcuts="ArrowUp"
      onKeyDown={event => {
        onKeyDown?.(event);
        if (event.key === "ArrowUp" && !event.defaultPrevented) {
          event.preventDefault();
          root.setOpen(true);
        }
      }}
    />
  );
};

export { PhoneDrawer, PhoneDrawerTrigger, useRoot };
export type { PhoneDrawerProps };
