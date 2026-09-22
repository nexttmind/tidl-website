#!/usr/bin/env python3
"""Sit the studio tablet on its category peptide label.

The bloom stays a field. The pill keeps its designed color and TIDL imprint.
No molecule names on art.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(__file__).resolve().parent / "assets" / "pills-source"
LABELS = ROOT / "public" / "brand" / "peptide" / "labels"
OUT = ROOT / "public" / "brand" / "pills"

# Square window on the 2:1 label. Crop to the bloom, not empty field.
LABEL_CROP = {
    "sexual-health": (0.00, 0.00, 0.50, 1.00),
    "testosterone": (0.00, 0.00, 0.50, 1.00),
    "skin-hair": (0.22, 0.00, 0.72, 1.00),
    "weight-loss": (0.28, 0.00, 0.78, 1.00),
    "womens-health": (0.12, 0.00, 0.62, 1.00),
    "recovery": (0.00, 0.00, 0.50, 1.00),
}

# Inset past the studio rim. Geometry is the keep; color keys eat the face.
PILLS: list[tuple[str, str, dict[str, Any]]] = [
    ("sexual-ed-diamond", "sexual-health", {"kind": "diamond", "r": 0.222, "k": 0.30}),
    ("sexual-ed-almond", "sexual-health", {"kind": "ellipse", "rx": 0.382, "ry": 0.162}),
    ("sexual-ed-round", "sexual-health", {"kind": "circle", "r": 0.258}),
    ("sexual-ed-oblong", "sexual-health", {"kind": "capsule", "rx": 0.298, "ry": 0.086}),
    ("mens-enclo", "testosterone", {"kind": "circle", "r": 0.218}),
    ("mens-ana", "testosterone", {"kind": "circle", "r": 0.188}),
    ("hair-fina", "skin-hair", {"kind": "hex", "r": 0.218}),
    ("hair-duta", "skin-hair", {"kind": "capsule", "rx": 0.348, "ry": 0.118}),
    ("hair-mino", "skin-hair", {"kind": "circle", "r": 0.234}),
    ("weight-sema-oral", "weight-loss", {"kind": "ellipse", "rx": 0.300, "ry": 0.172}),
    ("weight-orfo", "weight-loss", {"kind": "capsule", "rx": 0.378, "ry": 0.096}),
]


def load_rgb(path: Path) -> np.ndarray:
    return np.array(Image.open(path).convert("RGB"), dtype=np.float32)


def square_label(label: np.ndarray, crop: tuple[float, float, float, float], size: int) -> np.ndarray:
    h, w = label.shape[:2]
    x0, y0, x1, y1 = crop
    box = label[int(y0 * h) : max(int(y1 * h), 1), int(x0 * w) : max(int(x1 * w), 1)]
    bh, bw = box.shape[:2]
    side = min(bh, bw)
    top = (bh - side) // 2
    left = (bw - side) // 2
    box = box[top : top + side, left : left + side]
    return np.array(
        Image.fromarray(box.astype(np.uint8)).resize((size, size), Image.Resampling.LANCZOS),
        dtype=np.float32,
    )


def coords(h: int, w: int) -> tuple[np.ndarray, np.ndarray]:
    yy, xx = np.mgrid[0:h, 0:w]
    y = (yy - (h - 1) / 2) / h
    x = (xx - (w - 1) / 2) / w
    return x, y


def sdf_to_alpha(sdf: np.ndarray, feather: float = 0.004) -> np.ndarray:
    return np.clip(0.5 - sdf / max(feather, 1e-6), 0, 1).astype(np.float32)


def shape_alpha(h: int, w: int, spec: dict[str, Any]) -> np.ndarray:
    x, y = coords(h, w)
    kind = spec["kind"]
    if kind == "circle":
        sdf = np.sqrt(x * x + y * y) - spec["r"]
    elif kind == "ellipse":
        rx, ry = spec["rx"], spec["ry"]
        sdf = (np.sqrt((x / rx) ** 2 + (y / ry) ** 2) - 1) * min(rx, ry)
    elif kind == "capsule":
        rx, ry = spec["rx"], spec["ry"]
        ax = np.clip(x, -(rx - ry), (rx - ry))
        sdf = np.sqrt((x - ax) ** 2 + y * y) - ry
    elif kind == "diamond":
        r = spec["r"]
        xr = (x + y) / np.sqrt(2)
        yr = (y - x) / np.sqrt(2)
        px, py = np.abs(xr) / r, np.abs(yr) / r
        k = spec.get("k", 0.28)
        sdf = (
            np.sqrt(np.maximum(px - 1 + k, 0) ** 2 + np.maximum(py - 1 + k, 0) ** 2)
            + np.minimum(np.maximum(px, py) - 1 + k, 0)
            - k
        ) * r
    elif kind == "hex":
        r = spec["r"]
        px, py = np.abs(x) / r, np.abs(y) / r
        sdf = (np.maximum(px * 0.866 + py * 0.5, py) - 1) * r
    else:
        raise ValueError(kind)
    return sdf_to_alpha(sdf)


def pill_alpha(h: int, w: int, spec: dict[str, Any]) -> np.ndarray:
    geom = shape_alpha(h, w, spec)
    hard = ndimage.binary_erosion(geom > 0.5, iterations=2)
    return np.clip(ndimage.gaussian_filter(hard.astype(np.float32), sigma=0.7), 0, 1)


def shadow(alpha: np.ndarray, dy: int = 8, blur: float = 6.0) -> np.ndarray:
    h, w = alpha.shape
    base = Image.fromarray((alpha * 170).astype(np.uint8))
    canvas = Image.new("L", (w, h), 0)
    canvas.paste(base, (0, dy))
    return np.array(canvas.filter(ImageFilter.GaussianBlur(radius=blur)), dtype=np.float32) / 255.0


def compose(name: str, label_id: str, spec: dict[str, Any]) -> None:
    pill = load_rgb(SOURCE / f"{name}.png")
    label_src = load_rgb(LABELS / f"{label_id}.png")
    h, w = pill.shape[:2]
    plate = square_label(label_src, LABEL_CROP[label_id], w)
    alpha = pill_alpha(h, w, spec)
    shade = shadow(alpha)
    out = plate * (1 - shade[..., None] * 0.50)
    out = out * (1 - alpha[..., None]) + pill * alpha[..., None]
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(OUT / f"{name}.png", optimize=True)
    print(f"wrote public/brand/pills/{name}.png  plate={label_id}  cover={alpha.mean():.3f}")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, label_id, spec in PILLS:
        compose(name, label_id, spec)


if __name__ == "__main__":
    main()
