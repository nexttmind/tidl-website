> Archive. 2024 rebuild capture. Do not implement type, color, or surface from this file. Live tokens: `web/app/globals.css`. Current principles: `13-target-principles.md`.

# Page blueprints

## Product category (`/hand-and-body`)

Source: Aesop Hand & Body. Structure only; paint = TIDL DS.

Order (top → bottom):

1. Ticker/Announcement — complimentary shipping (or TIDL equivalent fixture)
2. Nav/Global — desktop: logo + primary links + search/cart utilities; mobile: logo + search/store/cart + menu (drawer stub)
3. Category/Hero — H1 + short body; desktop: full-bleed dark media with overlay copy; mobile: media band then title/body on light surface
4. Subcategory/NavStrip — horizontal scroll: Hand Washes & Balms, Bar Soaps, Body Cleansers & Scrubs, Body Balms & Oils, Oral Care & Deodorants (thumb + label)
5. Filter/Control — Filter button (opens sheet/drawer on source; stub interaction)
6. Merch/Carousel — eyebrow "Unorthodox suggestions" + title "To complement and contrast" + product cards row
7. Merch/Product rows — subcategory product cards (name, size/variant line, price, add action)
8. Editorial/Compare — "A tale of two hand washes" (two-up product feature)
9. Merch/Featured band — "For the bathing connoisseur" + product grid/carousel
10. Merch/Seasonal — "Warm-weather companions" + products
11. Support/Assist — "Sensorial support" / "For additional assistance"
12. Editorial/Reading — "Recommended reading" cards
13. Footer/Global — link columns + subscribe

Primary action region: product card Add / product link
Secondary: Filter, subcategory jump, chat/consultant float (out of scope for v0 UI; note only)

Out of scope v0: live cart, real search, cookie CMP, live chat FAB, megamenu flyouts (log as interactions).

## Product detail (`/stacks/transformation`)

Source: Good Life Meds PDP (`/products/tirzepatide`). Structure only; paint = TIDL DS. Consumer copy is stack named (Transformation Stack). Molecule names and outcome claims stripped for compliance.

Order (top → bottom):

1. Ticker/Announcement + Nav/Global (shared chrome)
2. Commerce/PDP buy box — Pattern/Product Detail Page
   - Left: Product Image Gallery (main + thumbs; one thumb may be social proof card)
   - Right: Breadcrumb · H1 · price + primary CTA · short body · Trust Badges · plan Select · Promo Callout · FAQ accordion cluster (What's included, What is this stack, Switch providers, Quality, Pricing) · compounding disclaimer · Important Safety Information link
3. Editorial/Lead CTA — short headline band (source “Take control…” role; TIDL voice, no outcome claims)
4. Benefits/Section — Pattern/Benefits Section (intro + Benefit Rows)
5. Proof/Testimonials — testimonial cards carousel (process/service quotes only; no weight outcomes)
6. Tool/BMI — Pattern/BMI Calculator Section
7. Quality/Lab — Pattern/Quality Tested Section (metrics + image stack)
8. Process/HowItWorks — three steps (questionnaire → provider evaluation → delivery)
9. Editorial/Reading — Pattern/Recommended Reading (Health Guide role)
10. Merch/Related — Pattern/Complementary Products or Product Carousel (related stacks)
11. FAQ/Page cluster — Molecule/FAQ Accordion Item list
12. Assist/CTA — Pattern/CTA Band (closing)
13. Footer/Global

Primary action region: Add to bag / Get started (buy box)
Secondary: plan select, FAQ expand, BMI calculate, related stack links, safety info

Out of scope v0: live checkout, assessment modal wiring, LegitScript badge, cookie CMP, source megamenu.

## Home Care Dial (`/` · `LandingCare`)

Source: tidldemo2.netlify.app `#journey` (prior dual-list design + live copy). Structure only; paint = TIDL DS.

Order (section internals):

1. Radial motif (decorative)
2. Center: H2 + body + primary CTA
3. Left: care area radio list (icon + label; selected card + pointer)
4. Right: provider radio list (avatar + name; selected card + pointer)
5. Mobile: stack center → motif → horizontal area chips → horizontal providers

Primary action: Get Started
Secondary: area / provider select (linked fixtures)
