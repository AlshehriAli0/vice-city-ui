"use client";

import { announce, createChange, createViewport, css, definePrimitive, live } from "@ui-sdk/core";
import { createParts } from "@ui-sdk/react/primitive";

import { ART } from "./map-screen.blips";
import {
  MAX_ZOOM,
  MIN_ZOOM,
  bounded,
  cameraAt,
  clampZoom,
  cursorOffset,
  hoveredTarget,
  pointOf,
  scaleCamera,
  still,
  type Camera,
} from "./map-screen.camera.geometry";
import { createCameraInput } from "./map-screen.camera.input";
import { createCameraMotion } from "./map-screen.camera.motion";
import { createCameraSurface } from "./map-screen.camera.surface";
import type { MapCameraOptions, ZoomReason } from "./map-screen.camera.types";

const mapCamera = definePrimitive({
  name: "map-camera",
  options: {
    zoom: "number",
    defaultZoom: "number",
    onZoomChange: "callback",
    destination: "value",
    defaultDestination: "value",
    onDestinationChange: "callback",
    targets: "value",
    start: "string",
    onHoverChange: "callback",
    controller: "value",
  },
  controlled: ["zoom", "destination"],
  live: ["viewport", "scale", "dragging"],
  state: (options: MapCameraOptions) => {
    const zoom = clampZoom(options.zoom ?? options.defaultZoom ?? 1);
    const start = options.targets?.find(target => target.value === options.start) ?? {
      x: ART.width / 2,
      y: ART.height / 2,
    };
    const camera = bounded(cameraAt(start, zoom));
    return {
      zoom,
      destination: options.destination ?? options.defaultDestination ?? null,
      hovered: null as string | null,
      moving: false,
      dragging: false,
      viewport: { x: camera.x, y: camera.y, zoom: camera.zoom },
      scale: 1,
    };
  },
  sync: options => ({
    ...(options.zoom === undefined ? {} : { zoom: clampZoom(options.zoom) }),
    ...(options.destination === undefined ? {} : { destination: options.destination }),
  }),
  api: context => {
    const { store } = context;
    const change = createChange(context);
    const readScale = () => store.get().scale;
    const camera = () => scaleCamera(store.get().viewport, 1 / readScale());
    const centre = () => pointOf(camera());
    const surface = createCameraSurface(
      () => store.get(),
      next => store.set(next)
    );

    const echoes: number[] = [];
    const report = (zoom: number, reason: ZoomReason, event?: Event) => {
      if (Math.abs(zoom - store.get().zoom) < 1e-6) return;
      echoes.push(zoom);
      if (echoes.length > 32) echoes.shift();
      change("zoom", zoom, { reason, event });
    };

    const hover = () => {
      const { moving, hovered } = store.get();
      const next = moving ? null : hoveredTarget(camera(), context.options().targets);
      if (next === hovered) return;
      store.set({ hovered: next });
      context.options().onHoverChange?.(next);
    };

    const viewport = createViewport(context, {
      key: "viewport",
      surface: surface.get,
      minZoom: () => store.get().scale * MIN_ZOOM,
      maxZoom: () => store.get().scale * MAX_ZOOM,
      message: zoom => `Map zoom ${Math.round((zoom / store.get().scale) * 100)}%`,
      set: (value, details) => {
        const { scale } = store.get();
        const next = bounded(scaleCamera(value, 1 / scale));
        store.set({ viewport: scaleCamera(next, scale) });
        report(next.zoom, details.reason, details.event);
        hover();
        return true;
      },
    });
    const place = (next: Camera) => viewport.setViewport(scaleCamera(next, readScale()));
    const say = () => announce(`Map zoom ${Math.round(camera().zoom * 100)}%`);
    const centreOnScreen = surface.centreOnScreen;
    const motion = createCameraMotion({
      viewport,
      place,
      readScale,
      centreOnScreen,
      say,
      onGlideStop: () => {
        store.set({ moving: false });
        hover();
      },
    });

    const glideTo = (target: string | { x: number; y: number }, zoom = camera().zoom) => {
      const point =
        typeof target === "string" ? context.options().targets?.find(item => item.value === target) : target;
      if (!point) return;
      motion.stopFling();
      const to = bounded(cameraAt(point, clampZoom(zoom)));
      if (still()) {
        place(to);
        hover();
        return;
      }
      motion.glide(camera(), to);
      store.set({ moving: true });
      hover();
    };
    const jumpTo = (point: { x: number; y: number }) => {
      motion.stop();
      place(bounded(cameraAt(point, camera().zoom)));
    };

    context.onOptions(options => {
      if (
        options.zoom !== undefined &&
        !echoes.includes(options.zoom) &&
        Math.abs(clampZoom(options.zoom) - camera().zoom) > 1e-6
      )
        glideTo(centre(), options.zoom);
      hover();
    });
    const input = createCameraInput({
      viewport,
      motion,
      measure: surface.measure,
      readScale,
      centreOnScreen,
      say,
      readZoom: () => camera().zoom,
      zoomTo: zoom => glideTo(centre(), zoom),
      onDraggingChange: dragging => store.set({ dragging }),
    });
    context.onDestroy(() => {
      input.cancelDrag();
      motion.destroy();
    });

    return {
      viewport,
      glideTo,
      jumpTo,
      centre,
      setDestination: (destination: string | null) => change("destination", destination, { reason: "imperative" }),
      setZoom: (zoom: number) => {
        if (!Number.isFinite(zoom))
          throw new Error(`Zoom must be a number between ${MIN_ZOOM.toFixed(2)} and ${MAX_ZOOM}.`);
        glideTo(centre(), zoom);
        return true;
      },
      zoomIn: () => glideTo(centre(), camera().zoom * 1.5),
      zoomOut: () => glideTo(centre(), camera().zoom / 1.5),
      cursorOffset: (state: Parameters<typeof cursorOffset>[0]) => cursorOffset(state, context.options().targets),
      bindSurface: (el: HTMLElement) => surface.bind(el, hover, input),
      pointerdown: input.pointerdown,
      keydown: input.keydown,
      keyup: input.keyup,
      release: motion.release,
    };
  },
  slots: slot => ({
    root: slot({
      role: "application",
      keys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "+", "-", "=", "0"],
      attrs: () => ({
        tabindex: "0",
        "aria-roledescription": "map",
        style: css({ "touch-action": "none" }),
      }),
      live: live(state => ({ "data-dragging": state.dragging ? "" : undefined })),
      on: {
        pointerdown: (event, { api }) => api.pointerdown(event),
        keydown: (event, { api }) => api.keydown(event),
        keyup: (event, { api }) => api.keyup(event),
        blur: (_event, { api }) => api.release(),
      },
      bind: (el, part) => part.api.bindSurface(el),
    }),
    world: slot({
      attrs: () => ({ "aria-hidden": "true" }),
      live: live(state => {
        const { viewport: v, scale } = state;
        return {
          style: css({
            width: `${ART.width}px`,
            height: `${ART.height}px`,
            transform: `translate(${v.x / scale}px, ${v.y / scale}px) scale(${v.zoom / scale})`,
            "--zoom": String(v.zoom / scale),
          }),
        };
      }),
    }),
    cursor: slot({
      attrs: state => ({
        "aria-hidden": "true",
        "data-hovering": state.hovered ? "" : undefined,
        "data-destination": state.hovered && state.hovered === state.destination ? "" : undefined,
      }),
      live: live((state, { api }) => {
        const offset = api.cursorOffset(state);
        return { style: css({ translate: `${offset.x}px ${offset.y}px` }) };
      }),
    }),
  }),
  agent: { actions: ["setZoom", "zoomIn", "zoomOut", "setDestination"] },
});

const MapCameraParts = createParts(mapCamera, { root: "div", world: "div", cursor: "span" });

export { MAX_ZOOM, MIN_ZOOM, MapCameraParts, mapCamera };
export type { MapCameraController, MapCameraOptions } from "./map-screen.camera.types";
export type { Target } from "./map-screen.camera.geometry";
