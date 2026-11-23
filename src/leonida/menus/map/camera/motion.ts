import type { createViewport } from "@ui-sdk/core";

import { cameraAt, pointOf, type Camera } from "./geometry";

type Pan = [number, number];
type Point = { x: number; y: number };

const PAN_KEYS = new Map<string, Pan>([
  ["ArrowUp", [0, 1]],
  ["ArrowDown", [0, -1]],
  ["ArrowLeft", [1, 0]],
  ["ArrowRight", [-1, 0]],
  ["w", [0, 1]],
  ["s", [0, -1]],
  ["a", [1, 0]],
  ["d", [-1, 0]],
]);
const ZOOM_KEYS = new Map([
  ["+", 1],
  ["=", 1],
  ["-", -1],
  ["_", -1],
]);
const GLIDE = 400;
const ZOOM_RATE = Math.LN2 / 0.85;
const PAN_SPEED = 900;
const RAMP = 90;
const FLING_FRICTION = 0.994;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const inputVector = (held: ReadonlySet<string>) => {
  let x = 0;
  let y = 0;
  let zoom = 0;
  for (const key of held) {
    const pan = PAN_KEYS.get(key);
    if (pan) {
      x += pan[0];
      y += pan[1];
    }
    zoom += ZOOM_KEYS.get(key) ?? 0;
  }
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length, zoom: Math.sign(zoom) };
};

type CameraMotionOptions = {
  viewport: Pick<ReturnType<typeof createViewport>, "panBy" | "zoomBy">;
  place: (next: Camera) => void;
  readScale: () => number;
  centreOnScreen: () => Point | undefined;
  say: () => void;
  onGlideStop: () => void;
};

const createCameraMotion = ({ viewport, place, readScale, centreOnScreen, say, onGlideStop }: CameraMotionOptions) => {
  const held = new Set<string>();
  const velocity = { x: 0, y: 0, zoom: 0 };
  let glide: { from: Camera; to: Camera; start?: number } | null = null;
  let fling: Point | null = null;
  let wheel: { log: number; at: Point } | null = null;
  let frame = 0;
  let last = 0;

  const stop = () => {
    if (glide) {
      glide = null;
      onGlideStop();
    }
    fling = null;
  };

  const advanceGlide = (now: number) => {
    if (!glide) return;
    glide.start ??= now;
    const t = Math.min(1, (now - glide.start) / GLIDE);
    const k = ease(t);
    const { from, to } = glide;
    const zoom = from.zoom * (to.zoom / from.zoom) ** k;
    const a = pointOf(from);
    const b = pointOf(to);
    place(cameraAt({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }, zoom));
    if (t === 1) stop();
  };

  const advanceKeys = (dt: number) => {
    const scale = readScale();
    const ramp = 1 - Math.exp(-dt / RAMP);
    const aim = inputVector(held);
    velocity.x += (aim.x * PAN_SPEED - velocity.x) * ramp;
    velocity.y += (aim.y * PAN_SPEED - velocity.y) * ramp;
    velocity.zoom += (aim.zoom * ZOOM_RATE - velocity.zoom) * ramp;
    const moving = Math.abs(velocity.x) + Math.abs(velocity.y) > 1;
    if (moving) viewport.panBy((velocity.x * dt * scale) / 1000, (velocity.y * dt * scale) / 1000);
    else velocity.x = velocity.y = 0;
    if (Math.abs(velocity.zoom) > 0.01) {
      viewport.zoomBy(Math.exp((velocity.zoom * dt) / 1000), centreOnScreen(), { reason: "zoom-key" });
    } else if (velocity.zoom) {
      velocity.zoom = 0;
      say();
    }
  };

  const advanceWheel = (dt: number) => {
    if (!wheel) return;
    const step = wheel.log * Math.min(1, dt / 60);
    wheel.log -= step;
    viewport.zoomBy(Math.exp(step), wheel.at, { reason: "wheel" });
    if (Math.abs(wheel.log) < 0.001) wheel = null;
  };

  const advanceFling = (dt: number) => {
    if (!fling) return;
    const keep = FLING_FRICTION ** dt;
    const dx = fling.x * (1 - keep);
    const dy = fling.y * (1 - keep);
    fling.x -= dx;
    fling.y -= dy;
    viewport.panBy(dx, dy);
    if (Math.hypot(fling.x, fling.y) < 0.5) fling = null;
  };

  const run = () => {
    if (!frame && typeof requestAnimationFrame === "function") frame = requestAnimationFrame(tick);
  };

  const tick = (now: number) => {
    frame = 0;
    const dt = last ? Math.min(64, now - last) : 16;
    last = now;
    advanceGlide(now);
    advanceKeys(dt);
    advanceWheel(dt);
    advanceFling(dt);
    const moving = velocity.x !== 0 || velocity.y !== 0 || velocity.zoom !== 0;
    if (glide || fling || wheel || held.size || moving) run();
    else last = 0;
  };

  return {
    glide: (from: Camera, to: Camera) => {
      glide = { from, to };
      run();
    },
    fling: (next: Point) => {
      fling = next;
      run();
    },
    stopFling: () => {
      fling = null;
    },
    queueWheel: (log: number, at: Point) => {
      wheel = { log: (wheel?.log ?? 0) + log, at };
      run();
    },
    keydown: (key: string) => {
      held.add(key);
      run();
    },
    keyup: (key: string) => held.delete(key),
    release: () => held.clear(),
    stop,
    destroy: () => {
      if (frame) cancelAnimationFrame(frame);
    },
  };
};

export { FLING_FRICTION, PAN_KEYS, ZOOM_KEYS, createCameraMotion };
