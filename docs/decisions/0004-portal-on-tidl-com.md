# 0004 Patient portal on tidl.com

Status: locked
Date: 2026-06

## Decision

Portal lives at tidl.com with custom TIDL UI over the PrescribeRx white label
CRM.

## Rationale

No handoff to a third party domain mid journey. Named molecules are disclosed
only behind this login.

## Consequences

DNS cutover runbook required. Session and auth boundary between marketing site
and portal needs specifying.
