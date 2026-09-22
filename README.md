# TIDL

Operator workspace and Next.js site for the TIDL relaunch. Specs, decisions,
compliance rules, and the `web/` app live here.

## Layout

    .cursor/rules/   voice, compliance, docx, figma, media
    docs/            PRD, decisions, specs, open questions, handoffs
    reference/       transcripts, PrescribeRx API docs, brand, partners
    build/           docx generators, figma scripts, media pipeline, tools
    web/             Next.js App Router site (Vercel root directory)
    out/             generated deliverables, gitignored
    assets/          plates and renders, gitignored

Markdown in `docs/` is canonical. `docs/decisions/` stops relitigation.
Care / portal continuation: `docs/handoff-patient-portal.md`.

## Local site

    cd web
    cp ../.env.example .env.local   # fill PRESCRIBERX_* + TIDL_SESSION_SECRET
    bash ../build/tools/refresh-prescriberx-sandbox.sh   # PrescribeRx sandbox token
    npm install
    npm run dev

Sandbox talks to `https://demo.prescribe-rx.com/api/v1` through
`/api/prescriberx/*`. Never commit `.env` / `.env.local`. Production flip is
env only: base URL, durable token, `PRESCRIBERX_SANDBOX=false`.

Health check: `GET /api/prescriberx/health` should return `healthy: true`.

**Patient portal handoff (Phases A–D, 2026-09-22):** start at
[`docs/handoff-patient-portal.md`](docs/handoff-patient-portal.md). Smoke:
`cd web && npx tsx scripts/smoke-phase-d.ts` with the dev server up.

## GitHub → Vercel

1. Private GitHub repo. Push `main`.
2. Import into Vercel. Set **Root Directory** to `web`.
3. Marketing deploy needs no PrescribeRx env vars.
4. When clinical routes go live, add Preview + Production env from
   `.env.example` (token, base URL, webhook secret, Ask Tidl keys).
5. Custom domain later per decision 0004 (`tidl.com`).

Do not point the app at the Netlify demo host. PrescribeRx direct only.

## First workspace run (docs tooling)

    cp .env.example .env
    bash build/tools/import-transcripts.sh /path/to/existing/transcripts
