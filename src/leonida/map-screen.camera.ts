"use client"

import { announce, createChange, createViewport, css, definePrimitive, live, type ChangeDetails, type Viewport, type ViewportReason } from "@ui-sdk/core"
import { createVelocityTracker, projectDistance } from "@ui-sdk/core/gesture"
import { createParts } from "@ui-sdk/react/primitive"
import { ART } from "./map-screen.blips"

// The pause map's camera. The cursor stays at the frame's centre and the map moves under it: a drag, the wheel,
// held arrow, WASD, + and − keys, and glides from code. It works in 1080p frame pixels and art pixels, while
// createViewport works in client pixels, so its zoom is the art zoom times the frame's scale.

const FRAME = { width: 1920, height: 1080 }
const CENTRE = { x: FRAME.width / 2, y: FRAME.height / 2 }
// At 2/3 the whole art fills the frame; past 2.5 the pre-rendered blocks read as blobs.
const MIN_ZOOM = Math.max(FRAME.width / ART.width, FRAME.height / ART.height)
const MAX_ZOOM = 2.5
// A blip is under the cursor once it touches the 52px ring: 26px ring radius plus 17px blip radius.
const SNAP = 43
// Legend picks glide 300–500ms, ease-in-out (spec §2, map-zq-b).
const GLIDE = 400
// Holding R2 zooms in about 2x over 0.85s (BXmcSRFxCEU at 11.6–12.5s); the stick pans with inertia.
const ZOOM_RATE = Math.LN2 / 0.85
const PAN_SPEED = 900
const RAMP = 90

type Target = { value: string; x: number; y: number }
type Camera = { x: number; y: number; zoom: number }
type ZoomReason = ViewportReason
type DestinationReason = "press" | "imperative"

type MapCameraOptions = {
  zoom?: number
  defaultZoom?: number
  onZoomChange?: (zoom: number, details: ChangeDetails<ZoomReason>) => void
  destination?: string | null
  defaultDestination?: string | null
  onDestinationChange?: (destination: string | null, details: ChangeDetails<DestinationReason>) => void
  // Blips and markers in art pixels; the cursor hovers the nearest one it touches.
  targets?: Target[]
  // The target the camera opens on.
  start?: string
  onHoverChange?: (value: string | null) => void
  controller?: MapCameraController
}

type MapCameraController = {
  glideTo: (target: string | { x: number; y: number }, zoom?: number) => void
  jumpTo: (point: { x: number; y: number }) => void
  centre: () => { x: number; y: number }
  setDestination: (destination: string | null) => boolean
}

const PAN_KEYS: Record<string, [number, number]> = {
  ArrowUp: [0, 1],
  ArrowDown: [0, -1],
  ArrowLeft: [1, 0],
  ArrowRight: [-1, 0],
  w: [0, 1],
  s: [0, -1],
  a: [1, 0],
  d: [-1, 0],
}
const ZOOM_KEYS: Record<string, number> = { "+": 1, "=": 1, "-": -1, _: -1 }

const clampZoom = (zoom: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))
const clamp = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, value))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

// The frame-pixel camera for an art point under the cursor.
function cameraAt(point: { x: number; y: number }, zoom: number): Camera {
  return { x: CENTRE.x - point.x * zoom, y: CENTRE.y - point.y * zoom, zoom }
}

function bounded(camera: Camera): Camera {
  const zoom = clampZoom(camera.zoom)
  return { zoom, x: clamp(camera.x, FRAME.width - ART.width * zoom, 0), y: clamp(camera.y, FRAME.height - ART.height * zoom, 0) }
}

function still(): boolean {
  if (typeof document === "undefined") return true
  return document.documentElement.dataset.motion === "still" || (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches)
}

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
    const zoom = clampZoom(options.zoom ?? options.defaultZoom ?? 1)
    const start = options.targets?.find((target) => target.value === options.start) ?? { x: ART.width / 2, y: ART.height / 2 }
    const camera = bounded(cameraAt(start, zoom))
    return {
      zoom,
      destination: options.destination ?? options.defaultDestination ?? null,
      hovered: null as string | null,
      moving: false,
      dragging: false,
      // Client pixels, as createViewport keeps it; `scale` is the frame's CSS scale, 1 until measured.
      viewport: { x: camera.x, y: camera.y, zoom: camera.zoom } as Viewport,
      scale: 1,
    }
  },
  sync: (options) => ({
    ...(options.zoom === undefined ? {} : { zoom: clampZoom(options.zoom) }),
    ...(options.destination === undefined ? {} : { destination: options.destination }),
  }),
  api: (context) => {
    const { store } = context
    const change = createChange(context)
    let surface: HTMLElement | null = null

    const camera = (): Camera => {
      const { viewport, scale } = store.get()
      return { x: viewport.x / scale, y: viewport.y / scale, zoom: viewport.zoom / scale }
    }
    const centre = () => {
      const { x, y, zoom } = camera()
      return { x: (CENTRE.x - x) / zoom, y: (CENTRE.y - y) / zoom }
    }
    const centreOnScreen = () => {
      const rect = surface?.getBoundingClientRect()
      const { scale } = store.get()
      return rect ? { x: rect.left + CENTRE.x * scale, y: rect.top + CENTRE.y * scale } : undefined
    }

    // Our own zoom reports, so a controlled zoom coming back doesn't count as a new one.
    const echoes: number[] = []
    const report = (zoom: number, reason: ZoomReason, event?: Event) => {
      if (Math.abs(zoom - store.get().zoom) < 1e-6) return
      echoes.push(zoom)
      if (echoes.length > 32) echoes.shift()
      change("zoom", zoom, { reason, event: event as never })
    }

    const hover = () => {
      const { moving, hovered } = store.get()
      let next: string | null = null
      if (!moving) {
        const { x, y, zoom } = camera()
        let best = SNAP
        for (const target of context.options().targets ?? []) {
          const distance = Math.hypot(x + target.x * zoom - CENTRE.x, y + target.y * zoom - CENTRE.y)
          if (distance <= best) {
            best = distance
            next = target.value
          }
        }
      }
      if (next === hovered) return
      store.set({ hovered: next })
      context.options().onHoverChange?.(next)
    }

    const viewport = createViewport(context, {
      key: "viewport",
      surface: () => surface,
      minZoom: () => store.get().scale * MIN_ZOOM,
      maxZoom: () => store.get().scale * MAX_ZOOM,
      message: (zoom) => `Map zoom ${Math.round((zoom / store.get().scale) * 100)}%`,
      set: (value, details) => {
        const { scale } = store.get()
        const next = bounded({ x: value.x / scale, y: value.y / scale, zoom: value.zoom / scale })
        store.set({ viewport: { x: next.x * scale, y: next.y * scale, zoom: next.zoom * scale } })
        report(next.zoom, details.reason, details.event)
        hover()
        return true
      },
    })
    const place = (next: Camera) => {
      const { scale } = store.get()
      viewport.setViewport({ x: next.x * scale, y: next.y * scale, zoom: next.zoom * scale })
    }

    // One frame loop for glides, held keys, the wheel's eased zoom and the fling after a drag.
    const held = new Set<string>()
    const velocity = { x: 0, y: 0, zoom: 0 }
    let glide: { from: Camera; to: Camera; start?: number } | null = null
    let fling: { x: number; y: number } | null = null
    let wheel: { log: number; at: { x: number; y: number } } | null = null
    let frame = 0
    let last = 0

    // Once a held zoom key settles, like the viewport's own zoom keys.
    const say = () => announce(`Map zoom ${Math.round(camera().zoom * 100)}%`)
    const stop = () => {
      if (glide) {
        glide = null
        store.set({ moving: false })
        hover()
      }
      fling = null
    }
    const run = () => {
      if (!frame && typeof requestAnimationFrame === "function") frame = requestAnimationFrame(tick)
    }
    const tick = (now: number) => {
      frame = 0
      const dt = last ? Math.min(64, now - last) : 16
      last = now
      const { scale } = store.get()
      if (glide) {
        glide.start ??= now
        const t = Math.min(1, (now - glide.start) / GLIDE)
        const k = ease(t)
        const { from, to } = glide
        const zoom = from.zoom * (to.zoom / from.zoom) ** k
        const a = { x: (CENTRE.x - from.x) / from.zoom, y: (CENTRE.y - from.y) / from.zoom }
        const b = { x: (CENTRE.x - to.x) / to.zoom, y: (CENTRE.y - to.y) / to.zoom }
        place(cameraAt({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }, zoom))
        if (t === 1) stop()
      }
      const ramp = 1 - Math.exp(-dt / RAMP)
      let aimX = 0
      let aimY = 0
      let aimZoom = 0
      for (const key of held) {
        const pan = PAN_KEYS[key]
        if (pan) {
          aimX += pan[0]
          aimY += pan[1]
        }
        aimZoom += ZOOM_KEYS[key] ?? 0
      }
      const length = Math.hypot(aimX, aimY) || 1
      velocity.x += ((aimX / length) * PAN_SPEED - velocity.x) * ramp
      velocity.y += ((aimY / length) * PAN_SPEED - velocity.y) * ramp
      velocity.zoom += (Math.sign(aimZoom) * ZOOM_RATE - velocity.zoom) * ramp
      if (Math.abs(velocity.x) + Math.abs(velocity.y) > 1) viewport.panBy((velocity.x * dt * scale) / 1000, (velocity.y * dt * scale) / 1000)
      else velocity.x = velocity.y = 0
      if (Math.abs(velocity.zoom) > 0.01) {
        viewport.zoomBy(Math.exp((velocity.zoom * dt) / 1000), centreOnScreen(), { reason: "zoom-key" })
      } else if (velocity.zoom) {
        velocity.zoom = 0
        say()
      }
      if (wheel) {
        const step = wheel.log * Math.min(1, dt / 60)
        wheel.log -= step
        viewport.zoomBy(Math.exp(step), wheel.at, { reason: "wheel" })
        if (Math.abs(wheel.log) < 0.001) wheel = null
      }
      if (fling) {
        const keep = 0.994 ** dt
        const dx = fling.x * (1 - keep)
        const dy = fling.y * (1 - keep)
        fling.x -= dx
        fling.y -= dy
        viewport.panBy(dx, dy)
        if (Math.hypot(fling.x, fling.y) < 0.5) fling = null
      }
      if (glide || fling || wheel || held.size || velocity.x || velocity.y || velocity.zoom) run()
      else last = 0
    }

    const glideTo = (target: string | { x: number; y: number }, zoom = camera().zoom) => {
      const point = typeof target === "string" ? context.options().targets?.find((item) => item.value === target) : target
      if (!point) return
      fling = null
      const to = bounded(cameraAt(point, clampZoom(zoom)))
      if (still()) {
        place(to)
        hover()
        return
      }
      glide = { from: camera(), to }
      store.set({ moving: true })
      hover()
      run()
    }
    const jumpTo = (point: { x: number; y: number }) => {
      stop()
      place(bounded(cameraAt(point, camera().zoom)))
    }
    const setDestination = (destination: string | null, event?: Event) => change("destination", destination, { reason: event ? "press" : "imperative", event: event as never })

    // Scale changes when the screen resizes; the viewport keeps the same frame-pixel camera.
    const measure = () => {
      if (!surface) return
      const scale = surface.getBoundingClientRect().width / FRAME.width
      const { scale: old, viewport: v } = store.get()
      if (!scale || Math.abs(scale - old) < 1e-6) return
      const k = scale / old
      store.set({ scale, viewport: { x: v.x * k, y: v.y * k, zoom: v.zoom * k } })
    }

    context.onOptions((options) => {
      if (options.zoom !== undefined && !echoes.includes(options.zoom) && Math.abs(clampZoom(options.zoom) - camera().zoom) > 1e-6) glideTo(centre(), options.zoom)
      hover()
    })
    context.onDestroy(() => {
      if (frame) cancelAnimationFrame(frame)
    })

    const api = {
      viewport,
      glideTo,
      jumpTo,
      centre,
      setDestination: (destination: string | null) => setDestination(destination),
      setZoom: (zoom: number) => {
        if (!Number.isFinite(zoom)) throw new Error(`Zoom must be a number between ${MIN_ZOOM.toFixed(2)} and ${MAX_ZOOM}.`)
        glideTo(centre(), zoom)
        return true
      },
      zoomIn: () => glideTo(centre(), camera().zoom * 1.5),
      zoomOut: () => glideTo(centre(), camera().zoom / 1.5),
      cursorOffset: (state: { hovered: string | null; viewport: Viewport; scale: number }) => {
        const target = state.hovered ? context.options().targets?.find((item) => item.value === state.hovered) : undefined
        if (!target) return { x: 0, y: 0 }
        const zoom = state.viewport.zoom / state.scale
        return { x: state.viewport.x / state.scale + target.x * zoom - CENTRE.x, y: state.viewport.y / state.scale + target.y * zoom - CENTRE.y }
      },
      bindSurface(el: HTMLElement) {
        surface = el
        measure()
        hover()
        const screen = el.closest<HTMLElement>("[data-slot=game-screen]") ?? el
        const resize = new ResizeObserver(measure)
        resize.observe(screen)
        // React's wheel listener is passive, so the page would scroll under the map.
        const onWheel = (event: WheelEvent) => {
          event.preventDefault()
          stop()
          measure()
          if (event.ctrlKey) return viewport.wheel(event)
          const lines = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? el.clientHeight : 1
          const log = -event.deltaY * lines * 0.002
          const at = { x: event.clientX, y: event.clientY }
          if (still()) {
            viewport.zoomBy(Math.exp(log), at, { reason: "wheel", event })
            return
          }
          wheel = { log: (wheel?.log ?? 0) + log, at }
          run()
        }
        el.addEventListener("wheel", onWheel, { passive: false })
        return () => {
          surface = null
          resize.disconnect()
          el.removeEventListener("wheel", onWheel)
        }
      },
      pointerdown(event: PointerEvent) {
        if (event.button !== 0) return
        stop()
        measure()
        viewport.pointerdown(event)
        const pointers = new Set([event.pointerId])
        const trackX = createVelocityTracker()
        const trackY = createVelocityTracker()
        trackX.add(event.timeStamp, event.clientX)
        trackY.add(event.timeStamp, event.clientY)
        store.set({ dragging: true })
        const move = (next: PointerEvent) => {
          if (next.pointerId !== event.pointerId) return
          trackX.add(next.timeStamp, next.clientX)
          trackY.add(next.timeStamp, next.clientY)
        }
        const down = (next: PointerEvent) => pointers.add(next.pointerId)
        const up = (next: PointerEvent) => {
          pointers.delete(next.pointerId)
          if (pointers.size) return
          window.removeEventListener("pointermove", move)
          window.removeEventListener("pointerdown", down)
          window.removeEventListener("pointerup", up)
          window.removeEventListener("pointercancel", up)
          store.set({ dragging: false })
          if (next.type === "pointercancel" || still()) return
          const x = projectDistance(trackX.velocity(next.timeStamp), 0.994)
          const y = projectDistance(trackY.velocity(next.timeStamp), 0.994)
          if (Math.hypot(x, y) < 2) return
          fling = { x, y }
          run()
        }
        window.addEventListener("pointermove", move)
        window.addEventListener("pointerdown", down)
        window.addEventListener("pointerup", up)
        window.addEventListener("pointercancel", up)
      },
      keydown(event: KeyboardEvent) {
        if (event.altKey || event.ctrlKey || event.metaKey) return
        const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
        if (PAN_KEYS[key] || ZOOM_KEYS[key]) {
          event.preventDefault()
          stop()
          measure()
          if (still()) {
            const pan = PAN_KEYS[key]
            if (pan) viewport.panBy(pan[0] * 120 * store.get().scale, pan[1] * 120 * store.get().scale)
            else {
              glideTo(centre(), camera().zoom * (ZOOM_KEYS[key] > 0 ? 1.25 : 0.8))
              say()
            }
            return
          }
          held.add(key)
          run()
          return
        }
        if (viewport.keydown(event, centreOnScreen())) event.preventDefault()
      },
      keyup(event: KeyboardEvent) {
        const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
        held.delete(key)
      },
      release: () => held.clear(),
    }
    return api
  },
  slots: (slot) => ({
    root: slot({
      role: "application",
      keys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "+", "-", "=", "0"],
      attrs: (state) => ({
        tabindex: "0",
        "aria-roledescription": "map",
        style: css({ "touch-action": "none" }),
      }),
      live: live((state) => ({ "data-dragging": state.dragging ? "" : undefined })),
      on: {
        pointerdown: (event, { api }) => api.pointerdown(event as PointerEvent),
        keydown: (event, { api }) => api.keydown(event as KeyboardEvent),
        keyup: (event, { api }) => api.keyup(event as KeyboardEvent),
        blur: (_event, { api }) => api.release(),
      },
      bind: (el, part) => part.api.bindSurface(el),
    }),
    world: slot({
      attrs: () => ({ "aria-hidden": "true" }),
      live: live((state) => {
        const { viewport: v, scale } = state
        return {
          style: css({
            width: `${ART.width}px`,
            height: `${ART.height}px`,
            transform: `translate(${v.x / scale}px, ${v.y / scale}px) scale(${v.zoom / scale})`,
            "--zoom": String(v.zoom / scale),
          }),
        }
      }),
    }),
    cursor: slot({
      attrs: (state) => ({
        "aria-hidden": "true",
        "data-hovering": state.hovered ? "" : undefined,
        "data-destination": state.hovered && state.hovered === state.destination ? "" : undefined,
      }),
      live: live((state, { api }) => {
        const offset = api.cursorOffset(state)
        return { style: css({ translate: `${offset.x}px ${offset.y}px` }) }
      }),
    }),
  }),
  agent: { actions: ["setZoom", "zoomIn", "zoomOut", "setDestination"] },
})

const MapCameraParts = createParts(mapCamera, { root: "div", world: "div", cursor: "span" })

export { MAX_ZOOM, MIN_ZOOM, MapCameraParts, mapCamera }
export type { MapCameraController, MapCameraOptions, Target }
