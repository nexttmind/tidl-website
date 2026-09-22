> Archive. 2024 rebuild capture. Do not implement type, color, or surface from this file. Live tokens: `web/app/globals.css`. Current principles: `13-target-principles.md`.

# Interaction notes (stub)

Filled as source URLs are captured. Seeded from DS only.

## Source: Aesop Hand & Body (captured)

- Desktop: multi-tier nav + megamenu buttons (collapsed); dark hero with overlay copy
- Mobile: ticker + icon utilities + hamburger; hero media then title; horizontal subcategory strip
- Filter button present; filter panel not opened in capture
- Product carousels / grids; compare two-up; recommended reading; footer subscribe
- Chat consultant float + FAB: out of scope v0
- Cookie CMP: ignore

## Overlay grammar (DS)

| Trigger class | Pattern | Close / back |
| --- | --- | --- |
| Info / confirm / short form | Organism/Modal Standard or Form | Overlay click + explicit close (implement when wiring) |
| Multi-step assessment | Pattern/Assessment Modal | Step back + close; progress via Atom/Progress Step |
| FAQ | Accordion molecule | Same page |
| Archetype notecard | Notecard Expanded | Same page |
| Account | Pattern/Account Portal | Route |

## Source: Good Life Meds PDP (captured)

- Desktop buy box: gallery lightbox links, Buy now CTA, plan/pricing prose, FAQ accordions in right column
- Below fold: benefits, testimonial slider, BMI form (feet/inches/pounds + Calculate), quality metrics, how it works, health guide slider, related products, page FAQ, closing CTA
- Image lightbox: inventory only; stub as gallery thumb switch
- Buy now / Get started: map to assessment intake later (`Pattern/Assessment Modal`); v0 stays link/button
- BMI Calculate: wire client-side math (educational tool; disclaimer required)
- FAQ: Molecule/FAQ Accordion Item Expanded|Collapsed
- Promo code callout: static Molecule/Promo Callout
- Dosage/plan select: Atom/Select stub (options = supply interval, not molecule titration labels)

## Source: tidldemo2 `#journey` Care Dial (captured)

- Desktop: fixed radial motif; center title + body + Get Started; left vertical care-area list (icon + label, active card + pointer); right provider list (avatar + name, active highlight + pointer). Live staging uses a vertical ticker + Lottie for providers; prior design (user screenshot) uses dual static lists. Rebuild follows the dual-list interaction model.
- Mobile: care-area chips; provider row; center copy stacked above motif
- Selecting a care area updates active state and may rotate highlighted provider (fixture linked)
- Selecting a provider updates active state only
- Auto-advance optional; honor prefers-reduced-motion
- CTA: Get Started → `/stacks` (assessment wiring later)

## Not yet wired

- Global flow map (`09-flow-map.md`) after ≥2 restyled pages — ready to draft (category + PDP exist)
- Motion (later phase)
- Assessment modal from Get started
- Source-site modals beyond FAQ/BMI

## DS interaction specs to read when capturing category pages

- `04 · Category Section · Interaction Spec` (`322:2678`)
- Media/Pen Video Paused|Playing
- Nav scrolled glass state
