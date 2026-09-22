#!/usr/bin/env python3
"""Parametric peptide and category marks.

One engine. n-fold rotational symmetry. Polar construction.
Radii follow a parabola. Density is the only scale difference:
peptide is open, category is a denser seal. No molecule names.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "brand" / "peptide" / "marks"

PAPER = (251, 249, 246, 255)
INK = (26, 26, 26, 255)
WHITE = (255, 255, 255, 255)
CLEAR = (0, 0, 0, 0)
SIZE = 1024
SS = 4
MAX_R = 0.72
FIELDS = ROOT / "public" / "brand" / "peptide" / "fields"
PLATES = ROOT / "public" / "brand" / "peptide" / "plates"
WHITE_OUT = OUT / "white"


def parabolic_radii(count: int, inner: float, outer: float, power: float = 2.0) -> list[float]:
    if count == 1:
        return [outer]
    return [
        inner + (outer - inner) * ((i / (count - 1)) ** power)
        for i in range(count)
    ]


def polar(r: float, theta: float) -> tuple[float, float]:
    return r * math.cos(theta), r * math.sin(theta)


@dataclass(frozen=True)
class Recipe:
    slug: str
    label: str
    scale: str
    fold: int
    kind: str
    rings: int
    inner: float = 0.10
    outer: float = MAX_R
    power: float = 1.65
    amp: float = 0.0
    skip: int = 0
    rotate: bool = False
    spokes: bool = False


RECIPES: tuple[Recipe, ...] = (
    Recipe("metabolic", "Metabolic", "peptide", 4, "rose", 3, inner=0.28, amp=0.42, power=1.6),
    Recipe("repair", "Repair", "peptide", 6, "hex", 3, inner=0.12, power=1.4),
    Recipe("mental", "Mental", "peptide", 8, "string", 3, inner=0.28, skip=11, power=1.6),
    Recipe("sleep", "Sleep", "peptide", 12, "ripple", 7, inner=0.10, power=2.2),
    Recipe("executive", "Executives", "category", 8, "ngon", 6, inner=0.10, power=1.5),
    Recipe("athlete", "Athletes", "category", 6, "hex", 5, inner=0.08, power=1.35),
    Recipe("transformation", "Transformation", "category", 4, "ngon", 8, inner=0.08, rotate=True, power=1.4),
    Recipe("parents", "Parents", "category", 5, "hex", 4, inner=0.10, power=1.45),
    Recipe("creative", "Creators", "category", 12, "string", 4, inner=0.18, skip=17, power=1.55),
    Recipe("legacy", "Healthspan", "category", 9, "ngon", 6, inner=0.09, rotate=True, power=1.6),
    Recipe("traveler", "Jetlag Recovery", "category", 10, "ngon", 5, inner=0.12, spokes=True, power=1.65),
)


class Mark:
    def __init__(self, recipe: Recipe) -> None:
        self.recipe = recipe
        self.dots: list[tuple[float, float, float]] = []
        self.polys: list[tuple[list[tuple[float, float]], float]] = []
        self.circles: list[tuple[float, float]] = []
        self.lines: list[tuple[float, float, float, float, float]] = []
        self._build()

    def _stroke(self) -> float:
        return 0.016 if self.recipe.scale == "peptide" else 0.009

    def _dot(self) -> float:
        return 0.028 if self.recipe.scale == "peptide" else 0.016

    def _add_dot(self, x: float, y: float, r: float | None = None) -> None:
        self.dots.append((x, y, r if r is not None else self._dot()))

    def _ring_dots(self, radius: float, count: int, phase: float = 0.0, size: float | None = None) -> None:
        for i in range(count):
            x, y = polar(radius, phase + 2 * math.pi * i / count)
            self._add_dot(x, y, size)

    def _ngon(self, radius: float, fold: int, phase: float, stroke: float) -> None:
        pts = [polar(radius, phase + 2 * math.pi * i / fold) for i in range(fold)]
        self.polys.append((pts, stroke))

    def _harmonic(self, radius: float, fold: int, amp: float, stroke: float, samples: int = 720) -> None:
        pts = []
        for i in range(samples):
            t = 2 * math.pi * i / samples
            r = radius * (1 + amp * math.cos(fold * t))
            pts.append(polar(max(r, 0.01), t - math.pi / 2))
        self.polys.append((pts, stroke))

    def _rose(self, radius: float, k: int, stroke: float, samples: int = 900) -> None:
        pts = []
        for i in range(samples):
            t = 2 * math.pi * i / samples
            r = radius * abs(math.cos(k * t))
            pts.append(polar(max(r, 0.002), t - math.pi / (2 * k)))
        self.polys.append((pts, stroke))

    def _string(self, radius: float, points: int, skip: int, stroke: float) -> None:
        verts = [polar(radius, 2 * math.pi * i / points - math.pi / 2) for i in range(points)]
        for i, (x1, y1) in enumerate(verts):
            x2, y2 = verts[(i + skip) % points]
            self.lines.append((x1, y1, x2, y2, stroke))

    def _hex_lattice(self, rings: int, pitch: float, size: float) -> None:
        for q in range(-rings, rings + 1):
            for r in range(-rings, rings + 1):
                if abs(q + r) > rings:
                    continue
                x = pitch * (1.5 * q)
                y = pitch * (math.sqrt(3) * (r + q / 2))
                self._add_dot(x, y, size)

    def _build(self) -> None:
        r = self.recipe
        radii = parabolic_radii(r.rings, r.inner, r.outer, r.power)
        stroke = self._stroke()
        phase0 = -math.pi / 2

        if r.kind == "hex":
            if r.fold == 6:
                pitch = r.outer / (r.rings * math.sqrt(3))
                self._hex_lattice(r.rings, pitch, self._dot())
                self._ngon(r.outer, 6, phase0, stroke * (1.15 if r.scale == "peptide" else 0.9))
            else:
                self._add_dot(0, 0, self._dot())
                apo = math.cos(math.pi / r.fold)
                for i, rad in enumerate(radii, start=1):
                    self._ring_dots(rad * apo, r.fold * i, phase0, self._dot() * (1.02 - 0.03 * i))
                self._ngon(r.outer, r.fold, phase0, stroke)
                self._ring_dots(r.outer, r.fold, phase0, self._dot())

        elif r.kind == "ngon":
            self._add_dot(0, 0, self._dot() * 0.9)
            for i, rad in enumerate(radii):
                rot = (math.pi / r.fold) * i if r.rotate else 0.0
                self._ngon(rad, r.fold, phase0 + rot, stroke)
                self._ring_dots(rad, r.fold, phase0 + rot, self._dot() * 0.85)
            if r.spokes:
                for i in range(r.fold):
                    t = phase0 + 2 * math.pi * i / r.fold
                    x1, y1 = polar(r.outer * 0.82, t)
                    x2, y2 = polar(r.outer * 1.0, t)
                    self.lines.append((x1, y1, x2, y2, stroke * 1.1))

        elif r.kind == "rose":
            k = r.fold // 2
            for i, rad in enumerate(radii):
                self._rose(rad, k, stroke * (1.1 if i == len(radii) - 1 else 0.8))
            self._harmonic(r.outer * 0.92, r.fold, r.amp * 0.35, stroke * 0.7)
            self._ring_dots(r.outer * 0.55, r.fold, phase0, self._dot())
            self._add_dot(0, 0, self._dot() * 0.8)

        elif r.kind == "string":
            points = r.fold * 3
            skip = r.skip or (points // 3)
            self._string(r.outer, points, skip, stroke * 0.42)
            self._ngon(r.outer, r.fold, phase0, stroke)
            for rad in radii:
                self._ring_dots(rad, r.fold, phase0, self._dot() * 0.85)
            self._add_dot(0, 0, self._dot())

        elif r.kind == "ripple":
            for rad in radii:
                self.circles.append((rad, stroke * 0.85))
            for i, rad in enumerate(radii):
                if i % 2 == 0 and i > 0:
                    self._ring_dots(rad, r.fold, phase0, self._dot() * 0.5)
            self._add_dot(0, 0, self._dot() * 0.7)

    def svg(self) -> str:
        w = 1000
        c = w / 2
        s = c * 0.92

        def xform(x: float, y: float) -> tuple[float, float]:
            return c + x * s, c + y * s

        parts = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{w}" viewBox="0 0 {w} {w}" role="img" aria-label="{self.recipe.label}">',
            f'<rect width="{w}" height="{w}" fill="#FBF9F6"/>',
            '<g fill="none" stroke="#1A1A1A" stroke-linecap="round" stroke-linejoin="round">',
        ]
        for pts, stroke in self.polys:
            mapped = " ".join(f"{xform(x, y)[0]:.2f},{xform(x, y)[1]:.2f}" for x, y in pts)
            sw = stroke * s
            parts.append(f'<polygon points="{mapped}" stroke-width="{sw:.2f}"/>')
        for x1, y1, x2, y2, stroke in self.lines:
            a = xform(x1, y1)
            b = xform(x2, y2)
            sw = stroke * s
            parts.append(f'<line x1="{a[0]:.2f}" y1="{a[1]:.2f}" x2="{b[0]:.2f}" y2="{b[1]:.2f}" stroke-width="{sw:.2f}"/>')
        for rad, stroke in self.circles:
            sw = stroke * s
            parts.append(f'<circle cx="{c:.2f}" cy="{c:.2f}" r="{rad * s:.2f}" stroke-width="{sw:.2f}"/>')
        parts.append("</g>")
        parts.append('<g fill="#1A1A1A">')
        for x, y, r in self.dots:
            cx, cy = xform(x, y)
            parts.append(f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r * s:.2f}"/>')
        parts.append("</g></svg>\n")
        return "\n".join(parts)

    def png(self, *, paper: tuple[int, int, int, int] = PAPER, ink: tuple[int, int, int, int] = INK) -> Image.Image:
        dim = SIZE * SS
        img = Image.new("RGBA", (dim, dim), paper)
        draw = ImageDraw.Draw(img)
        c = dim / 2
        s = c * 0.92

        def xy(x: float, y: float) -> tuple[float, float]:
            return c + x * s, c + y * s

        for pts, stroke in self.polys:
            mapped = [xy(x, y) for x, y in pts]
            sw = max(stroke * s, SS * 0.6)
            draw.line(mapped + [mapped[0]], fill=ink, width=int(round(sw)), joint="curve")
        for x1, y1, x2, y2, stroke in self.lines:
            sw = max(stroke * s, SS * 0.45)
            draw.line([xy(x1, y1), xy(x2, y2)], fill=ink, width=int(round(sw)))
        for rad, stroke in self.circles:
            sw = max(stroke * s, SS * 0.6)
            rr = rad * s
            box = (c - rr, c - rr, c + rr, c + rr)
            draw.ellipse(box, outline=ink, width=int(round(sw)))
        for x, y, r in self.dots:
            cx, cy = xy(x, y)
            rr = max(r * s, SS * 0.8)
            draw.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=ink)

        return img.resize((SIZE, SIZE), Image.Resampling.LANCZOS)


def contact_sheet(images: list[tuple[str, Image.Image]], cols: int) -> Image.Image:
    cell = 360
    pad = 24
    rows = math.ceil(len(images) / cols)
    sheet = Image.new("RGBA", (cols * cell + (cols + 1) * pad, rows * cell + (rows + 1) * pad), PAPER)
    for i, (_, im) in enumerate(images):
        x = pad + (i % cols) * (cell + pad)
        y = pad + (i // cols) * (cell + pad)
        sheet.paste(im.resize((cell, cell), Image.Resampling.LANCZOS), (x, y))
    return sheet


FIELD_FILE = {
    "executive": "glow-executive.png",
    "athlete": "glow-athlete.png",
    "transformation": "glow-transformation.png",
    "parents": "glow-parents.png",
    "creative": "glow-creators.png",
    "legacy": "glow-healthspan.png",
    "traveler": "glow-travelers.png",
}

COMPOSE = (
    ("peptide", "metabolic", "executive"),
    ("peptide", "repair", "athlete"),
    ("peptide", "mental", "creative"),
    ("peptide", "sleep", "legacy"),
    ("category", "executive", "executive"),
    ("category", "athlete", "athlete"),
    ("category", "transformation", "transformation"),
    ("category", "parents", "parents"),
    ("category", "creative", "creative"),
    ("category", "legacy", "legacy"),
    ("category", "traveler", "traveler"),
)


def compose_plate(field: Image.Image, mark: Image.Image) -> Image.Image:
    plate = field.convert("RGBA")
    w, h = plate.size
    mark_w = int(w * 0.5)
    mark = mark.resize((mark_w, mark_w), Image.Resampling.LANCZOS)
    x = (w - mark_w) // 2
    y = int(h * 0.14)
    plate.alpha_composite(mark, (x, y))
    return plate


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    WHITE_OUT.mkdir(parents=True, exist_ok=True)
    PLATES.mkdir(parents=True, exist_ok=True)
    rendered: list[tuple[str, Image.Image]] = []
    whites: dict[tuple[str, str], Image.Image] = {}
    for recipe in RECIPES:
        mark = Mark(recipe)
        png = mark.png()
        white = mark.png(paper=CLEAR, ink=WHITE)
        prefix = "peptide" if recipe.scale == "peptide" else "category"
        png_path = OUT / f"{prefix}-{recipe.slug}.png"
        svg_path = OUT / f"{prefix}-{recipe.slug}.svg"
        white_path = WHITE_OUT / f"{prefix}-{recipe.slug}.png"
        png.save(png_path, "PNG")
        white.save(white_path, "PNG")
        svg_path.write_text(mark.svg())
        rendered.append((recipe.slug, png))
        whites[(recipe.scale, recipe.slug)] = white
        print(png_path)

    peptides = [item for item, rec in zip(rendered, RECIPES) if rec.scale == "peptide"]
    categories = [item for item, rec in zip(rendered, RECIPES) if rec.scale == "category"]
    contact_sheet(peptides, 4).save(OUT / "_sheet-peptides.png")
    contact_sheet(categories, 4).save(OUT / "_sheet-categories.png")
    contact_sheet(rendered, 4).save(OUT / "_sheet-all.png")

    for scale, slug, field_id in COMPOSE:
        field = Image.open(FIELDS / FIELD_FILE[field_id])
        plate = compose_plate(field, whites[(scale, slug)])
        path = PLATES / f"{scale}-{slug}.png"
        plate.convert("RGB").save(path, "PNG", quality=95)
        print(path)


if __name__ == "__main__":
    main()
