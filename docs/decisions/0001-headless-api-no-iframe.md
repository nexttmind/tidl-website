# 0001 Headless API, no iframe

Status: locked
Date: 2026-06-25
Owner: Thomas, with Andrew (PrescribeRx)

## Decision

PrescribeRx headless API only. TIDL custom UI on top. No iframe embed.

## Rationale

Full control of the front end and the brand surface. PHI stays inside
PrescribeRx. The frontend proxies API calls server side so bearer tokens never
reach the browser.

## Consequences

TIDL owns every intake screen and its schema binding. Any PrescribeRx wizard
behaviour we want, we rebuild.
