> Archive. 2024 rebuild capture. Do not implement type, color, or surface from this file. Live tokens: `web/app/globals.css`. Current principles: `13-target-principles.md`.

# Responsive notes

| Band | Widths (approx) | Layout changes |
| --- | --- | --- |
| mobile | ≤640 (~390) | Ticker sticky; logo left + icon utilities; hero media then title below; subcategory horizontal scroll; 1-col product stacks / peek carousels; hamburger menu |
| tablet | 641–1024 | 2-col product grids; hero may keep stacked or mid layout |
| desktop | ≥1025 (~1280–1440) | Full nav row; hero dark overlay with left copy; multi-col product carousels; filter inline |

## Content width (hims.com)

Matched to hims homepage-frame:

| Token | Value | Role |
| --- | --- | --- |
| `--layout-frame` | `1728px` | Outer section / hero shell (`.layout-frame`) |
| `--layout-max` | `1728px` | Content rail inside the frame |
| `--layout-gutter` | `16px` (20px ≥1025) | Horizontal inset for chrome + content |

Behavior:

- Below 1728: frame is `width: 100%` (near full viewport), same as hims
- Above 1728: frame centers; body wash shows in the side margins
- `.layout-bleed` on the ticker: true viewport full bleed (hims top promo)
- `.layout-container` / `.layout-rail`: gutters inside the frame

Do not reintroduce a 1440 cap or `100% - 2*gutter` frame shrink; that is what made tidl look narrower than hims.
