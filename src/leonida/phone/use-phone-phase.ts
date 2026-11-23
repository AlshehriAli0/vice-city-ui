import { useEffect, useEffectEvent, useState } from "react";

type Phase = "black" | "fade" | "up" | "out";

const TIMING = { foot: { hold: 100, fade: 200, close: 100 }, car: { hold: 167, fade: 183, close: 67 } };

const canChangeShot = (open: boolean, poseChanged: boolean, phase: Phase) => open && poseChanged && phase !== "out";

const usePhonePhase = (open: boolean, inCar: boolean, sway: boolean, onClose: () => void) => {
  const timing = TIMING[inCar ? "car" : "foot"];
  const [phase, setPhase] = useState<Phase>("black");
  const [exit, setExit] = useState<"call" | undefined>();
  const [settle, setSettle] = useState(sway);
  if (settle && !sway) setSettle(false);
  const [closing, setClosing] = useState<{ hold: number; after?: () => void }>();
  const [seen, setSeen] = useState({ open, inCar });
  const justOpened = open && !seen.open;
  const poseChanged = inCar !== seen.inCar;
  const poseChangedWhileOpen = canChangeShot(open, poseChanged, phase);

  if (open !== seen.open || poseChanged) setSeen({ open, inCar });
  if (justOpened) {
    setClosing(undefined);
    setExit(undefined);
    setSettle(sway);
  }
  if (justOpened || poseChangedWhileOpen) setPhase("black");
  const { hold, fade } = timing;
  const exiting = phase === "out";
  const closeDialog = useEffectEvent(onClose);

  useEffect(() => {
    if (!open || exiting) return undefined;
    const timers = [setTimeout(() => setPhase("fade"), hold), setTimeout(() => setPhase("up"), hold + fade)];
    return () => timers.forEach(clearTimeout);
  }, [open, exiting, hold, fade]);

  useEffect(() => {
    if (!open || !closing) return undefined;
    const timer = setTimeout(() => {
      setClosing(undefined);
      closeDialog();
      closing.after?.();
    }, closing.hold);
    return () => clearTimeout(timer);
  }, [open, closing]);

  const close = (closeHold?: number, after?: () => void) => {
    if (exiting) return;
    setPhase("out");
    setClosing({ hold: closeHold ?? timing.close, after });
  };

  return { phase, exit, setExit, settle, close };
};

export { usePhonePhase };
