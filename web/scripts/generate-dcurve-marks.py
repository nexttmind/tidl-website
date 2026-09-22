#!/usr/bin/env python3
"""TIDL peptide marks. The D-curve is the module.

The wordmark is right angles plus the D bowl. These marks let that bowl
live: same radius family, same stroke, same round terminals. Category
marks are composed. Direction marks are atomic. No molecule names.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "brand" / "peptide" / "marks" / "line"
SHEET = ROOT / "public" / "brand" / "peptide" / "marks" / "_sheet-dcurve.png"

PAPER = (251, 249, 246, 255)
INK = (26, 26, 26, 255)
SIZE = 1024
VIEW = 240.0
STROKE = 7.0
# Wordmark D bowl radius / letter height = 61.19 / 224.35
R = 36.0
K = 0.5522847498307936
CX = 120.0
CY = 120.0


def _fmt(n: float) -> str:
    v = round(n, 2)
    if abs(v - int(v)) < 0.001:
        return str(int(v))
    return f"{v:.2f}".rstrip("0").rstrip(".")


def _pt(x: float, y: float) -> str:
    return f"{_fmt(x)} {_fmt(y)}"


def polar(cx: float, cy: float, r: float, deg: float) -> tuple[float, float]:
    a = math.radians(deg)
    return cx + r * math.cos(a), cy + r * math.sin(a)


def rotate(x: float, y: float, deg: float, ox: float = CX, oy: float = CY) -> tuple[float, float]:
    a = math.radians(deg)
    dx, dy = x - ox, y - oy
    return ox + dx * math.cos(a) - dy * math.sin(a), oy + dx * math.sin(a) + dy * math.cos(a)


class Path:
    def __init__(self) -> None:
        self.parts: list[str] = []

    def M(self, x: float, y: float) -> Path:
        self.parts.append(f"M {_pt(x, y)}")
        return self

    def L(self, x: float, y: float) -> Path:
        self.parts.append(f"L {_pt(x, y)}")
        return self

    def C(self, x1: float, y1: float, x2: float, y2: float, x: float, y: float) -> Path:
        self.parts.append(f"C {_pt(x1, y1)} {_pt(x2, y2)} {_pt(x, y)}")
        return self

    def Z(self) -> Path:
        self.parts.append("Z")
        return self

    def arc(self, cx: float, cy: float, r: float, a0: float, a1: float) -> Path:
        """Circular arc in degrees. Positive sweep is CCW."""
        sweep = a1 - a0
        steps = max(1, int(math.ceil(abs(sweep) / 90.0)))
        for i in range(steps):
            t0 = a0 + sweep * (i / steps)
            t1 = a0 + sweep * ((i + 1) / steps)
            p0 = polar(cx, cy, r, t0)
            p1 = polar(cx, cy, r, t1)
            a0r, a1r = math.radians(t0), math.radians(t1)
            da = a1r - a0r
            alpha = (4 / 3) * math.tan(da / 4)
            c1 = (
                p0[0] - alpha * r * math.sin(a0r),
                p0[1] + alpha * r * math.cos(a0r),
            )
            c2 = (
                p1[0] + alpha * r * math.sin(a1r),
                p1[1] - alpha * r * math.cos(a1r),
            )
            if not self.parts:
                self.M(*p0)
            self.C(*c1, *c2, *p1)
        return self

    def move_arc(self, cx: float, cy: float, r: float, a0: float, a1: float) -> Path:
        self.M(*polar(cx, cy, r, a0))
        return self.arc(cx, cy, r, a0, a1)

    def d(self) -> str:
        return " ".join(self.parts)


def d_oval(
    cx: float,
    cy: float,
    rx: float,
    ry: float,
    left_r: float | None = None,
    right_r: float | None = None,
    rot: float = 0.0,
) -> str:
    """Closed D-family oval. Flatter left stem, fuller right bowl."""
    lr = left_r if left_r is not None else min(rx, ry) * 0.62
    rr = right_r if right_r is not None else min(rx, ry)
    lr = min(lr, ry, rx)
    rr = min(rr, ry, rx)

    def xf(x: float, y: float) -> tuple[float, float]:
        return rotate(x, y, rot, cx, cy) if rot else (x, y)

    p = Path()
    p.M(*xf(cx - rx + lr, cy - ry))
    p.L(*xf(cx + rx - rr, cy - ry))
    p.C(*xf(cx + rx - rr + K * rr, cy - ry), *xf(cx + rx, cy - ry + K * rr), *xf(cx + rx, cy - ry + rr))
    p.L(*xf(cx + rx, cy + ry - rr))
    p.C(*xf(cx + rx, cy + ry - rr + K * rr), *xf(cx + rx - rr + K * rr, cy + ry), *xf(cx + rx - rr, cy + ry))
    p.L(*xf(cx - rx + lr, cy + ry))
    p.C(*xf(cx - rx + lr - K * lr, cy + ry), *xf(cx - rx, cy + ry - lr + K * lr), *xf(cx - rx, cy + ry - lr))
    p.L(*xf(cx - rx, cy - ry + lr))
    p.C(*xf(cx - rx, cy - ry + lr - K * lr), *xf(cx - rx + lr - K * lr, cy - ry), *xf(cx - rx + lr, cy - ry))
    p.Z()
    return p.d()


def sample_to_path(pts: list[tuple[float, float]], closed: bool = False) -> str:
    if len(pts) < 2:
        return ""
    p = Path().M(*pts[0])
    # Catmull-Rom to cubics
    seq = pts[:]
    if closed:
        seq = [pts[-1]] + pts + [pts[0], pts[1]]
    else:
        seq = [pts[0]] + pts + [pts[-1]]
    limit = len(pts) if closed else len(pts) - 1
    for i in range(limit):
        p0 = seq[i]
        p1 = seq[i + 1]
        p2 = seq[i + 2]
        p3 = seq[i + 3] if closed else seq[min(i + 3, len(seq) - 1)]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        p.C(*c1, *c2, *p2)
    if closed:
        p.Z()
    return p.d()


def lemniscate(a: float, tilt: float, n: int = 80) -> str:
    del n
    # Four cubics. A constructed figure eight, then turned.
    h = a * 0.67
    raw = [
        (CX - a, CY),
        (CX - a, CY - h),
        (CX - a * 0.33, CY - h),
        (CX, CY),
        (CX + a * 0.33, CY + h),
        (CX + a, CY + h),
        (CX + a, CY),
        (CX + a, CY - h),
        (CX + a * 0.33, CY - h),
        (CX, CY),
        (CX - a * 0.33, CY + h),
        (CX - a, CY + h),
        (CX - a, CY),
    ]
    pts = [rotate(x, y, tilt) for x, y in raw]
    p = Path().M(*pts[0])
    p.C(*pts[1], *pts[2], *pts[3])
    p.C(*pts[4], *pts[5], *pts[6])
    p.C(*pts[7], *pts[8], *pts[9])
    p.C(*pts[10], *pts[11], *pts[12])
    return p.d()


def spiral(turns: float, r0: float, r1: float, n: int = 96) -> str:
    pts = []
    total = turns * 2 * math.pi
    start = 0.35 * math.pi
    for i in range(n):
        t = i / (n - 1)
        ang = start + total * t
        r = r0 + (r1 - r0) * t
        pts.append((CX + r * math.cos(ang), CY + r * math.sin(ang)))
    return sample_to_path(pts, closed=False)


@dataclass(frozen=True)
class Mark:
    slug: str
    label: str
    kind: str  # category | direction
    form: str
    why: str
    paths: tuple[str, ...]
    nodes: tuple[tuple[float, float, float], ...] = ()


def bowl_out(deg: float, ring: float, r: float, sweep: float = 132) -> str:
    """D-bowl on a ring, opening outward."""
    ocx, ocy = polar(CX, CY, ring, deg)
    return Path().move_arc(ocx, ocy, r, deg - sweep / 2, deg + sweep / 2).d()


def bowl_in(deg: float, ring: float, r: float, sweep: float = 116) -> str:
    """D-bowl on a ring, opening toward the center."""
    ocx, ocy = polar(CX, CY, ring, deg)
    a = deg + 180
    return Path().move_arc(ocx, ocy, r, a - sweep / 2, a + sweep / 2).d()


def marks() -> tuple[Mark, ...]:
    # Soft oval: D-radius on both ends, a hint of stem so it is not a circle
    # and not the letter D. Inner loop sits slightly high, like a held breath.
    exec_outer = d_oval(CX, CY, 76, 54, left_r=38, right_r=54)
    exec_inner = d_oval(CX + 3, CY - 3, 40, 26, left_r=16, right_r=26)

    # Facing C bowls. Tips do not meet. Node is the life between them.
    parent_left = Path().move_arc(68, CY, 52, 58, 302).d()
    parent_right = Path().move_arc(172, CY, 52, 238, 482).d()

    # Growth rings that turn. Time, not a target.
    health_paths = (
        d_oval(CX, CY, 80, 58, left_r=44, right_r=58, rot=0),
        d_oval(CX, CY, 56, 40, left_r=30, right_r=40, rot=22),
        d_oval(CX, CY, 32, 22, left_r=16, right_r=22, rot=44),
    )

    globe = d_oval(CX, CY + 4, 74, 52, left_r=40, right_r=52)
    orbit = Path().M(46, 156).C(58, 70, 168, 48, 196, 108).d()

    metabolic = d_oval(CX, CY, 60, 44, left_r=32, right_r=44)

    # Interlocking loops. One turned so the overlap reads as a weave.
    repair_a = d_oval(100, CY, 44, 36, left_r=28, right_r=36, rot=-18)
    repair_b = d_oval(140, CY, 44, 36, left_r=28, right_r=36, rot=18)

    def petal(deg: float) -> str:
        pcx, pcy = polar(CX, CY, 38, deg)
        return d_oval(pcx, pcy, 30, 20, left_r=16, right_r=20, rot=deg + 90)

    sleep_paths = (
        Path().move_arc(CX, 168, 78, 200, 340).d(),
        Path().move_arc(CX, 160, 56, 205, 335).d(),
        Path().move_arc(CX, 154, 34, 212, 328).d(),
    )

    return (
        Mark(
            "executive",
            "Executives",
            "category",
            "Held",
            "Composure under load. Two nested loops. No loose ends.",
            (exec_outer, exec_inner),
        ),
        Mark(
            "athlete",
            "Athletes",
            "category",
            "Rebound",
            "Work and recovery as one stroke. A D-arc figure eight, tilted.",
            (lemniscate(72, 22),),
        ),
        Mark(
            "transformation",
            "Transformation",
            "category",
            "Turn",
            "Reset. The D-curve opening from a center, two turns.",
            (spiral(1.85, 12, 80),),
        ),
        Mark(
            "parents",
            "Parents",
            "category",
            "Hold",
            "Held warmth. Two facing D-bowls around a life.",
            (parent_left, parent_right),
            ((CX, CY, 5.5),),
        ),
        Mark(
            "creative",
            "Creators",
            "category",
            "Branch",
            "Night focus. Three D-petals around a center. Thought branching.",
            (petal(-90), petal(30), petal(150)),
            ((CX, CY, 5.5),),
        ),
        Mark(
            "legacy",
            "Healthspan",
            "category",
            "Rings",
            "Long air. Three closed rings. Time, not a letter.",
            health_paths,
        ),
        Mark(
            "traveler",
            "Jetlag Recovery",
            "category",
            "Orbit",
            "Horizon. A globe, a path across it, you on the path.",
            (globe, orbit),
            ((186, 96, 5.5),),
        ),
        Mark(
            "metabolic",
            "Metabolic",
            "direction",
            "Cycle",
            "Fuel going around. One loop. The atom of the system.",
            (metabolic,),
            ((CX, CY, 5.5),),
        ),
        Mark(
            "repair",
            "Repair",
            "direction",
            "Weave",
            "Tissue knitting. Two interlocking loops.",
            (repair_a, repair_b),
        ),
        Mark(
            "mental",
            "Mental",
            "direction",
            "Gather",
            "Focus. Three D-bowls collecting to a center.",
            (bowl_in(-90, 48, 32), bowl_in(30, 48, 32), bowl_in(150, 48, 32)),
            ((CX, CY, 5.5),),
        ),
        Mark(
            "sleep",
            "Sleep",
            "direction",
            "Depth",
            "Rhythm settling. Nested night arcs. The D-bowl laid down.",
            sleep_paths,
        ),
    )


def svg_for(mark: Mark, paper: bool = True) -> str:
    fills = []
    if paper:
        fills.append(f'<rect width="{int(VIEW)}" height="{int(VIEW)}" fill="#FBF9F6"/>')
    paths = "\n".join(
        f'<path d="{d}" fill="none" stroke="#1A1A1A" stroke-width="{STROKE}" '
        f'stroke-linecap="round" stroke-linejoin="round"/>'
        for d in mark.paths
    )
    nodes = "\n".join(
        f'<circle cx="{_fmt(x)}" cy="{_fmt(y)}" r="{_fmt(r)}" fill="#1A1A1A"/>'
        for x, y, r in mark.nodes
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{int(VIEW)}" height="{int(VIEW)}" '
        f'viewBox="0 0 {int(VIEW)} {int(VIEW)}" role="img" aria-label="{mark.label}">\n'
        f"{chr(10).join(fills)}\n{paths}\n{nodes}\n</svg>\n"
    )


def parse_path_points(d: str) -> list[list[tuple[float, float]]]:
    """Flatten SVG path to polylines for raster preview."""
    tokens = d.replace(",", " ").split()
    polylines: list[list[tuple[float, float]]] = []
    current: list[tuple[float, float]] = []
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
        elif cmd[0] in "MLCZ" and len(cmd) > 1:
            # rare
            pass
        if cmd == "M":
            if current:
                polylines.append(current)
            cx, cy = num(), num()
            start = (cx, cy)
            current = [(cx, cy)]
        elif cmd == "L":
            cx, cy = num(), num()
            current.append((cx, cy))
        elif cmd == "C":
            x1, y1, x2, y2, x, y = num(), num(), num(), num(), num(), num()
            p0 = (cx, cy)
            p1 = (x1, y1)
            p2 = (x2, y2)
            p3 = (x, y)
            for s in range(1, 25):
                t = s / 24
                u = 1 - t
                px = u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0]
                py = u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1]
                current.append((px, py))
            cx, cy = x, y
        elif cmd == "Z":
            current.append(start)
            cx, cy = start
        else:
            # implicit command after numbers: treat as error skip
            try:
                float(cmd)
            except ValueError:
                i += 1
    if current:
        polylines.append(current)
    return polylines


def raster(mark: Mark, size: int = SIZE) -> Image.Image:
    img = Image.new("RGBA", (size, size), PAPER)
    draw = ImageDraw.Draw(img)
    scale = size / VIEW
    width = max(2, int(STROKE * scale))
    for d in mark.paths:
        for poly in parse_path_points(d):
            if len(poly) < 2:
                continue
            pts = [(x * scale, y * scale) for x, y in poly]
            draw.line(pts, fill=INK, width=width, joint="curve")
            r = width / 2
            for x, y in (pts[0], pts[-1]):
                draw.ellipse((x - r, y - r, x + r, y + r), fill=INK)
    for x, y, rad in mark.nodes:
        rr = rad * scale
        draw.ellipse(
            (x * scale - rr, y * scale - rr, x * scale + rr, y * scale + rr),
            fill=INK,
        )
    return img


def sheet_image(items: tuple[Mark, ...]) -> Image.Image:
    cols = 4
    rows = math.ceil(len(items) / cols)
    cell = 360
    pad = 48
    w = pad * 2 + cols * cell
    h = pad * 2 + rows * cell + 80
    img = Image.new("RGBA", (w, h), PAPER)
    for i, mark in enumerate(items):
        r, c = divmod(i, cols)
        tile = raster(mark, 280)
        x = pad + c * cell + 40
        y = pad + 40 + r * cell
        img.paste(tile, (x, y), tile)
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    items = marks()
    for mark in items:
        (OUT / f"{mark.kind}-{mark.slug}.svg").write_text(svg_for(mark), encoding="utf-8")
        raster(mark).save(OUT / f"{mark.kind}-{mark.slug}.png")
        # white-on-clear for night plates
        white = raster(mark)
        datas = []
        for px in white.getdata():
            if px[0] > 240 and px[1] > 240 and px[2] > 240:
                datas.append((0, 0, 0, 0))
            else:
                datas.append((255, 255, 255, 255))
        wimg = Image.new("RGBA", white.size)
        wimg.putdata(datas)
        white_dir = OUT / "white"
        white_dir.mkdir(exist_ok=True)
        wimg.save(white_dir / f"{mark.kind}-{mark.slug}.png")
    sheet_image(items).save(SHEET)
    print(f"wrote {len(items)} marks to {OUT}")
    print(f"sheet {SHEET}")


if __name__ == "__main__":
    main()
