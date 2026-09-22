#!/usr/bin/env python3
"""Render category oral forms from the attached grain fields.

Each category gets the pharmaceutical shape that matches its oral path.
The field is the tablet face. TIDL is debossed. No molecule names.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
FIELDS = Path(__file__).resolve().parent / "assets" / "pill-gradients"
SOURCE = Path(__file__).resolve().parent / "assets" / "pills-source"
OUT = ROOT / "public" / "brand" / "pills"

SIZE = 1024
THUMB = 339
FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

# Square window on the 2:1 field. Crop to the bloom, not empty edge.
FIELD_CROP = {
    "athletes": (0.08, 0.00, 0.58, 1.00),
    "longevity": (0.22, 0.00, 0.72, 1.00),
    "creators": (0.18, 0.00, 0.68, 1.00),
    "parents": (0.28, 0.00, 0.78, 1.00),
    "recovery": (0.20, 0.00, 0.70, 1.00),
    "sexual-health": (0.00, 0.00, 0.50, 1.00),
    "executive": (0.42, 0.00, 0.92, 1.00),
    "testosterone": (0.10, 0.00, 0.60, 1.00),
    "travelers": (0.30, 0.00, 0.80, 1.00),
    "skin-hair": (0.35, 0.00, 0.85, 1.00),
    "transformation": (0.16, 0.00, 0.66, 1.00),
    "weight-loss": (0.24, 0.00, 0.74, 1.00),
    "womens-health": (0.12, 0.00, 0.62, 1.00),
}

# Form follows the oral that addresses the category's symptoms.
PILLS: list[dict[str, Any]] = [
    {
        "id": "athletes",
        "field": "athletes",
        "shape": "elongated hard capsule. Performance and recovery orals.",
        "kind": "capsule",
        "rx": 0.40,
        "ry": 0.118,
        "finish": "capsule",
        "score": None,
        "imprint": 0.62,
    },
    {
        "id": "longevity",
        "field": "longevity",
        "shape": "Plump oval softgel. Cellular and healthspan orals.",
        "kind": "softgel",
        "rx": 0.30,
        "ry": 0.198,
        "finish": "softgel",
        "score": None,
        "imprint": 0.50,
    },
    {
        "id": "creators",
        "field": "creators",
        "shape": "Small round biconvex tablet. Daily focus oral.",
        "kind": "circle",
        "r": 0.198,
        "finish": "tablet",
        "score": "v",
        "imprint": 0.48,
    },
    {
        "id": "parents",
        "field": "parents",
        "shape": "Medium oval softgel. Sleep and calm in a portable oral.",
        "kind": "softgel",
        "rx": 0.328,
        "ry": 0.168,
        "finish": "softgel",
        "score": None,
        "imprint": 0.48,
    },
    {
        "id": "recovery",
        "field": "recovery",
        "shape": "Large oblong scored caplet. Tissue and inflammation oral.",
        "kind": "oblong",
        "rx": 0.368,
        "ry": 0.132,
        "finish": "tablet",
        "score": "v",
        "imprint": 0.46,
    },
    {
        "id": "sexual-health",
        "field": "sexual-health",
        "shape": "Rounded diamond tablet. The distinctive ED oral.",
        "kind": "diamond",
        "r": 0.228,
        "k": 0.34,
        "finish": "tablet",
        "score": None,
        "imprint": 0.52,
    },
    {
        "id": "executive",
        "field": "executive",
        "shape": "Medium oval daily tablet. Desk protocol oral.",
        "kind": "ellipse",
        "rx": 0.268,
        "ry": 0.168,
        "finish": "tablet",
        "score": None,
        "imprint": 0.50,
    },
    {
        "id": "testosterone",
        "field": "testosterone",
        "shape": "Round scored tablet. Hormone adjunct oral.",
        "kind": "circle",
        "r": 0.228,
        "finish": "tablet",
        "score": "v",
        "imprint": 0.50,
    },
    {
        "id": "travelers",
        "field": "travelers",
        "shape": "Compact capsule. Portable sleep and jet lag oral.",
        "kind": "capsule",
        "rx": 0.318,
        "ry": 0.102,
        "finish": "capsule",
        "score": None,
        "imprint": 0.56,
    },
    {
        "id": "skin-hair",
        "field": "skin-hair",
        "shape": "Round tablet. Hair oral form.",
        "kind": "circle",
        "r": 0.228,
        "finish": "tablet",
        "score": None,
        "imprint": 0.48,
    },
    {
        "id": "transformation",
        "field": "transformation",
        "shape": "Almond tablet. Metabolic oral with a pointed oval.",
        "kind": "almond",
        "rx": 0.348,
        "ry": 0.148,
        "finish": "tablet",
        "score": None,
        "imprint": 0.48,
    },
    {
        "id": "weight-loss",
        "field": "weight-loss",
        "shape": "Convex oval tablet. Oral metabolic form.",
        "kind": "ellipse",
        "rx": 0.312,
        "ry": 0.178,
        "finish": "tablet",
        "score": None,
        "imprint": 0.50,
    },
    {
        "id": "womens-health",
        "field": "womens-health",
        "shape": "Small oval caplet. Hormone balance oral.",
        "kind": "oblong",
        "rx": 0.248,
        "ry": 0.108,
        "finish": "tablet",
        "score": None,
        "imprint": 0.58,
    },
]


def load_field(name: str) -> np.ndarray:
    return np.array(Image.open(FIELDS / f"{name}.png").convert("RGB"), dtype=np.float32)


def square_crop(field: np.ndarray, crop: tuple[float, float, float, float], size: int) -> np.ndarray:
    h, w = field.shape[:2]
    x0, y0, x1, y1 = crop
    box = field[int(y0 * h) : max(int(y1 * h), 1), int(x0 * w) : max(int(x1 * w), 1)]
    bh, bw = box.shape[:2]
    side = min(bh, bw)
    top = (bh - side) // 2
    left = (bw - side) // 2
    box = box[top : top + side, left : left + side]
    return np.array(
        Image.fromarray(box.astype(np.uint8)).resize((size, size), Image.Resampling.LANCZOS),
        dtype=np.float32,
    )


def coords(n: int) -> tuple[np.ndarray, np.ndarray]:
    yy, xx = np.mgrid[0:n, 0:n]
    x = (xx - (n - 1) / 2) / n
    y = (yy - (n - 1) / 2) / n
    return x, y


def sdf_circle(x: np.ndarray, y: np.ndarray, r: float) -> np.ndarray:
    return np.sqrt(x * x + y * y) - r


def sdf_ellipse(x: np.ndarray, y: np.ndarray, rx: float, ry: float) -> np.ndarray:
    return (np.sqrt((x / rx) ** 2 + (y / ry) ** 2) - 1.0) * min(rx, ry)


def sdf_capsule(x: np.ndarray, y: np.ndarray, rx: float, ry: float) -> np.ndarray:
    ax = np.clip(x, -(rx - ry), (rx - ry))
    return np.sqrt((x - ax) ** 2 + y * y) - ry


def sdf_diamond(x: np.ndarray, y: np.ndarray, r: float, k: float) -> np.ndarray:
    # Square rotated 45 degrees. k is corner radius as a fraction of r.
    # Same fillet on all four corners so it reads as a diamond tablet, not a kite.
    corner = r * k
    half = r - corner
    xr = (x + y) / np.sqrt(2)
    yr = (y - x) / np.sqrt(2)
    ax = np.abs(xr) - half
    ay = np.abs(yr) - half
    return (
        np.sqrt(np.maximum(ax, 0) ** 2 + np.maximum(ay, 0) ** 2)
        + np.minimum(np.maximum(ax, ay), 0)
        - corner
    )


def sdf_ngon(
    x: np.ndarray,
    y: np.ndarray,
    r: float,
    sides: int,
    rot: float = -np.pi / 2,
) -> np.ndarray:
    # Vertex on the vertical axis so a scored tablet is left-right symmetric.
    ang = np.arctan2(y, x) - rot
    step = np.pi * 2 / sides
    r_poly = np.cos(np.pi / sides) / np.cos(ang - step * np.floor((ang + np.pi / sides) / step))
    return np.sqrt(x * x + y * y) - r * r_poly


def sdf_almond(x: np.ndarray, y: np.ndarray, rx: float, ry: float) -> np.ndarray:
    # Pointed oval: ellipse pulled slightly at the ends.
    t = np.clip(np.abs(x) / max(rx, 1e-6), 0, 1)
    local_ry = ry * (1.0 - 0.22 * t * t)
    return (np.sqrt((x / rx) ** 2 + (y / np.maximum(local_ry, 1e-4)) ** 2) - 1.0) * min(rx, ry)


def shape_sdf(x: np.ndarray, y: np.ndarray, spec: dict[str, Any]) -> np.ndarray:
    kind = spec["kind"]
    if kind == "circle":
        return sdf_circle(x, y, spec["r"])
    if kind == "ellipse":
        return sdf_ellipse(x, y, spec["rx"], spec["ry"])
    if kind in {"capsule", "oblong"}:
        return sdf_capsule(x, y, spec["rx"], spec["ry"])
    if kind == "softgel":
        return sdf_ellipse(x, y, spec["rx"], spec["ry"])
    if kind == "diamond":
        return sdf_diamond(x, y, spec["r"], spec.get("k", 0.28))
    if kind == "heptagon":
        # Vertex up, corners filleted so it reads as a pressed tablet, not a polygon.
        fillet = spec.get("fillet", 0.048)
        rot = -np.pi / 2 - np.pi / 7
        return sdf_ngon(x, y, spec["r"] + fillet, 7, rot=rot) + fillet
    if kind == "almond":
        return sdf_almond(x, y, spec["rx"], spec["ry"])
    raise ValueError(kind)


def sdf_to_alpha(sdf: np.ndarray, feather: float = 0.0024) -> np.ndarray:
    return np.clip(0.5 - sdf / max(feather, 1e-6), 0, 1).astype(np.float32)


def face_box(spec: dict[str, Any]) -> tuple[float, float]:
    """Max word width and letter height, in the same units as r / rx / ry."""
    kind = spec["kind"]
    if kind == "circle":
        return spec["r"] * 2 * 0.50, spec["r"] * 2 * 0.20
    if kind == "diamond":
        span = spec["r"] * 2 * np.sqrt(2)
        return span * 0.42, span * 0.16
    if kind == "heptagon":
        inner = spec["r"] * 2 * np.cos(np.pi / 7)
        return inner * 0.50, inner * 0.20
    if kind == "capsule":
        return spec["rx"] * 0.36, spec["ry"] * 2 * 0.38
    if kind == "oblong":
        return spec["rx"] * 2 * 0.38, spec["ry"] * 2 * 0.36
    if kind == "softgel":
        return spec["rx"] * 2 * 0.40, spec["ry"] * 2 * 0.22
    if kind == "almond":
        return spec["rx"] * 2 * 0.38, spec["ry"] * 2 * 0.32
    return spec["rx"] * 2 * 0.42, spec["ry"] * 2 * 0.24


def measure_word(size: int) -> tuple[int, int, ImageFont.FreeTypeFont, list]:
    font = ImageFont.truetype(FONT, size)
    probe = ImageDraw.Draw(Image.new("L", (8, 8), 0))
    letters = list("TIDL")
    gap = max(int(size * 0.06), 2)
    boxes = [probe.textbbox((0, 0), letter, font=font) for letter in letters]
    widths = [box[2] - box[0] for box in boxes]
    total_w = sum(widths) + gap * (len(letters) - 1)
    total_h = max(box[3] - box[1] for box in boxes)
    return total_w, total_h, font, list(zip(letters, boxes, widths))


def stamp_well(mask: np.ndarray, wall_px: float) -> np.ndarray:
    core = mask > 0.45
    dist = ndimage.distance_transform_edt(core)
    well = np.clip(dist / max(wall_px, 1.2), 0, 1).astype(np.float32)
    return ndimage.gaussian_filter(well, sigma=0.55)


def draw_word(n: int, spec: dict[str, Any], cx: float | None = None) -> tuple[np.ndarray, float]:
    face_w, face_h = face_box(spec)
    max_w = face_w * n
    max_h = face_h * n
    size = max(int(max_h * 1.7), 16)
    total_w, total_h, font, glyphs = measure_word(size)
    while (total_w > max_w or total_h > max_h) and size > 12:
        size -= 1
        total_w, total_h, font, glyphs = measure_word(size)
    canvas = Image.new("L", (n, n), 0)
    draw = ImageDraw.Draw(canvas)
    origin = ((n - total_w) / 2) if cx is None else (cx - total_w / 2)
    x = origin
    for letter, box, width in glyphs:
        y = (n - (box[3] - box[1])) / 2 - box[1]
        draw.text((x - box[0], y), letter, font=font, fill=255)
        x += width + max(int(size * 0.06), 2)
    mask = np.array(canvas, dtype=np.float32) / 255.0
    grow = 1 if size >= 56 else 2
    mask = ndimage.binary_dilation(mask > 0.5, iterations=grow).astype(np.float32)
    return mask, float(size)


def imprint_mask(n: int, spec: dict[str, Any]) -> np.ndarray:
    if spec["finish"] == "capsule":
        left, size = draw_word(n, spec, cx=n * 0.32)
        right, _ = draw_word(n, spec, cx=n * 0.68)
        return np.clip(left + right, 0, 1)
    mask, size = draw_word(n, spec)
    if spec["finish"] in {"capsule", "softgel"}:
        return ndimage.gaussian_filter(mask, sigma=0.35)
    wall = float(np.clip(size * 0.05, 2.8, 5.4))
    return stamp_well(mask, wall)


def score_mask(x: np.ndarray, y: np.ndarray, sdf: np.ndarray, axis: str) -> np.ndarray:
    inside = sdf < -0.016
    if axis == "v":
        groove = np.exp(-0.5 * (x / 0.0092) ** 2)
    else:
        groove = np.exp(-0.5 * (y / 0.0092) ** 2)
    # Stop the groove short of the rim so it reads as a pressed bisect.
    return (groove * inside.astype(np.float32)).astype(np.float32)


def height_field(
    sdf: np.ndarray,
    spec: dict[str, Any],
    imprint: np.ndarray,
    score: np.ndarray,
    x: np.ndarray,
    y: np.ndarray,
) -> np.ndarray:
    finish = spec["finish"]
    span = {
        "capsule": spec.get("ry", 0.12),
        "oblong": spec.get("ry", 0.12),
        "softgel": min(spec.get("rx", 0.3), spec.get("ry", 0.18)),
        "circle": spec.get("r", 0.22),
        "ellipse": min(spec.get("rx", 0.3), spec.get("ry", 0.18)),
        "diamond": spec.get("r", 0.22),
        "heptagon": spec.get("r", 0.22),
        "almond": spec.get("ry", 0.15),
    }[spec["kind"]]
    # Polygon orals use a radial dome so the face stays a tablet, not a gem.
    if spec["kind"] in {"diamond", "heptagon"}:
        radial = np.sqrt(x * x + y * y)
        t = np.clip(1.0 - radial / max(span * 1.15, 1e-4), 0, 1)
    else:
        t = np.clip(-sdf / max(span, 1e-4), 0, 1)
    if finish == "capsule":
        dome = np.sqrt(np.clip(t, 0, 1))
        height = 1.05 * dome
    elif finish == "softgel":
        dome = np.power(np.clip(t, 0, 1), 0.48)
        height = 1.18 * dome
    else:
        dome = np.sqrt(np.clip(1.0 - (1.0 - t) ** 2, 0, 1))
        height = 1.02 * dome
    bevel_w = 0.028 if spec["kind"] == "diamond" else 0.020
    bevel = np.clip((-sdf) / bevel_w, 0, 1)
    height *= 0.28 + 0.72 * bevel
    if spec["finish"] == "tablet":
        height -= imprint * 0.30
    height -= score * 0.32
    return height.astype(np.float32)


def normals(height: np.ndarray) -> np.ndarray:
    gy, gx = np.gradient(height)
    n = np.stack((-gx * 1.25, -gy * 1.25, np.full_like(height, 0.038)), axis=-1)
    mag = np.linalg.norm(n, axis=-1, keepdims=True)
    return n / np.maximum(mag, 1e-6)


def saturate(rgb: np.ndarray, amount: float) -> np.ndarray:
    luma = (0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2])[..., None]
    return np.clip(luma + (rgb - luma) * amount, 0, 255)


def chromatic_mean(crop: np.ndarray) -> np.ndarray:
    chroma = crop.max(axis=-1) - crop.min(axis=-1)
    keep = chroma >= np.percentile(chroma, 62)
    if keep.sum() < 32:
        return crop.mean(axis=(0, 1))
    return crop[keep].mean(axis=0)


def sample_albedo(field: np.ndarray, x: np.ndarray, y: np.ndarray, spec: dict[str, Any]) -> np.ndarray:
    fh, fw = field.shape[:2]
    if spec["finish"] == "capsule":
        left = field[:, : max(fw // 2, 1)]
        right = field[:, fw // 2 :]
        v = np.clip((y + spec["ry"] * 1.4) / (spec["ry"] * 2.8), 0, 1)
        u_l = np.clip((x + spec["rx"]) / max(spec["rx"], 1e-4) * 0.85, 0, 1)
        u_r = np.clip(x / max(spec["rx"], 1e-4) * 0.85, 0, 1)
        ix_l = np.clip((u_l * (left.shape[1] - 1)).astype(np.int32), 0, left.shape[1] - 1)
        ix_r = np.clip((u_r * (right.shape[1] - 1)).astype(np.int32), 0, right.shape[1] - 1)
        iy = np.clip((v * (fh - 1)).astype(np.int32), 0, fh - 1)
        mapped = np.where((x < 0)[..., None], left[iy, ix_l], right[iy, ix_r])
        body = np.where((x < 0)[..., None], chromatic_mean(left), chromatic_mean(right))
        return saturate(mapped * 0.48 + body * 0.52, 1.18)
    crop = square_crop(field, FIELD_CROP[spec["field"]], 512)
    u = np.clip(x * 0.88 + 0.5, 0, 1)
    v = np.clip(y * 0.88 + 0.5, 0, 1)
    n = crop.shape[0]
    ix = np.clip((u * (n - 1)).astype(np.int32), 0, n - 1)
    iy = np.clip((v * (n - 1)).astype(np.int32), 0, n - 1)
    mapped = crop[iy, ix]
    body = chromatic_mean(crop)
    mix = 0.38 if spec["finish"] == "tablet" else 0.55
    sat = 1.06 if spec["finish"] == "tablet" else 1.22
    return saturate(mapped * mix + body * (1.0 - mix), sat)


def shade(albedo: np.ndarray, n: np.ndarray, spec: dict[str, Any], imprint: np.ndarray, score: np.ndarray) -> np.ndarray:
    key = np.array([0.28, 0.58, 0.76], dtype=np.float32)
    key /= np.linalg.norm(key)
    fill = np.array([-0.42, -0.12, 0.90], dtype=np.float32)
    fill /= np.linalg.norm(fill)
    rim_l = np.array([-0.15, 0.75, 0.64], dtype=np.float32)
    rim_l /= np.linalg.norm(rim_l)
    half = key + np.array([0, 0, 1], dtype=np.float32)
    half /= np.linalg.norm(half)

    ndotl = np.clip(np.sum(n * key, axis=-1), 0, 1)
    ndotf = np.clip(np.sum(n * fill, axis=-1), 0, 1)
    ndotr = np.clip(np.sum(n * rim_l, axis=-1), 0, 1)
    spec_term = np.clip(np.sum(n * half, axis=-1), 0, 1)

    finish = spec["finish"]
    if finish == "capsule":
        spec_pow, spec_gain, ambient = 48.0, 0.62, 0.34
    elif finish == "softgel":
        spec_pow, spec_gain, ambient = 28.0, 0.42, 0.38
    else:
        spec_pow, spec_gain, ambient = 22.0, 0.07, 0.48

    light = ambient + 0.62 * ndotl + 0.18 * ndotf + 0.08 * ndotr
    highlight = (spec_term ** spec_pow) * spec_gain
    rgb = albedo * light[..., None] + highlight[..., None] * 255.0

    if finish == "tablet":
        rgb = rgb * (1.0 - 0.07 * imprint[..., None])
        rgb = rgb * (1.0 - 0.16 * score[..., None])
        grain = np.random.default_rng(11).normal(0, 2.2, rgb.shape)
        rgb = rgb + grain
    else:
        luma = 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]
        light_ink = np.array([236, 226, 198], dtype=np.float32)
        dark_ink = np.array([32, 28, 26], dtype=np.float32)
        ink = np.where(luma[..., None] < 96, light_ink, dark_ink)
        t = np.clip(imprint, 0, 1)[..., None]
        rgb = rgb * (1.0 - t) + (rgb * 0.18 + ink * 0.82) * t

    if finish == "softgel":
        rim = np.clip(1.0 - np.abs(n[..., 2] - 0.62) * 2.6, 0, 1)
        rgb = rgb + rim[..., None] * 22.0

    return np.clip(rgb, 0, 255)


def render_studio(spec: dict[str, Any]) -> tuple[np.ndarray, np.ndarray]:
    field = load_field(spec["field"])
    n = SIZE
    x, y = coords(n)
    sdf = shape_sdf(x, y, spec)
    alpha = sdf_to_alpha(sdf)
    clip = -0.018 if spec["kind"] == "diamond" else -0.028
    imprint = imprint_mask(n, spec) * (sdf < clip).astype(np.float32)
    score_axis = spec.get("score")
    score = (
        score_mask(x, y, sdf, score_axis)
        if score_axis in {"v", "h"}
        else np.zeros((n, n), dtype=np.float32)
    )
    height = height_field(sdf, spec, imprint, score, x, y)
    nrm = normals(height)
    albedo = sample_albedo(field, x, y, spec)
    rgb = shade(albedo, nrm, spec, imprint, score)
    if spec["finish"] == "capsule":
        seam = np.exp(-0.5 * (x / 0.0036) ** 2) * (sdf < -0.01).astype(np.float32)
        rgb = rgb * (1.0 - 0.16 * seam[..., None])
        rgb = rgb + seam[..., None] * 14.0
    if score_axis in {"v", "h"}:
        wall = np.exp(-0.5 * ((x - 0.0048) / 0.0026) ** 2) * (sdf < -0.02).astype(np.float32)
        rgb = rgb * (1.0 - 0.10 * score[..., None])
        rgb = rgb + wall[..., None] * 8.0
    rim = np.clip((-sdf) / 0.016, 0, 1)
    rgb = rgb * (0.90 + 0.10 * rim[..., None])
    return rgb, alpha


def contact_shadow(alpha: np.ndarray, dy: int = 26, blur: float = 16.0) -> np.ndarray:
    h, w = alpha.shape
    base = Image.fromarray((alpha * 200).astype(np.uint8))
    canvas = Image.new("L", (w, h), 0)
    canvas.paste(base, (0, dy))
    return np.array(canvas.filter(ImageFilter.GaussianBlur(radius=blur)), dtype=np.float32) / 255.0


def compose(spec: dict[str, Any], rgb: np.ndarray, alpha: np.ndarray) -> None:
    name = f"category-{spec['id']}"
    cut = np.dstack([np.clip(rgb, 0, 255), np.clip(alpha * 255, 0, 255)])
    cut_img = Image.fromarray(cut.astype(np.uint8)).resize(
        (THUMB, THUMB), Image.Resampling.LANCZOS
    )
    cut_img.save(OUT / f"{name}.png", optimize=True)
    cut_img.save(SOURCE / f"{name}.png")
    print(f"wrote public/brand/pills/{name}.png  {spec['shape']}")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    SOURCE.mkdir(parents=True, exist_ok=True)
    for spec in PILLS:
        rgb, alpha = render_studio(spec)
        compose(spec, rgb, alpha)


if __name__ == "__main__":
    main()
