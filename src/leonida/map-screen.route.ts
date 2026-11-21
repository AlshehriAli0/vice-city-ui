import { ART, PROJECTION, ROAD_EDGES, ROAD_NODES } from "./map-screen.blips"

type Point = readonly [number, number]

// World units (about a metre each) onto the art of each view, and back, as scripts/gen-map.py projects them.
function project([x, y]: readonly [number, number], flat: boolean): [number, number] {
  const { cx, cy, angle, scale, tilt } = PROJECTION
  const dx = x - cx
  const dy = y - cy
  const rx = dx * Math.cos(angle) - dy * Math.sin(angle)
  const ry = dx * Math.sin(angle) + dy * Math.cos(angle)
  return flat ? [ART.width / 2 + rx * PROJECTION.flat, ART.height / 2 + ry * PROJECTION.flat] : [ART.width / 2 + rx * scale, ART.height / 2 + 20 + ry * tilt * scale]
}

function unproject([px, py]: readonly [number, number], flat: boolean): [number, number] {
  const { cx, cy, angle, scale, tilt } = PROJECTION
  const rx = (px - ART.width / 2) / (flat ? PROJECTION.flat : scale)
  const ry = flat ? (py - ART.height / 2) / PROJECTION.flat : (py - ART.height / 2 - 20) / (tilt * scale)
  return [cx + rx * Math.cos(angle) + ry * Math.sin(angle), cy - rx * Math.sin(angle) + ry * Math.cos(angle)]
}

const node = (i: number): Point => [ROAD_NODES[i * 2], ROAD_NODES[i * 2 + 1]]
const gap = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1])

let roads: Map<number, number[]> | undefined
function neighbours(): Map<number, number[]> {
  if (roads) return roads
  roads = new Map()
  for (let i = 0; i < ROAD_EDGES.length; i += 2) {
    const [a, b] = [ROAD_EDGES[i], ROAD_EDGES[i + 1]]
    roads.set(a, [...(roads.get(a) ?? []), b])
    roads.set(b, [...(roads.get(b) ?? []), a])
  }
  return roads
}

// The nearest point on a road, and the two ends of its stretch.
function onRoad(p: Point): { at: Point; ends: [number, number] } {
  let best = { at: node(ROAD_EDGES[0]), ends: [ROAD_EDGES[0], ROAD_EDGES[1]] as [number, number], d: Infinity }
  for (let i = 0; i < ROAD_EDGES.length; i += 2) {
    const a = node(ROAD_EDGES[i])
    const b = node(ROAD_EDGES[i + 1])
    const length = gap(a, b) ** 2 || 1
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / length))
    const at: Point = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
    const d = gap(p, at)
    if (d < best.d) best = { at, ends: [ROAD_EDGES[i], ROAD_EDGES[i + 1]], d }
  }
  return best
}

// The GPS route in world units: along the roads from the player to the destination, by Dijkstra over the road graph.
function route(from: Point, to: Point): Point[] {
  const start = onRoad(from)
  const end = onRoad(to)
  const dist = new Map<number, number>()
  const prev = new Map<number, number>()
  const open = new Set<number>()
  for (const i of start.ends) {
    dist.set(i, gap(start.at, node(i)))
    open.add(i)
  }
  while (open.size) {
    let here = -1
    for (const i of open) if (here < 0 || dist.get(i)! < dist.get(here)!) here = i
    open.delete(here)
    for (const next of neighbours().get(here) ?? []) {
      const d = dist.get(here)! + gap(node(here), node(next))
      if (d < (dist.get(next) ?? Infinity)) {
        dist.set(next, d)
        prev.set(next, here)
        open.add(next)
      }
    }
  }
  const last = end.ends.reduce((a, b) => ((dist.get(a) ?? Infinity) + gap(node(a), end.at) <= (dist.get(b) ?? Infinity) + gap(node(b), end.at) ? a : b))
  if (!dist.has(last)) return [from, to]
  const path: Point[] = []
  for (let i: number | undefined = last; i !== undefined; i = prev.get(i)) path.unshift(node(i))
  const sameStretch = start.ends.every((i) => end.ends.includes(i))
  return sameStretch ? [from, start.at, end.at, to] : [from, start.at, ...path, end.at, to]
}

const routeLength = (points: Point[]) => points.slice(1).reduce((sum, p, i) => sum + gap(points[i], p), 0)

export { project, route, routeLength, unproject }
export type { Point }
