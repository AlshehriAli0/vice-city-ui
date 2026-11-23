import type { Viewport } from "@ui-sdk/core";

import { CENTRE, FRAME, scaleCamera } from "./geometry";

type MapLayout = { scale: number; viewport: Viewport };
type BoundInput = {
  bindWheel: (element: HTMLElement) => () => void;
  cancelDrag: () => void;
};

const createCameraSurface = (read: () => MapLayout, set: (layout: MapLayout) => unknown) => {
  let surface: HTMLElement | null = null;

  const centreOnScreen = () => {
    const rect = surface?.getBoundingClientRect();
    if (!rect) return undefined;
    const { scale } = read();
    return { x: rect.left + CENTRE.x * scale, y: rect.top + CENTRE.y * scale };
  };

  const measure = () => {
    if (!surface) return;
    const scale = surface.getBoundingClientRect().width / FRAME.width;
    const { scale: previous, viewport } = read();
    if (!scale || Math.abs(scale - previous) < 1e-6) return;
    set({ scale, viewport: scaleCamera(viewport, scale / previous) });
  };

  const bind = (element: HTMLElement, hover: () => void, input: BoundInput) => {
    surface = element;
    measure();
    hover();
    const screen = element.closest<HTMLElement>("[data-slot=game-screen]") ?? element;
    const resize = new ResizeObserver(measure);
    resize.observe(screen);
    const unbindWheel = input.bindWheel(element);
    return () => {
      if (surface === element) surface = null;
      resize.disconnect();
      unbindWheel();
      input.cancelDrag();
    };
  };

  return { get: () => surface, centreOnScreen, measure, bind };
};

export { createCameraSurface };
