#!/usr/bin/env python3
"""Legacy SVG thumbs. Current menu art is compose-pill-labels.py on Figma renders."""

from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "public" / "brand" / "pills"


def imprint(cx: float, cy: float, scale: float = 1.0, fill: str = "#1a1a1a", opacity: float = 0.55) -> str:
    return f"""<g transform="translate({cx},{cy}) scale({scale})" opacity="{opacity}" fill="{fill}">
  <path d="M-16.5 -3.2h6.2v1.55h-2.2v4.85h-1.8V-1.65h-2.2z"/>
  <rect x="-8.2" y="-3.2" width="1.7" height="6.4"/>
  <path d="M-4.8 -3.2h3.9c1.85 0 3.25 1.45 3.25 3.2s-1.4 3.2-3.25 3.2h-3.9V-3.2zm1.7 1.45v3.5h2.05c.85 0 1.5-.65 1.5-1.75s-.65-1.75-1.5-1.75H-3.1z"/>
  <path d="M5.4 -3.2h1.7v4.85H12.8v1.55H5.4z"/>
</g>"""


def card_bg(c1: str, c2: str) -> str:
    return f"""<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="{c1}"/>
    <stop offset="100%" stop-color="{c2}"/>
  </linearGradient>
  <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
    <feDropShadow dx="0" dy="3.5" stdDeviation="4" flood-color="#000" flood-opacity="0.24"/>
  </filter>
  <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#fff" stop-opacity="0.55"/>
    <stop offset="45%" stop-color="#fff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000" stop-opacity="0.14"/>
  </linearGradient>
  <radialGradient id="glow" cx="35%" cy="30%" r="65%">
    <stop offset="0%" stop-color="#fff" stop-opacity="0.35"/>
    <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect width="160" height="120" rx="18" fill="url(#bg)"/>
<rect width="160" height="120" rx="18" fill="url(#glow)"/>"""


def wrap(body: str) -> str:
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120" role="img" aria-label="TIDL tablet">
{body}
</svg>
"""


PILLS: list[tuple[str, str]] = [
    # Sexual health — four distinct ED tablets
    (
        "sexual-ed-diamond",
        wrap(
            card_bg("#D7E3EE", "#AFC0D4")
            + """
  <g filter="url(#soft)" transform="translate(80 60) rotate(45)">
    <rect x="-27" y="-27" width="54" height="54" rx="11" fill="#355A82"/>
    <rect x="-27" y="-27" width="54" height="54" rx="11" fill="url(#sheen)"/>
    <rect x="-21" y="-21" width="42" height="42" rx="8" fill="none" stroke="#fff" stroke-opacity="0.22" stroke-width="1"/>
  </g>
"""
            + imprint(80, 60, 0.7, "#F3F7FB", 0.72)
        ),
    ),
    (
        "sexual-ed-almond",
        wrap(
            card_bg("#F3E4C7", "#E2C795")
            + """
  <g filter="url(#soft)">
    <ellipse cx="80" cy="60" rx="46" ry="24" fill="#C88A2E"/>
    <ellipse cx="80" cy="60" rx="46" ry="24" fill="url(#sheen)"/>
    <ellipse cx="80" cy="54" rx="34" ry="10" fill="#fff" fill-opacity="0.18"/>
  </g>
"""
            + imprint(80, 60, 0.68, "#FFF8EC", 0.78)
        ),
    ),
    (
        "sexual-ed-round",
        wrap(
            card_bg("#F0D9CF", "#E0B5A4")
            + """
  <g filter="url(#soft)">
    <circle cx="80" cy="60" r="30" fill="#C45C3A"/>
    <circle cx="80" cy="60" r="30" fill="url(#sheen)"/>
    <circle cx="80" cy="60" r="22" fill="none" stroke="#fff" stroke-opacity="0.2" stroke-width="1"/>
    <path d="M80 38v44" stroke="#fff" stroke-opacity="0.28" stroke-width="1.2"/>
  </g>
"""
            + imprint(80, 60, 0.62, "#FFF5F0", 0.75)
        ),
    ),
    (
        "sexual-ed-oblong",
        wrap(
            card_bg("#D9E8DE", "#B7D0C2")
            + """
  <g filter="url(#soft)">
    <rect x="34" y="42" width="92" height="36" rx="18" fill="#4F7A66"/>
    <rect x="34" y="42" width="92" height="36" rx="18" fill="url(#sheen)"/>
    <ellipse cx="56" cy="52" rx="14" ry="6" fill="#fff" fill-opacity="0.16"/>
  </g>
"""
            + imprint(80, 60, 0.68, "#F2FAF5", 0.72)
        ),
    ),
    # TRT adjuncts
    (
        "mens-enclo",
        wrap(
            card_bg("#EDE8DF", "#D9D0C3")
            + """
  <g filter="url(#soft)">
    <circle cx="80" cy="60" r="26" fill="#F4EFE6"/>
    <circle cx="80" cy="60" r="26" fill="url(#sheen)"/>
    <circle cx="80" cy="60" r="26" fill="none" stroke="#C4B7A4" stroke-width="1.2"/>
    <path d="M80 40v40" stroke="#B7A894" stroke-width="1.1" stroke-opacity="0.7"/>
  </g>
"""
            + imprint(80, 60, 0.58, "#5C5348", 0.55)
        ),
    ),
    (
        "mens-ana",
        wrap(
            card_bg("#EADFE4", "#D5C2CB")
            + """
  <g filter="url(#soft)">
    <circle cx="80" cy="60" r="20" fill="#E8C4D0"/>
    <circle cx="80" cy="60" r="20" fill="url(#sheen)"/>
    <circle cx="80" cy="60" r="14" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="1"/>
  </g>
"""
            + imprint(80, 60, 0.48, "#6A4A55", 0.55)
        ),
    ),
    # Hair oral
    (
        "hair-fina",
        wrap(
            card_bg("#DDE3EA", "#C2CCD8")
            + """
  <g filter="url(#soft)">
    <path d="M80 32 L104 48 L104 72 L80 88 L56 72 L56 48 Z" fill="#6B7C90"/>
    <path d="M80 32 L104 48 L104 72 L80 88 L56 72 L56 48 Z" fill="url(#sheen)"/>
  </g>
"""
            + imprint(80, 60, 0.55, "#F4F7FA", 0.7)
        ),
    ),
    (
        "hair-duta",
        wrap(
            card_bg("#E6E1D6", "#CFC6B6")
            + """
  <defs>
    <linearGradient id="cap" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2A2A2A"/>
      <stop offset="48%" stop-color="#2A2A2A"/>
      <stop offset="52%" stop-color="#C4A574"/>
      <stop offset="100%" stop-color="#C4A574"/>
    </linearGradient>
  </defs>
  <g filter="url(#soft)">
    <rect x="36" y="46" width="88" height="28" rx="14" fill="url(#cap)"/>
    <rect x="36" y="46" width="88" height="28" rx="14" fill="url(#sheen)"/>
    <path d="M80 46v28" stroke="#fff" stroke-opacity="0.18" stroke-width="1"/>
  </g>
"""
            + imprint(58, 60, 0.42, "#F5F0E6", 0.65)
            + imprint(102, 60, 0.42, "#2A2A2A", 0.4)
        ),
    ),
    (
        "hair-mino",
        wrap(
            card_bg("#E8EEE8", "#CDD8CD")
            + """
  <g filter="url(#soft)">
    <circle cx="80" cy="60" r="28" fill="#F7FAF7"/>
    <circle cx="80" cy="60" r="28" fill="url(#sheen)"/>
    <circle cx="80" cy="60" r="28" fill="none" stroke="#B7C4B7" stroke-width="1.3"/>
    <path d="M66 60h28" stroke="#9AAB9A" stroke-width="1.1"/>
    <circle cx="80" cy="60" r="21" fill="none" stroke="#C4A574" stroke-opacity="0.55" stroke-width="1"/>
  </g>
"""
            + imprint(80, 52, 0.5, "#5A655A", 0.5)
        ),
    ),
    # Weight oral
    (
        "weight-sema-oral",
        wrap(
            card_bg("#E8DED4", "#D4C1B0")
            + """
  <g filter="url(#soft)">
    <path d="M52 74c0-18 12-34 28-34s28 16 28 34c0 6-8 10-28 10s-28-4-28-10z" fill="#B8896A"/>
    <path d="M52 74c0-18 12-34 28-34s28 16 28 34c0 6-8 10-28 10s-28-4-28-10z" fill="url(#sheen)"/>
    <ellipse cx="70" cy="54" rx="10" ry="5" fill="#fff" fill-opacity="0.2"/>
  </g>
"""
            + imprint(80, 66, 0.55, "#FFF6EE", 0.7)
        ),
    ),
    (
        "weight-orfo",
        wrap(
            card_bg("#D9DDE3", "#B8C0CB")
            + """
  <defs>
    <linearGradient id="nightgold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1A1A1A"/>
      <stop offset="50%" stop-color="#1A1A1A"/>
      <stop offset="50%" stop-color="#C4A574"/>
      <stop offset="100%" stop-color="#C4A574"/>
    </linearGradient>
  </defs>
  <g filter="url(#soft)">
    <rect x="30" y="48" width="100" height="24" rx="12" fill="url(#nightgold)"/>
    <rect x="30" y="48" width="100" height="24" rx="12" fill="url(#sheen)"/>
  </g>
"""
            + imprint(52, 60, 0.4, "#F4F4F4", 0.7)
            + imprint(108, 60, 0.4, "#1A1A1A", 0.45)
        ),
    ),
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, svg in PILLS:
        path = OUT / f"{name}.svg"
        path.write_text(svg, encoding="utf-8")
        print(f"wrote {path.relative_to(OUT.parent.parent)}")


if __name__ == "__main__":
    main()
