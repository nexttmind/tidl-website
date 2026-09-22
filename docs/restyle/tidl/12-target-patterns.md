> Archive. 2024 rebuild capture. Do not implement type, color, or surface from this file. Live tokens: `web/app/globals.css`. Current principles: `13-target-principles.md`.

# Target patterns — TIDL Web DS

Higher-order compositions to prefer when rebuilding live URLs (compose patterns, not only atoms).

## Global chrome

| Pattern | Role |
| --- | --- |
| Pattern/Nav Global | Site nav; transparent over hero; glass on scroll |
| Pattern/Ticker Bar | Promo / utility strip (inherits parent) |
| Pattern/Footer Global | Always dark inverse gradient |
| Pattern/Header | Marketing header shell (with video variants elsewhere) |

## Marketing sections

Hero · Video Hero · Feature Row · Benefits · Proof Strip · Content Prose · CTA Band / CTA Banner Wide · Ticker · Category Section + Category Hero · Product Showcase / Carousel / Carousel Hero · Product Feature Two-Up · Split Content · Product Cards + Editorial · Editorial CTA Strip · Recommended Reading · Clinically-Backed · Quality Tested · BMI Calculator · Complementary Products

## Commerce / PDP

- Pattern/Product Detail Page (Desktop + Mobile variants exist)
- Media/Product Image TIDL Pen
- Media/Pen Video

## Content / FAQ

- Pattern/FAQ Page + FAQ Accordion Item + FAQ Nav Item

## Account / clinical flows

| Pattern | Placement |
| --- | --- |
| Pattern/Account Creation Section | In-page section |
| Pattern/Account Portal | Route-level portal shell |
| Pattern/Assessment Modal | Overlay multi-step (progress + radios/chips/upload) |
| Organism/Modal | Standard and form overlays |

## Archetype merchandising

- Molecule/Category Section (6 categories)
- Molecule/Notecard {Executive, Athlete, Transformation, Parents, Creative, Legacy} Default/Expanded
- Interaction detail: frame `04 · Category Section · Interaction Spec` (`322:2678`)

## Responsive board

`03 · Patterns · Responsive` (`316:3172`): Desktop · Tablet · Mobile demos for nav, hero, feature, footer.

## Example assembly

`_example / Landing Page Assembly` (`316:3310`) shows instance composition. Prefer this grammar over the older monolithic `tidl.com landing page` frame when mapping roles.
