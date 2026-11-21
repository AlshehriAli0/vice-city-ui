"""Pre-render the map screen's city (spec palette) to public/vc/map-3d.svg and public/vc/map-2d.svg,
and write the blip positions to src/leonida/map-screen.blips.ts.

Run: python3 scripts/gen-map.py. The seed is fixed, so the output is byte-for-byte reproducible.

World units are laid out on an irregular street grid, then rotated ~28 degrees, tilted 45 degrees
(y * cos 45) and extruded straight up (h * sin 45). Each lot is one or more boxes (row houses, L-shapes,
warehouses, a podium with a tower), drawn back to front so near walls cover far roofs. The art is
1.5x the screen so the map can pan to a blip without showing an edge.
"""
import math, os, random

random.seed(11)
SW, SH = 2880, 1620
ANG = math.radians(-28)
TILT = math.cos(math.radians(45))
LIFT = math.sin(math.radians(45))
CX, CY = 1380, 1200  # world point at the art centre
SCALE = 0.6
FLAT = 0.5


def proj(x, y, z=0.0, flat=False):
    dx, dy = x - CX, y - CY
    rx = dx * math.cos(ANG) - dy * math.sin(ANG)
    ry = dx * math.sin(ANG) + dy * math.cos(ANG)
    if flat:
        return (SW / 2 + rx * FLAT, SH / 2 + ry * FLAT)
    return (SW / 2 + rx * SCALE, SH / 2 + 20 + ry * TILT * SCALE - z * LIFT)


def d(points, flat=False, z=0.0):
    p = [proj(x, y, z, flat) for x, y in points]
    return "M" + "L".join(f"{a:.0f} {b:.0f}" for a, b in p) + "Z"


def line_d(points, flat=False):
    p = [proj(x, y, 0, flat) for x, y in points]
    return "M" + "L".join(f"{a:.0f} {b:.0f}" for a, b in p)


# ---- geography (world units) ----
def coast(y):  # mainland east edge
    return 900 + 70 * math.sin(y / 260) + 30 * math.sin(y / 97 + 1)


def isl_w(y):  # barrier island west edge
    return 1500 + 60 * math.sin(y / 330 + 0.6) + 15 * math.sin(y / 71)


def isl_e(y):
    return isl_w(y) + 330 + 30 * math.sin(y / 180)


Y0, Y1 = -1800, 4200
X0 = -2600
ys = list(range(Y0, Y1 + 1, 40))
mainland = [(X0, Y0)] + [(coast(y), y) for y in ys] + [(X0, Y1)]
main_shallow = [(X0, Y0)] + [(coast(y) + 110 + 30 * math.sin(y / 140), y) for y in ys] + [(X0, Y1)]
island = [(isl_w(y), y) for y in ys] + [(isl_e(y), y) for y in reversed(ys)]
isl_shallow = [(isl_w(y) - 90, y) for y in ys] + [(isl_e(y) + 260 + 60 * math.sin(y / 210), y) for y in reversed(ys)]
beach = [(isl_e(y) - 85 - 10 * math.sin(y / 60), y) for y in ys] + [(isl_e(y), y) for y in reversed(ys)]


def blob(cx, cy, rx, ry, n=16, j=0.2):
    out = []
    for i in range(n):
        a = 2 * math.pi * i / n
        r = 1 + random.uniform(-j, j)
        out.append((cx + math.cos(a) * rx * r, cy + math.sin(a) * ry * r))
    return out


sandbars = [blob(1150, 300, 120, 40), blob(1230, 1700, 90, 30), blob(2300, 2100, 140, 45), blob(2250, 600, 100, 35), blob(2500, 1300, 90, 30)]
bay_islands = [blob(1200, 950, 110, 70), blob(1260, 2350, 90, 60)]
parks = [blob(300, 700, 160, 110), blob(520, 1900, 130, 90), blob(-500, 1400, 180, 120), blob(1700, 2600, 70, 120, j=0.1)]

# Fog of war: flat deep-navy polygons over unexplored ground, inside the view as in the frames.
fog_polys = [
    [(-900, -250), (150, -500), (420, 40), (60, 420), (-700, 520)],
    [(-1500, 1950), (-450, 1700), (-150, 2250), (-650, 2700), (-1500, 2600)],
    [(2150, 1800), (3000, 1500), (3300, 2300), (2500, 2700)],
    [(1900, -700), (2900, -900), (3000, -200), (2300, 50)],
]


def in_fog(x, y):
    for poly in fog_polys:
        inside = False
        for i in range(len(poly)):
            (ax, ay), (bx, by) = poly[i], poly[i - 1]
            if (ay > y) != (by > y) and x < (bx - ax) * (y - ay) / (by - ay) + ax:
                inside = not inside
        if inside:
            return True
    return False


# Roads on an irregular grid.
majors, minors = [], []
majors.append([(600 + y * 0.02, y) for y in range(Y0, Y1 + 1, 60)])  # mainland boulevard
majors.append([((isl_w(y) + isl_e(y)) / 2 - 30, y) for y in range(Y0, Y1 + 1, 40)])  # island avenue
for cy in (650, 1550, 2450):  # causeways
    majors.append([(x, cy + 0.03 * x) for x in range(X0, int(isl_e(cy)) + 1, 60)])


def on_main(x, y, pad=30):
    return x < coast(y) - pad


def on_island(x, y, pad=20):
    return isl_w(y) + pad < x < isl_e(y) - 90


def add_runs(points, ok):
    seg = []
    for x, y in points:
        if ok(x, y):
            seg.append((x, y))
        else:
            if len(seg) > 1:
                minors.append(seg)
            seg = []
    if len(seg) > 1:
        minors.append(seg)


def steps(start, end, lo, hi):
    out, v = [start], start
    while v < end:
        v += random.randint(lo, hi)
        out.append(v)
    return out


XS = steps(-2500, 900, 110, 230)
YS = steps(Y0, Y1, 85, 190)
for gx in XS:
    add_runs([(gx, y) for y in range(Y0, Y1, 20)], on_main)
for gy in YS:
    add_runs([(x, gy) for x in range(X0, 960, 20)], on_main)
IYS = steps(Y0, Y1, 80, 150)
for gy in IYS:
    add_runs([(x, gy) for x in range(1400, 2000, 10)], on_island)

# Buildings: each lot is a list of boxes (x, y, w, h, z).
lots = []


def free(box, ok):
    x, y, w, h, _ = box
    if not all(ok(px, py) for px, py in ((x, y), (x + w, y), (x, y + h), (x + w, y + h))):
        return False
    return not in_fog(x + w / 2, y + h / 2)


def row_houses(x0, y0, x1, y1, ok):
    # Narrow lots of mixed widths along the two long edges of the block.
    depth = random.randint(16, 26)
    for edge_y in (y0, y1 - depth):
        x = x0
        while x < x1 - 14:
            w = random.choice([14, 18, 22, 26, 34])
            w = min(w, x1 - x)
            if random.random() < 0.8:
                box = (x, edge_y, w - 3, depth, random.choice([4, 5, 6, 7, 9]))
                if free(box, ok):
                    lots.append([box])
            x += w


def l_shape(x0, y0, x1, y1, ok):
    w, h = x1 - x0, y1 - y0
    z = random.choice([8, 10, 12, 16])
    arm = random.uniform(0.35, 0.5)
    a = (x0, y0, w, h * arm, z)
    b = (x0, y0, w * arm, h, z) if random.random() < 0.5 else (x0 + w * (1 - arm), y0, w * arm, h, z)
    if free(a, ok) and free(b, ok):
        lots.append([a, b])


def warehouse(x0, y0, x1, y1, ok):
    box = (x0, y0, (x1 - x0) * random.uniform(0.6, 0.95), (y1 - y0) * random.uniform(0.55, 0.9), random.choice([6, 7, 9]))
    if free(box, ok):
        lots.append([box])


def tower(x0, y0, x1, y1, ok):
    w, h = x1 - x0, y1 - y0
    podium = (x0, y0, w, h, random.choice([6, 8]))
    tw, th = w * random.uniform(0.35, 0.55), h * random.uniform(0.35, 0.55)
    top = (x0 + (w - tw) / 2, y0 + (h - th) / 2, tw, th, random.choice([28, 36, 46]))
    if free(podium, ok):
        lots.append([podium, top])


def fill_block(x0, y0, x1, y1, ok):
    x0, y0, x1, y1 = x0 + 10, y0 + 9, x1 - 10, y1 - 9
    if x1 - x0 < 30 or y1 - y0 < 30:
        return
    r = random.random()
    if r < 0.12:
        return  # open lot
    if r < 0.45:
        row_houses(x0, y0, x1, y1, ok)
    elif r < 0.65:
        # Split the block into two or three lots of different kinds.
        cut = x0 + (x1 - x0) * random.uniform(0.35, 0.65)
        for a, b in ((x0, cut - 6), (cut + 6, x1)):
            random.choice([l_shape, warehouse, row_houses])(a, y0, b, y1, ok)
    elif r < 0.8:
        l_shape(x0, y0, x1, y1, ok)
    elif r < 0.93:
        warehouse(x0, y0, x1, y1, ok)
    else:
        tower(x0, y0, x1, y1, ok)


for i in range(len(XS) - 1):
    for j in range(len(YS) - 1):
        fill_block(XS[i], YS[j], XS[i + 1], YS[j + 1], on_main)
for j in range(len(IYS) - 1):
    y0, y1 = IYS[j], IYS[j + 1]
    mid = (isl_w(y0) + isl_e(y0)) / 2 - 30
    fill_block(isl_w(y0) + 15, y0, mid - 8, y1, on_island)
    fill_block(mid + 8, y0, isl_e(y0) - 85, y1, on_island)


def visible(box):
    x, y, w, h, z = box
    sx, sy = proj(x + w / 2, y + h / 2)
    return -80 < sx < SW + 80 and -60 < sy < SH + 160


lots = [lot for lot in lots if visible(lot[0])]
boxes = [box for lot in lots for box in lot]


def box_paths(b):
    x, y, w, h, z = b
    foot = [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]
    walls = []
    for k in range(4):
        a, c = foot[k], foot[(k + 1) % 4]
        (ax, ay), (cx, cy) = proj(*a), proj(*c)
        # A wall faces the camera when its outward normal points down-screen.
        if -(cx - ax) <= 0:
            continue
        top_a, top_c = proj(*a, z), proj(*c, z)
        walls.append(f"M{ax:.0f} {ay:.0f}L{cx:.0f} {cy:.0f}L{top_c[0]:.0f} {top_c[1]:.0f}L{top_a[0]:.0f} {top_a[1]:.0f}Z")
    return "".join(walls), d(foot, z=z), d(foot, flat=True)


order = sorted(boxes, key=lambda b: (proj(b[0] + b[2] / 2, b[1] + b[3] / 2)[1], b[4]))
bdata = [box_paths(b) for b in order]

# Blips: one lot per legend category, spread around the middle of the art so a pan never shows an edge.
CATS = ["nav", "story", "robberies", "activities", "vehicles", "ammu", "style", "food"]
candidates = []
for lot in lots:
    x, y, w, h, _ = lot[0]
    sx, sy = proj(x + w / 2, y + h / 2)
    fx, fy = proj(x + w / 2, y + h / 2, flat=True)
    if 1000 < sx < 1880 and 580 < sy < 1040 and 1000 < fx < 1880 and 580 < fy < 1040:
        candidates.append((x + w / 2, y + h / 2))
random.shuffle(candidates)
blips = []
for c in candidates:
    if all(math.dist(proj(*c), proj(*b)) > 110 for b in blips):
        blips.append(c)
    if len(blips) == len(CATS):
        break
assert len(blips) == len(CATS), "not enough land for blips"


def svg(flat):
    f = flat
    ground = [
        f'<rect width="{SW}" height="{SH}" fill="#4e9fba"/>',
        f'<path d="{d(main_shallow, f)}{d(isl_shallow, f)}" fill="#62b4cf"/>',
        f'<path d="{d(mainland, f)}{d(island, f)}{"".join(d(b, f) for b in bay_islands)}" fill="#adb1b9"/>',
        f'<path d="{d(beach, f)}{"".join(d(b, f) for b in sandbars)}" fill="#e2d1a2"/>',
        f'<path d="{"".join(d(p, f) for p in parks)}" fill="#9fb3a6"/>',
        f'<path d="{"".join(line_d(s, f) for s in minors)}" fill="none" stroke="#c6c8cc" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>',
        f'<path d="{"".join(line_d(s, f) for s in majors)}" fill="none" stroke="#cdccbd" stroke-width="13" stroke-linejoin="round" stroke-linecap="round"/>',
    ]
    if flat:
        blocks = [f'<path d="{"".join(b[2] for b in bdata)}" fill="#8a9db5"/>']
    else:
        blocks = [f'<path d="{w}" fill="#7e92ab"/><path d="{t}" fill="#98aac0"/>' for w, t, _ in bdata]
    fog = f'<path d="{"".join(d(x, f) for x in fog_polys)}" fill="#1d2437"/>'
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SW} {SH}" width="{SW}" height="{SH}">'
        + "".join(ground) + "".join(blocks) + fog + "</svg>\n"
    )


here = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(here, "..", "public", "vc")
for name, flat in (("map-3d.svg", False), ("map-2d.svg", True)):
    with open(os.path.join(root, name), "w") as fh:
        fh.write(svg(flat))
    print(name, os.path.getsize(os.path.join(root, name)))

# Road graph for the GPS route, in world units: grid intersections joined along the drawn road runs.
nodes, index, edges = [], {}, set()


def node(x, y):
    key = (round(x), round(y))
    if key not in index:
        index[key] = len(nodes)
        nodes.append(key)
    return index[key]


def joined(a, b, ok, step=20):
    n = max(1, int(math.dist(a, b) // step))
    return all(ok(a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n) for k in range(n + 1))


def link(a, b, ok):
    if joined(a, b, ok):
        edges.add(tuple(sorted((node(*a), node(*b)))))


for gx in XS:
    for y0, y1 in zip(YS, YS[1:]):
        link((gx, y0), (gx, y1), on_main)
for gy in YS:
    for x0, x1 in zip(XS, XS[1:]):
        link((x0, gy), (x1, gy), on_main)


def avenue(y):
    return (isl_w(y) + isl_e(y)) / 2 - 30


for y0, y1 in zip(IYS, IYS[1:]):
    edges.add(tuple(sorted((node(avenue(y0), y0), node(avenue(y1), y1)))))
for gy in IYS:
    for end in (isl_w(gy) + 21, isl_e(gy) - 91):
        link((avenue(gy), gy), (end, gy), lambda x, y: on_island(x, y))
for cy in (650, 1550, 2450):
    stops = [(gx, cy + 0.03 * gx) for gx in XS if on_main(gx, cy + 0.03 * gx)]
    ax = avenue(cy)
    stops.append((ax, cy + 0.03 * ax))
    for a, b in zip(stops, stops[1:]):
        edges.add(tuple(sorted((node(*a), node(*b)))))
    # Each causeway stop joins the grid nodes just above and below it, and the avenue on the island.
    for gx, y in stops[:-1]:
        for y0, y1 in zip(YS, YS[1:]):
            if y0 <= y <= y1:
                link((gx, y), (gx, y0), on_main)
                link((gx, y), (gx, y1), on_main)
    for y0, y1 in zip(IYS, IYS[1:]):
        if y0 <= stops[-1][1] <= y1:
            for gy in (y0, y1):
                edges.add(tuple(sorted((node(*stops[-1]), node(avenue(gy), gy)))))


def shown(i):
    x, y = proj(*nodes[i])
    return -300 < x < SW + 300 and -300 < y < SH + 300


edges = sorted(e for e in edges if shown(e[0]) and shown(e[1]))
keep = sorted({i for e in edges for i in e})
renum = {old: new for new, old in enumerate(keep)}
road_nodes = ", ".join(f"{nodes[i][0]}, {nodes[i][1]}" for i in keep)
road_edges = ", ".join(f"{renum[a]}, {renum[b]}" for a, b in edges)

rows = []
for cat, b in zip(CATS, blips):
    (x3, y3), (x2, y2) = proj(*b), proj(*b, flat=True)
    rows.append(f'  {cat}: {{ tilted: [{x3:.0f}, {y3:.0f}], flat: [{x2:.0f}, {y2:.0f}], world: [{b[0]:.0f}, {b[1]:.0f}] }},')
ts = (
    "// Generated by scripts/gen-map.py: where each legend category's blip sits on the map art, in art pixels and world units,\n"
    "// how world units project onto each view, and the road graph the GPS route follows.\n"
    f"const ART = {{ width: {SW}, height: {SH} }}\n\n"
    f"const PROJECTION = {{ cx: {CX}, cy: {CY}, angle: {ANG:.6f}, scale: {SCALE}, tilt: {TILT:.6f}, flat: {FLAT} }}\n\n"
    "const BLIPS: Record<string, { tilted: [number, number]; flat: [number, number]; world: [number, number] }> = {\n"
    + "\n".join(rows)
    + "\n}\n\n"
    "// Pairs of world x, y; then pairs of node indexes.\n"
    f"const ROAD_NODES = [{road_nodes}]\n\n"
    f"const ROAD_EDGES = [{road_edges}]\n\n"
    "export { ART, BLIPS, PROJECTION, ROAD_EDGES, ROAD_NODES }\n"
)
with open(os.path.join(here, "..", "src", "leonida", "map-screen.blips.ts"), "w") as fh:
    fh.write(ts)
print("blips", len(blips), "boxes", len(boxes))
