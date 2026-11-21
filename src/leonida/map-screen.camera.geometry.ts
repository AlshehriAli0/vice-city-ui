import { ART } from "./map-screen.blips";

const FRAME = { width: 1920, height: 1080 };
const CENTRE = { x: FRAME.width / 2, y: FRAME.height / 2 };
const MIN_ZOOM = Math.max(FRAME.width / ART.width, FRAME.height / ART.height);
const MAX_ZOOM = 2.5;
const SNAP = 43;

type Camera = { x: number; y: number; zoom: number };

const clampZoom = (zoom: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
const clamp = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, value));

const cameraAt = (point: { x: number; y: number }, zoom: number): Camera => {
  return { x: CENTRE.x - point.x * zoom, y: CENTRE.y - point.y * zoom, zoom };
};

const bounded = (camera: Camera): Camera => {
  const zoom = clampZoom(camera.zoom);
  return {
    zoom,
    x: clamp(camera.x, FRAME.width - ART.width * zoom, 0),
    y: clamp(camera.y, FRAME.height - ART.height * zoom, 0),
  };
};

const still = (): boolean => {
  if (typeof document === "undefined") return true;
  return (
    document.documentElement.dataset.motion === "still" ||
    (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches)
  );
};

const pointOf = ({ x, y, zoom }: Camera) => ({ x: (CENTRE.x - x) / zoom, y: (CENTRE.y - y) / zoom });

type Target = { value: string; x: number; y: number };

const scaleCamera = ({ x, y, zoom }: Camera, scale: number): Camera => ({
  x: x * scale,
  y: y * scale,
  zoom: zoom * scale,
});

const offsetFromCentre = (camera: Camera, point: { x: number; y: number }) => ({
  x: camera.x + point.x * camera.zoom - CENTRE.x,
  y: camera.y + point.y * camera.zoom - CENTRE.y,
});

const hoveredTarget = (camera: Camera, targets: Target[] | undefined): string | null => {
  let closest = SNAP;
  let hovered: string | null = null;
  for (const target of targets ?? []) {
    const offset = offsetFromCentre(camera, target);
    const distance = Math.hypot(offset.x, offset.y);
    if (distance <= closest) {
      closest = distance;
      hovered = target.value;
    }
  }
  return hovered;
};

type CursorState = { hovered: string | null; viewport: Camera; scale: number };

const cursorOffset = (state: CursorState, targets: Target[] | undefined) => {
  const target = state.hovered ? targets?.find(item => item.value === state.hovered) : undefined;
  return target ? offsetFromCentre(scaleCamera(state.viewport, 1 / state.scale), target) : { x: 0, y: 0 };
};

export {
  CENTRE,
  FRAME,
  MAX_ZOOM,
  MIN_ZOOM,
  bounded,
  cameraAt,
  clampZoom,
  hoveredTarget,
  cursorOffset,
  pointOf,
  scaleCamera,
  still,
};
export type { Camera, Target };
