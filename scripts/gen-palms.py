"""Draws public/textures/palms.svg: two original coconut palms as soft, dark silhouettes for the wordmark fill.
The sun washes them out toward the bottom."""
import math

W, H = 1200, 400
INK = "#1b0b3f"


def bez(p0, p1, p2, t):
    return tuple((1 - t) ** 2 * a + 2 * (1 - t) * t * b + t * t * c for a, b, c in zip(p0, p1, p2))


def path(pts):
    return f'<path d="M{" L".join(f"{x:.0f},{y:.0f}" for x, y in pts)}Z"/>'


def frond(base, side, reach, drop, size):
    """An arching rib with thin leaflets hanging from it, like a coconut palm frond."""
    bx, by = base
    tip = (bx + side * reach * size, by + drop * size)
    ctrl = (bx + side * reach * size * 0.45, by - size * 0.28)
    n = 26
    rib = [bez(base, ctrl, tip, i / n) for i in range(n + 1)]
    top = [(x, y - size * 0.03 * (1 - 0.7 * i / n)) for i, (x, y) in enumerate(rib)]
    teeth = []
    for i in range(n, 0, -1):
        x, y = rib[i]
        t = i / n
        leaf = size * (0.26 - 0.14 * t)
        teeth += [(x + side * 3, y), (x - side * leaf * 0.22, y + leaf), (x - side * 4, y)]
    return path(top + teeth)


def palm(base_x, crown, lean, size):
    cx, cy = crown
    mid = ((base_x + cx) / 2 + lean, (H + cy) / 2)
    left, right = [], []
    for i in range(41):
        t = i / 40
        x, y = bez((base_x, H + 30), mid, (cx, cy), t)
        w = size * 0.045 * (1 - 0.4 * t)
        left.append((x - w, y))
        right.append((x + w, y))
    shapes = [path(left + right[::-1])]
    for side in (-1, 1):
        for reach, drop in [(1.0, 0.42), (0.85, 0.12), (0.62, -0.12), (0.34, -0.3), (0.55, 0.62)]:
            shapes.append(frond(crown, side, reach * 0.9, drop, size))
    shapes += [f'<circle cx="{cx + dx:.0f}" cy="{cy + dy:.0f}" r="{size * 0.022:.0f}"/>' for dx, dy in [(-9, 10), (7, 12), (0, 19)]]
    return "".join(shapes)


body = palm(260, (330, 120), -40, 300) + palm(960, (860, 95), 45, 330)
svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice">'
    '<filter id="soft"><feGaussianBlur stdDeviation="0.8"/></filter>'
    '<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.27" stop-color="#fff"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/></linearGradient>'
    f'<mask id="sunwash"><rect width="{W}" height="{H}" fill="url(#fade)"/></mask>'
    f'<g fill="{INK}" opacity="0.55" filter="url(#soft)" mask="url(#sunwash)">{body}</g></svg>'
)
open("public/textures/palms.svg", "w").write(svg)
