# Target tokens — live site

Canonical source: `web/app/globals.css`. This file is a readable mirror. If they disagree, the CSS wins.

Do not load font families that are not bound below. Do not restore Source Serif 4, Questrial, Canela, or Sohne on the consumer site.

## Modes

- Light UI only. No dark mode product theme.
- Inverse / dark sections are surface roles (footer, some heroes), not a theme switch.

## Type

| Role | Family |
| --- | --- |
| `--font-display` | Inter. Scale `--font-display-scale` `1.4` |
| `--font-ui` | Inter |
| `--font-mono` | Space Mono |

Display and titles use Inter, not a serif. Button labels: title case. Nav labels: uppercase.

## Color primitives

| Token | Value |
| --- | --- |
| `--color-ink` | `#1a1a1a` |
| `--color-white` | `#ffffff` |
| `--color-paper` | `#fbf9f6` |
| `--color-night` | `#212b38` |
| `--color-slate` | `#405774` |
| `--color-gold` | `#ebbb3e` |
| `--color-rule` | `#e5e5e5` |

`--color-paper` is a raised / card cream. It is not the page wash.

## Page wash

One fixed viewport layer. Do not tile per section.

| Token | Value |
| --- | --- |
| `--section-bg-base` | `#f4f6f0` cool bone |
| `--section-bg-image` | layered cool green-gray radials in `globals.css` |
| `--footer-bg-base` | `#212b38` |

Retired: warm cream stack `#F5F2ED` + `#BFD4EB` / `#E8D9C7` / `#D1E0F2`.

## Semantic roles

Surface: `--surface-page` (paper), `--surface-page-raised` (white), `--surface-sunken` `#f0ebe4`, `--surface-inverse` `#1a1a1a`, `--surface-glass`, `--surface-overlay`, `--surface-brand` slate.

Text: `--text-primary` ink, `--text-secondary` / `--text-tertiary` muted ink, inverse and disabled roles as in CSS.

Action: `--action-primary` `#405774`. Gold is an accent, not the primary fill.

Used peptide tokens only: `--peptide-field` `#070709`, `--peptide-champagne` `#f4e6c8`. Do not republish a direction / category hex ramp on `:root`.

## Radius, space, layout

- Space: 4/8 grid, `--space-0` … `--space-11`
- `--radius-control` `50px` · `--radius-card` `20px` · `--radius-media` `12px` · `--radius-pill` `9999px`
- `--layout-frame` / `--layout-max` `1728px` · `--layout-gutter` `16px` (`20px` at `width >= 1025px`)
- `--bp-tablet` `721px` · `--bp-desktop` `1025px`. Phone is `width < 721px`. Tablet is `721px <= width < 1025px`. Desktop is unscoped. `var()` is invalid in `@media` conditions; write the literals.

## Retired (do not scrape back in)

- `--font-serif` / Source Serif 4
- `--font-questrial` / Questrial
- `--peptide-gold`, `--peptide-direction-*`, `--peptide-category-*`, `--peptide-petal-ghost`
- Public identity dumps at `/brand/peptide` and `/emails/*.html` (routes deleted)
