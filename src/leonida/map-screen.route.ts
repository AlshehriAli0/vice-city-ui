import { ART, PROJECTION, ROAD_EDGES, ROAD_NODES } from "./map-screen.blips";

type Point = readonly [number, number];

// what: World units (about a metre each) onto the art of each view, and back, as scripts/gen-map.py projects them.
const project = ([x, y]: readonly [number, number], flat: boolean): [number, number] => {
  const { cx, cy, angle, scale, tilt } = PROJECTION;
  const dx = x - cx;
  const dy = y - cy;
  const rx = dx * Math.cos(angle) - dy * Math.sin(angle);
  const ry = dx * Math.sin(angle) + dy * Math.cos(angle);
  return flat
    ? [ART.width / 2 + rx * PROJECTION.flat, ART.height / 2 + ry * PROJECTION.flat]
    : [ART.width / 2 + rx * scale, ART.height / 2 + 20 + ry * tilt * scale];
};

const unproject = ([px, py]: readonly [number, number], flat: boolean): [number, number] => {
  const { cx, cy, angle, scale, tilt } = PROJECTION;
  const rx = (px - ART.width / 2) / (flat ? PROJECTION.flat : scale);
  const ry = flat ? (py - ART.height / 2) / PROJECTION.flat : (py - ART.height / 2 - 20) / (tilt * scale);
  return [cx + rx * Math.cos(angle) + ry * Math.sin(angle), cy - rx * Math.sin(angle) + ry * Math.cos(angle)];
};

const node = (i: number): Point => [ROAD_NODES[i * 2], ROAD_NODES[i * 2 + 1]];
const gap = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);

let roads: Map<number, number[]> | undefined;
const neighbours = (): Map<number, number[]> => {
  if (roads) return roads;
  roads = new Map();
  for (let i = 0; i < ROAD_EDGES.length; i += 2) {
    const [a, b] = [ROAD_EDGES[i], ROAD_EDGES[i + 1]];
    roads.set(a, [...(roads.get(a) ?? []), b]);
    roads.set(b, [...(roads.get(b) ?? []), a]);
  }
  return roads;
};

const onRoad = (p: Point): { at: Point; ends: [number, number] } => {
  let best = { at: node(ROAD_EDGES[0]), ends: [ROAD_EDGES[0], ROAD_EDGES[1]] as [number, number], d: Infinity };
  for (let i = 0; i < ROAD_EDGES.length; i += 2) {
    const a = node(ROAD_EDGES[i]);
    const b = node(ROAD_EDGES[i + 1]);
    const length = gap(a, b) ** 2 || 1;
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / length));
    const at: Point = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const d = gap(p, at);
    if (d < best.d) best = { at, ends: [ROAD_EDGES[i], ROAD_EDGES[i + 1]], d };
  }
  return best;
};

const nearest = (open: ReadonlySet<number>, distances: ReadonlyMap<number, number>) => {
  let id = -1;
  let distance = Infinity;
  for (const candidate of open) {
    const value = distances.get(candidate) ?? Infinity;
    if (value < distance) {
      id = candidate;
      distance = value;
    }
  }
  return { id, distance };
};

const searchRoads = (from: ReturnType<typeof onRoad>) => {
  const dist = new Map<number, number>();
  const prev = new Map<number, number>();
  const open = new Set<number>();
  for (const i of from.ends) {
    dist.set(i, gap(from.at, node(i)));
    open.add(i);
  }
  while (open.size) {
    const { id: here, distance } = nearest(open, dist);
    open.delete(here);
    for (const next of neighbours().get(here) ?? []) {
      const d = distance + gap(node(here), node(next));
      if (d < (dist.get(next) ?? Infinity)) {
        dist.set(next, d);
        prev.set(next, here);
        open.add(next);
      }
    }
  }
  return { dist, prev };
};

const route = (from: Point, to: Point): Point[] => {
  const start = onRoad(from);
  const end = onRoad(to);
  const { dist, prev } = searchRoads(start);
  const last = end.ends.reduce((a, b) =>
    (dist.get(a) ?? Infinity) + gap(node(a), end.at) <= (dist.get(b) ?? Infinity) + gap(node(b), end.at) ? a : b
  );
  if (!dist.has(last)) return [from, to];
  const path: Point[] = [];
  for (let i: number | undefined = last; i !== undefined; i = prev.get(i)) path.unshift(node(i));
  const [startA, startB] = start.ends;
  const [endA, endB] = end.ends;
  const sameStretch = (startA === endA && startB === endB) || (startA === endB && startB === endA);
  return sameStretch ? [from, start.at, end.at, to] : [from, start.at, ...path, end.at, to];
};

const routeLength = (points: Point[]) => points.slice(1).reduce((sum, p, i) => sum + gap(points[i], p), 0);

export { project, route, routeLength, unproject };
export type { Point };
