> Archive. 2024 rebuild capture. Do not implement type, color, or surface from this file. Live tokens: `web/app/globals.css`. Current principles: `13-target-principles.md`.

# Token map — Aesop category → TIDL

| Source role | Target token | Notes |
| --- | --- | --- |
| Page cream canvas | `surface/page` + section light fill stack | Do not keep Aesop `#F6F5E8` as hard requirement |
| Dark hero overlay text | `text/inverse` on `surface/inverse` / dark media | |
| Body text on light | `text/primary`, `text/secondary` | |
| Primary CTA / Add | `action/primary` → Atom/Button Primary | |
| Ghost on dark | Atom/Button Ghost | |
| Borders / hairlines | `border/subtle`, `border/default` | |
| Focus | `border/focus` | |
| Ticker dark bar | inverse surface or night | Mobile Aesop uses near-black bar |
| Nav scrolled | glass surface | |
| Card surface | card white + radius card | |
| Display / H1 | `type/display` or `type/title-lg` | Category title |
| Body | `type/body` | |
| Nav labels | `type/label` | |
| Eyebrows | `type/overline` | |
| Spacing | semantic space roles | 4/8 grid |
| Control radius | pill / `radius/control` | Buttons |
| Card radius | `radius/card` (~20) | |
