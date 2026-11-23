import type { createViewport } from "@ui-sdk/core";
import { createVelocityTracker, projectDistance } from "@ui-sdk/core/gesture";

import { still } from "./geometry";
import { FLING_FRICTION, PAN_KEYS, ZOOM_KEYS, type createCameraMotion } from "./motion";

type CameraInputOptions = {
  viewport: Pick<ReturnType<typeof createViewport>, "panBy" | "zoomBy" | "wheel" | "pointerdown" | "keydown">;
  motion: ReturnType<typeof createCameraMotion>;
  measure: () => void;
  readScale: () => number;
  centreOnScreen: () => { x: number; y: number } | undefined;
  readZoom: () => number;
  zoomTo: (next: number) => void;
  say: () => void;
  onDraggingChange: (dragging: boolean) => void;
};

const wheelUnit = (event: WheelEvent, element: HTMLElement): number => {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return 16;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return element.clientHeight;
  return 1;
};

const hasModifier = (event: KeyboardEvent) => event.altKey || event.ctrlKey || event.metaKey;

const cameraKey = (key: string) => (key.length === 1 ? key.toLowerCase() : key);

const createCameraInput = ({
  viewport,
  motion,
  measure,
  readScale,
  centreOnScreen,
  readZoom,
  zoomTo,
  say,
  onDraggingChange,
}: CameraInputOptions) => {
  let cancelDrag: (() => void) | null = null;

  const bindWheel = (element: HTMLElement) => {
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      motion.stop();
      measure();
      if (event.ctrlKey) {
        viewport.wheel(event);
        return;
      }

      const log = -event.deltaY * wheelUnit(event, element) * 0.002;
      const at = { x: event.clientX, y: event.clientY };
      if (still()) viewport.zoomBy(Math.exp(log), at, { reason: "wheel", event });
      else motion.queueWheel(log, at);
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  };

  const pointerdown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    motion.stop();
    measure();
    viewport.pointerdown(event);
    if (cancelDrag) return;

    const pointers = new Set([event.pointerId]);
    const trackX = createVelocityTracker();
    const trackY = createVelocityTracker();
    trackX.add(event.timeStamp, event.clientX);
    trackY.add(event.timeStamp, event.clientY);
    onDraggingChange(true);

    const move = (next: PointerEvent) => {
      if (next.pointerId !== event.pointerId) return;
      trackX.add(next.timeStamp, next.clientX);
      trackY.add(next.timeStamp, next.clientY);
    };
    const down = (next: PointerEvent) => pointers.add(next.pointerId);
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      cancelDrag = null;
      onDraggingChange(false);
    };
    const up = (next: PointerEvent) => {
      pointers.delete(next.pointerId);
      if (pointers.size) return;
      cleanup();
      if (next.type === "pointercancel" || still()) return;
      const x = projectDistance(trackX.velocity(next.timeStamp), FLING_FRICTION);
      const y = projectDistance(trackY.velocity(next.timeStamp), FLING_FRICTION);
      if (Math.hypot(x, y) >= 2) motion.fling({ x, y });
    };
    cancelDrag = cleanup;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const keydown = (event: KeyboardEvent) => {
    if (hasModifier(event)) return;
    const key = cameraKey(event.key);
    const pan = PAN_KEYS.get(key);
    const zoom = ZOOM_KEYS.get(key);
    if (!pan && !zoom) {
      if (viewport.keydown(event, centreOnScreen())) event.preventDefault();
      return;
    }

    event.preventDefault();
    motion.stop();
    measure();
    if (!still()) {
      motion.keydown(key);
    } else if (pan) {
      const scale = readScale();
      viewport.panBy(pan[0] * 120 * scale, pan[1] * 120 * scale);
    } else {
      zoomTo(readZoom() * (zoom === 1 ? 1.25 : 0.8));
      say();
    }
  };

  return {
    bindWheel,
    pointerdown,
    keydown,
    keyup: (event: KeyboardEvent) => motion.keyup(cameraKey(event.key)),
    cancelDrag: () => cancelDrag?.(),
  };
};

export { createCameraInput };
