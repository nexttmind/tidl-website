#!/usr/bin/env python3
"""TIDL category and direction marks. Pass 03.

Filled stamps. One metaphor, one silhouette. Organic marks are tapered
ribbons, not stacked primitives. Same ink, same canvas, same weight.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "brand" / "peptide" / "marks" / "stamp"
SHEET = ROOT / "public" / "brand" / "peptide" / "marks" / "_sheet-stamp.png"

PAPER = (251, 249, 246, 255)
INK = (26, 26, 26, 255)
SIZE = 1024
VIEW = 240.0
CX = 120.0
CY = 120.0
K = 0.5522847498307936


def _f(n: float) -> str:
    v = round(float(n), 2)
    if abs(v - round(v)) < 0.005:
        return str(int(round(v)))
    return f"{v:.2f}".rstrip("0").rstrip(".")


def polar(cx: float, cy: float, r: float, deg: float) -> tuple[float, float]:
    a = math.radians(deg)
    return cx + r * math.cos(a), cy + r * math.sin(a)


def circle(cx: float, cy: float, r: float) -> str:
    k = r * K
    return (
        f"M {_f(cx + r)} {_f(cy)} "
        f"C {_f(cx + r)} {_f(cy + k)} {_f(cx + k)} {_f(cy + r)} {_f(cx)} {_f(cy + r)} "
        f"C {_f(cx - k)} {_f(cy + r)} {_f(cx - r)} {_f(cy + k)} {_f(cx - r)} {_f(cy)} "
        f"C {_f(cx - r)} {_f(cy - k)} {_f(cx - k)} {_f(cy - r)} {_f(cx)} {_f(cy - r)} "
        f"C {_f(cx + k)} {_f(cy - r)} {_f(cx + r)} {_f(cy - k)} {_f(cx + r)} {_f(cy)} Z"
    )


def ellipse(cx: float, cy: float, rx: float, ry: float) -> str:
    kx, ky = rx * K, ry * K
    return (
        f"M {_f(cx + rx)} {_f(cy)} "
        f"C {_f(cx + rx)} {_f(cy + ky)} {_f(cx + kx)} {_f(cy + ry)} {_f(cx)} {_f(cy + ry)} "
        f"C {_f(cx - kx)} {_f(cy + ry)} {_f(cx - rx)} {_f(cy + ky)} {_f(cx - rx)} {_f(cy)} "
        f"C {_f(cx - rx)} {_f(cy - ky)} {_f(cx - kx)} {_f(cy - ry)} {_f(cx)} {_f(cy - ry)} "
        f"C {_f(cx + kx)} {_f(cy - ry)} {_f(cx + rx)} {_f(cy - ky)} {_f(cx + rx)} {_f(cy)} Z"
    )


def stadium(cx: float, cy: float, w: float, h: float) -> str:
    r = h / 2
    left, right = cx - w / 2 + r, cx + w / 2 - r
    k = r * K
    return (
        f"M {_f(left)} {_f(cy - r)} "
        f"L {_f(right)} {_f(cy - r)} "
        f"C {_f(right + k)} {_f(cy - r)} {_f(right + r)} {_f(cy - k)} {_f(right + r)} {_f(cy)} "
        f"C {_f(right + r)} {_f(cy + k)} {_f(right + k)} {_f(cy + r)} {_f(right)} {_f(cy + r)} "
        f"L {_f(left)} {_f(cy + r)} "
        f"C {_f(left - k)} {_f(cy + r)} {_f(left - r)} {_f(cy + k)} {_f(left - r)} {_f(cy)} "
        f"C {_f(left - r)} {_f(cy - k)} {_f(left - k)} {_f(cy - r)} {_f(left)} {_f(cy - r)} Z"
    )


def cubic_bez(p0, p1, p2, p3, steps: int = 20) -> list[tuple[float, float]]:
    pts = []
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        x = u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0]
        y = u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1]
        pts.append((x, y))
    return pts


def sample_to_path(pts: list[tuple[float, float]], closed: bool = True) -> str:
    if len(pts) < 2:
        return ""
    seq = pts[:]
    if closed:
        seq = [pts[-1]] + pts + [pts[0], pts[1]]
    else:
        seq = [pts[0]] + pts + [pts[-1]]
    parts = [f"M {_f(pts[0][0])} {_f(pts[0][1])}"]
    limit = len(pts) if closed else len(pts) - 1
    for i in range(limit):
        p0, p1, p2 = seq[i], seq[i + 1], seq[i + 2]
        p3 = seq[i + 3] if i + 3 < len(seq) else seq[-1]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        parts.append(
            f"C {_f(c1[0])} {_f(c1[1])} {_f(c2[0])} {_f(c2[1])} {_f(p2[0])} {_f(p2[1])}"
        )
    if closed:
        parts.append("Z")
    return " ".join(parts)


def ribbon(center: list[tuple[float, float]], half: list[float]) -> str:
    """Closed silhouette along a spine. Normals are averaged so the edge stays clean."""
    n = len(center)
    tangents: list[tuple[float, float]] = []
    for i in range(n):
        if i == 0:
            tx, ty = center[1][0] - center[0][0], center[1][1] - center[0][1]
        elif i == n - 1:
            tx, ty = center[i][0] - center[i - 1][0], center[i][1] - center[i - 1][1]
        else:
            tx = center[i + 1][0] - center[i - 1][0]
            ty = center[i + 1][1] - center[i - 1][1]
        mag = math.hypot(tx, ty) or 1.0
        tangents.append((tx / mag, ty / mag))
    # blend neighboring tangents so high-curvature corners do not kink
    smooth_t: list[tuple[float, float]] = []
    for i in range(n):
        accx = accy = 0.0
        for j in range(max(0, i - 2), min(n, i + 3)):
            accx += tangents[j][0]
            accy += tangents[j][1]
        mag = math.hypot(accx, accy) or 1.0
        smooth_t.append((accx / mag, accy / mag))
    left: list[tuple[float, float]] = []
    right: list[tuple[float, float]] = []
    for i in range(n):
        tx, ty = smooth_t[i]
        nx, ny = -ty, tx
        w = half[i]
        left.append((center[i][0] + nx * w, center[i][1] + ny * w))
        right.append((center[i][0] - nx * w, center[i][1] - ny * w))
    return sample_to_path(left + list(reversed(right)), closed=True)


def taper(n: int, mid: float, tip: float = 1.8, hold: float = 0.22) -> list[float]:
    """Width envelope. Thick through the middle, pointed at both ends."""
    out = []
    for i in range(n):
        t = i / (n - 1)
        edge = min(t, 1 - t) / hold
        out.append(lerp(tip, mid, smooth(min(1.0, edge))))
    return out


def spine(n: int, fn) -> list[tuple[float, float]]:
    return [fn(i / (n - 1)) for i in range(n)]


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def smooth(t: float) -> float:
    return t * t * (3 - 2 * t)


@dataclass(frozen=True)
class Mark:
    slug: str
    label: str
    kind: str
    form: str
    why: str
    fills: tuple[str, ...]
    evenodd: bool = False


def blob_curve(
    pts: list[tuple[float, float]],
    radii: list[float],
    step: float = 3.2,
) -> tuple[str, ...]:
    """Smooth taper. Circles overlap enough to read as one body."""
    if len(pts) < 2:
        return tuple(circle(x, y, r) for (x, y), r in zip(pts, radii))
    # resample by arc length
    dists = [0.0]
    for i in range(1, len(pts)):
        dists.append(dists[-1] + math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
    total = dists[-1] or 1.0
    out: list[str] = []
    d = 0.0
    while d <= total:
        t = d / total
        # find segment
        j = 1
        while j < len(dists) and dists[j] < d:
            j += 1
        j = min(j, len(pts) - 1)
        span = dists[j] - dists[j - 1] or 1.0
        u = (d - dists[j - 1]) / span
        x = lerp(pts[j - 1][0], pts[j][0], u)
        y = lerp(pts[j - 1][1], pts[j][1], u)
        r = lerp(radii[j - 1], radii[j], u)
        out.append(circle(x, y, max(r, step * 0.65)))
        d += step
    out.append(circle(pts[-1][0], pts[-1][1], radii[-1]))
    return tuple(out)


def filled_u(
    cx: float,
    cy: float,
    r_out: float,
    r_in: float,
    open_deg: float = 70,
    heading: float = 90,
) -> str:
    """Solid bowl. Opening faces `heading` degrees (90 is up)."""

    def arc_d(r: float, start: float, end: float) -> list[str]:
        sweep = end - start
        steps = max(1, int(math.ceil(abs(sweep) / 90)))
        parts = []
        for i in range(steps):
            t0 = start + sweep * (i / steps)
            t1 = start + sweep * ((i + 1) / steps)
            p0 = polar(cx, cy, r, t0)
            p1 = polar(cx, cy, r, t1)
            a0r, a1r = math.radians(t0), math.radians(t1)
            da = a1r - a0r
            alpha = (4 / 3) * math.tan(da / 4) * r
            c1 = (p0[0] - alpha * math.sin(a0r), p0[1] + alpha * math.cos(a0r))
            c2 = (p1[0] + alpha * math.sin(a1r), p1[1] - alpha * math.cos(a1r))
            parts.append(
                f"C {_f(c1[0])} {_f(c1[1])} {_f(c2[0])} {_f(c2[1])} {_f(p1[0])} {_f(p1[1])}"
            )
        return parts

    o0 = heading + open_deg / 2
    o1 = heading + 360 - open_deg / 2
    i0 = heading - open_deg / 2
    left_out = polar(cx, cy, r_out, o0)
    right_in = polar(cx, cy, r_in, heading - open_deg / 2)
    parts = [f"M {_f(left_out[0])} {_f(left_out[1])}"]
    parts.extend(arc_d(r_out, o0, o1))
    parts.append(f"L {_f(right_in[0])} {_f(right_in[1])}")
    parts.extend(arc_d(r_in, i0 + 360, heading + open_deg / 2))
    parts.append("Z")
    return " ".join(parts)


def semicircle_up(cx: float, cy: float, r: float) -> str:
    """Filled upper half-disk. Baseline at cy, dome goes up."""
    k = r * K
    return (
        f"M {_f(cx - r)} {_f(cy)} "
        f"C {_f(cx - r)} {_f(cy - k)} {_f(cx - k)} {_f(cy - r)} {_f(cx)} {_f(cy - r)} "
        f"C {_f(cx + k)} {_f(cy - r)} {_f(cx + r)} {_f(cy - k)} {_f(cx + r)} {_f(cy)} Z"
    )


def curve_pts(n: int, fn) -> list[tuple[float, float]]:
    return [fn(i / (n - 1)) for i in range(n)]


def exec_mark() -> Mark:
    # Daily Balance. A head above a body. Gap is the composure.
    head = circle(CX, 68, 30)
    body = semicircle_up(CX, 188, 74)
    return Mark(
        "executive",
        "Executives",
        "category",
        "Composure",
        "A figure at rest. Head above a body. The gap holds.",
        (head, body),
    )


def athlete_mark() -> Mark:
    # Motion Balance. Two waves. Work in rhythm.
    waves: list[str] = []
    for y0 in (94.0, 150.0):
        def pos(t: float, y0: float = y0) -> tuple[float, float]:
            return 16 + 208 * t, y0 - 24 * math.sin(2 * math.pi * t)

        pts = spine(72, pos)
        waves.append(ribbon(pts, taper(len(pts), 10.5, 1.6, 0.2)))
    return Mark(
        "athlete",
        "Athletes",
        "category",
        "Motion",
        "Two waves. Work in rhythm.",
        tuple(waves),
    )


def transform_mark() -> Mark:
    # Foundation. Broad outer coil, a point at the center.
    def pos(t: float) -> tuple[float, float]:
        ang = math.radians(30) + 2.05 * 2 * math.pi * t
        r = 5 + 78 * t
        return CX + r * math.cos(ang), CY + r * math.sin(ang)

    pts = spine(150, pos)
    half = [lerp(2.2, 16.5, smooth(i / (len(pts) - 1))) for i in range(len(pts))]
    cap = circle(pts[-1][0], pts[-1][1], half[-1])
    return Mark(
        "transformation",
        "Transformation",
        "category",
        "Turn",
        "A spiral that opens. Reset.",
        (ribbon(pts, half), cap),
    )


def parents_mark() -> Mark:
    # Deep Reset. A bowl that opens up. A life sitting in it.
    cy, r_out, r_in, open_deg = 150.0, 86.0, 54.0, 102.0
    heading = 270.0
    bowl = filled_u(CX, cy, r_out, r_in, open_deg=open_deg, heading=heading)
    mid_r = (r_out + r_in) / 2
    cap_r = (r_out - r_in) / 2
    cap_a = heading + open_deg / 2
    cap_b = heading - open_deg / 2
    life = circle(CX, 132, 24)
    return Mark(
        "parents",
        "Parents",
        "category",
        "Hold",
        "A bowl around a life.",
        (bowl, circle(*polar(CX, cy, mid_r, cap_a), cap_r), circle(*polar(CX, cy, mid_r, cap_b), cap_r), life),
    )


def creators_mark() -> Mark:
    # Explore. Four-lobe clover. Thought opening.
    lobes = [circle(*polar(CX, CY, 34, deg), 32) for deg in (90, 0, -90, 180)]
    lobes.append(circle(CX, CY, 22))
    return Mark(
        "creative",
        "Creators",
        "category",
        "Spark",
        "Four lobes from a center. A thought opening.",
        tuple(lobes),
    )


def healthspan_mark() -> Mark:
    # Root System. A ground, and years going down.
    bar = stadium(CX, 64, 168, 22)
    roots: list[str] = []
    specs = (
        (-62, -36, 86, 9.0),
        (-32, -10, 112, 10.5),
        (0, 8, 122, 11.0),
        (30, -14, 104, 10.0),
        (60, 26, 80, 8.8),
    )
    for dx, bend, length, r0 in specs:
        def pos(t: float, dx=dx, bend=bend, length=length) -> tuple[float, float]:
            return CX + dx + bend * (t**1.4), 74 + length * t

        pts = spine(48, pos)
        half = [lerp(r0, 1.6, smooth(i / (len(pts) - 1))) for i in range(len(pts))]
        roots.append(ribbon(pts, half))
    return Mark(
        "legacy",
        "Healthspan",
        "category",
        "Root",
        "Planted. Years going down.",
        (bar, *roots),
    )


def traveler_mark() -> Mark:
    # Dawn Protocol. One horizon. Nothing else.
    def pos(t: float) -> tuple[float, float]:
        x = 16 + 208 * t
        y = 148 - 42 * math.sin(math.pi * t)
        return x, y

    pts = spine(56, pos)
    return Mark(
        "traveler",
        "Jetlag Recovery",
        "category",
        "Horizon",
        "One arch. Dawn.",
        (ribbon(pts, taper(len(pts), 13.5, 1.6, 0.32)),),
    )


def metabolic_mark() -> Mark:
    # Vital Loop. A living cycle. Petals around a void.
    n = 96
    pts = []
    for i in range(n):
        th = 2 * math.pi * i / n
        r = 60 + 17 * math.cos(8 * th)
        pts.append((CX + r * math.cos(th), CY + r * math.sin(th)))
    return Mark(
        "metabolic",
        "Metabolic",
        "direction",
        "Cycle",
        "Fuel going around.",
        (sample_to_path(pts, closed=True) + " " + circle(CX, CY, 22),),
        evenodd=True,
    )


def repair_mark() -> Mark:
    # Two cells becoming one.
    return Mark(
        "repair",
        "Repair",
        "direction",
        "Mend",
        "Two bodies joining.",
        (circle(94, CY, 50), circle(146, CY, 50)),
    )


def mental_mark() -> Mark:
    # Recovery Signal. A point, and two waves gathering to it.
    core = circle(62, CY, 17)
    waves: list[str] = []
    for r, mid in ((50, 8.4), (80, 8.4)):
        def pos(t: float, r=r) -> tuple[float, float]:
            a = math.radians(-60 + 120 * t)
            return 62 + r * math.cos(a), CY + r * math.sin(a)

        pts = spine(40, pos)
        waves.append(ribbon(pts, taper(len(pts), mid, 1.7, 0.24)))
    return Mark(
        "mental",
        "Mental",
        "direction",
        "Focus",
        "A point. Waves collecting to it.",
        (core, *waves),
    )


def sleep_mark() -> Mark:
    # Night Signal. A crescent, and a body in the opening.
    moon = circle(108, CY, 74) + " " + circle(134, CY - 2, 56)
    body = circle(176, CY, 13)
    return Mark(
        "sleep",
        "Sleep",
        "direction",
        "Night",
        "A crescent. Depth.",
        (moon, body),
        evenodd=True,
    )


def marks() -> tuple[Mark, ...]:
    return (
        exec_mark(),
        athlete_mark(),
        transform_mark(),
        parents_mark(),
        creators_mark(),
        healthspan_mark(),
        traveler_mark(),
        metabolic_mark(),
        repair_mark(),
        mental_mark(),
        sleep_mark(),
    )


def svg_for(mark: Mark) -> str:
    rule = ' fill-rule="evenodd"' if mark.evenodd else ""
    fills = "\n".join(
        f'<path d="{d}" fill="#1A1A1A"{rule}/>' for d in mark.fills
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" '
        f'viewBox="0 0 240 240" role="img" aria-label="{mark.label}">\n'
        f'<rect width="240" height="240" fill="#FBF9F6"/>\n'
        f"{fills}\n</svg>\n"
    )


def flatten_path(d: str) -> list[list[tuple[float, float]]]:
    tokens = d.replace(",", " ").split()
    polys: list[list[tuple[float, float]]] = []
    cur: list[tuple[float, float]] = []
    i = 0
    cx = cy = 0.0
    start = (0.0, 0.0)

    def num() -> float:
        nonlocal i
        v = float(tokens[i])
        i += 1
        return v

    while i < len(tokens):
        cmd = tokens[i]
        if cmd in "MLCZ":
            i += 1
        if cmd == "M":
            if cur:
                polys.append(cur)
            cx, cy = num(), num()
            start = (cx, cy)
            cur = [(cx, cy)]
        elif cmd == "L":
            cx, cy = num(), num()
            cur.append((cx, cy))
        elif cmd == "C":
            x1, y1, x2, y2, x, y = num(), num(), num(), num(), num(), num()
            cur.extend(cubic_bez((cx, cy), (x1, y1), (x2, y2), (x, y), 16)[1:])
            cx, cy = x, y
        elif cmd == "Z":
            cur.append(start)
            cx, cy = start
        else:
            i += 1
    if cur:
        polys.append(cur)
    return polys


def raster(mark: Mark, size: int = SIZE) -> Image.Image:
    img = Image.new("RGBA", (size, size), PAPER)
    draw = ImageDraw.Draw(img)
    scale = size / VIEW
    for d in mark.fills:
        polys = flatten_path(d)
        if mark.evenodd and len(polys) >= 2:
            # outer then punch
            outer = [(x * scale, y * scale) for x, y in polys[0]]
            draw.polygon(outer, fill=INK)
            for hole in polys[1:]:
                pts = [(x * scale, y * scale) for x, y in hole]
                draw.polygon(pts, fill=PAPER)
        else:
            for poly in polys:
                if len(poly) < 3:
                    continue
                pts = [(x * scale, y * scale) for x, y in poly]
                draw.polygon(pts, fill=INK)
    return img


def sheet_image(items: tuple[Mark, ...]) -> Image.Image:
    cols = 4
    rows = math.ceil(len(items) / cols)
    cell = 380
    pad = 48
    w = pad * 2 + cols * cell
    h = pad * 2 + rows * cell
    img = Image.new("RGBA", (w, h), PAPER)
    for i, mark in enumerate(items):
        r, c = divmod(i, cols)
        tile = raster(mark, 300)
        x = pad + c * cell + 40
        y = pad + r * cell + 40
        img.paste(tile, (x, y), tile)
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    items = marks()
    for mark in items:
        (OUT / f"{mark.kind}-{mark.slug}.svg").write_text(svg_for(mark), encoding="utf-8")
        raster(mark).save(OUT / f"{mark.kind}-{mark.slug}.png")
        white = raster(mark)
        datas = []
        for px in white.getdata():
            if px[0] > 240 and px[1] > 240 and px[2] > 240:
                datas.append((0, 0, 0, 0))
            else:
                datas.append((255, 255, 255, 255))
        wimg = Image.new("RGBA", white.size)
        wimg.putdata(datas)
        (OUT / "white").mkdir(exist_ok=True)
        wimg.save(OUT / "white" / f"{mark.kind}-{mark.slug}.png")
    sheet_image(items).save(SHEET)
    print(f"wrote {len(items)} stamps to {OUT}")


if __name__ == "__main__":
    main()
