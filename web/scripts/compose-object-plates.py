#!/usr/bin/env python3
"""Sit the white 3D object in the photographic flare. Not a line icon in the sky."""

from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OBJECTS = ROOT / "public" / "brand" / "peptide" / "objects"
FIELDS = ROOT / "public" / "brand" / "peptide" / "fields"
PLATES = ROOT / "public" / "brand" / "peptide" / "plates"
CUTOUTS = ROOT / "public" / "brand" / "peptide" / "objects" / "cut"

PAIRS = (
    ("object-lobe.png", "glow-executive.png", "peptide-metabolic.png"),
    ("object-honeycomb.png", "glow-athlete.png", "peptide-repair.png"),
    ("object-weave.png", "glow-creators.png", "peptide-mental.png"),
    ("object-particle.png", "glow-healthspan.png", "peptide-sleep.png"),
    ("object-pleat.png", "glow-executive.png", "category-executive.png"),
    ("object-honeycomb.png", "glow-athlete.png", "category-athlete.png"),
)


def key_paper(im: Image.Image) -> Image.Image:
    arr = np.array(im.convert("RGBA"))
    h, w = arr.shape[:2]
    paper = arr[6, 6, :3].astype(np.int16)
    rgb = arr[:, :, :3].astype(np.int16)
    dist = np.abs(rgb - paper).sum(axis=2)
    paperish = dist < 22
    vis = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        q.append((0, x))
        q.append((h - 1, x))
    for y in range(h):
        q.append((y, 0))
        q.append((y, w - 1))
    if paperish[h // 2, w // 2]:
        q.append((h // 2, w // 2))
    while q:
        y, x = q.popleft()
        if vis[y, x] or not paperish[y, x]:
            continue
        vis[y, x] = True
        if y:
            q.append((y - 1, x))
        if y + 1 < h:
            q.append((y + 1, x))
        if x:
            q.append((y, x - 1))
        if x + 1 < w:
            q.append((y, x + 1))

    luma = rgb.mean(axis=2)
    # Contact shadow is a low-contrast stain on the ground plane.
    padded = np.pad(luma, 2, mode="edge")
    local = np.zeros_like(luma)
    for dy in range(-2, 3):
        for dx in range(-2, 3):
            local += padded[2 + dy : 2 + dy + h, 2 + dx : 2 + dx + w]
    local /= 25.0
    contrast = np.abs(luma - local)
    shadow = (dist < 48) & (contrast < 6.5) & (~vis)
    vis = vis | shadow

    alpha = np.where(vis, 0, 255).astype(np.uint8)
    mask = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.8))
    arr[:, :, 3] = np.array(mask)
    return Image.fromarray(arr)


def compose(field: Image.Image, obj: Image.Image) -> Image.Image:
    plate = field.convert("RGBA")
    w, h = plate.size
    obj_w = int(w * 0.86)
    obj = obj.resize((obj_w, obj_w), Image.Resampling.LANCZOS)
    x = (w - obj_w) // 2
    y = int(h * 0.26)
    layer = Image.new("RGBA", plate.size, (0, 0, 0, 0))
    layer.paste(obj, (x, y), obj)
    plate.alpha_composite(layer)
    return plate


def main() -> None:
    CUTOUTS.mkdir(parents=True, exist_ok=True)
    PLATES.mkdir(parents=True, exist_ok=True)
    for obj_name, field_name, out_name in PAIRS:
        cut = key_paper(Image.open(OBJECTS / obj_name))
        cut.save(CUTOUTS / obj_name.replace(".png", "-cut.png"))
        plate = compose(Image.open(FIELDS / field_name), cut)
        path = PLATES / out_name
        plate.convert("RGB").save(path, "PNG")
        print(path)


def defringe_sexual_health() -> None:
    """Strip the dark silhouette ring. Leave the tablet face sharp."""
    path = ROOT / "public" / "brand" / "pills" / "category-sexual-health.png"
    im = Image.open(path).convert("RGBA")
    arr = np.array(im)
    rgb = arr[:, :, :3].astype(np.float32)
    alpha = arr[:, :, 3].astype(np.float32) / 255.0
    opaque = alpha > 0.28
    dist = None
    try:
        from scipy import ndimage

        dist = ndimage.distance_transform_edt(opaque)
        blur = lambda m: ndimage.gaussian_filter(m, 0.28)
    except ImportError:
        from PIL import ImageFilter

        mask = Image.fromarray((opaque.astype(np.uint8) * 255))
        # Fallback distance: invert a small blur of the mask.
        dist = np.array(mask.filter(ImageFilter.GaussianBlur(1.2)), dtype=np.float32) / 255.0
        dist = np.where(opaque, (1.0 - dist) * 6.0, 0.0)
        blur = lambda m: np.array(
            Image.fromarray((np.clip(m, 0, 1) * 255).astype(np.uint8)).filter(
                ImageFilter.GaussianBlur(0.4)
            ),
            dtype=np.float32,
        ) / 255.0

    luma = 0.2126 * rgb[:, :, 0] + 0.7152 * rgb[:, :, 1] + 0.0722 * rgb[:, :, 2]
    core = opaque & (dist > 10)
    if not np.any(core):
        core = opaque & (dist > 4)
    interior = float(luma[core].mean()) if np.any(core) else 140.0
    ring = opaque & (dist <= 2.4) & (luma < interior * 0.82)
    hairline = opaque & (dist <= 1.2) & (luma < interior * 0.92)
    kill = ring | hairline
    alpha2 = np.where(kill, 0.0, alpha)
    lip = (dist > 0) & (dist <= 2.8)
    alpha2 = np.where(lip & (~core), blur(alpha2), alpha2)
    out = arr.copy()
    out[:, :, 3] = np.clip(alpha2 * 255.0, 0, 255).astype(np.uint8)
    Image.fromarray(out).save(path, optimize=True)
    print(f"defringed {path} size={im.size} killed={int(kill.sum())} interior={interior:.1f}")


if __name__ == "__main__":
    import sys

    if "--defringe-sexual-health" in sys.argv:
        defringe_sexual_health()
    else:
        main()
