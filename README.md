# LeeWay Production & Final Execution Layer

**Canonical role:** receive prequalified, source-pinned, independently governed release handoffs from LeeWay application repositories; coordinate deployment/final execution using the existing LeeWay Runtime Fabric, LeeWay Standards, Veritas, Receipt Ledger and Learning Ledger authorities.

This repository is **not** a substitute for the canonical Runtime Fabric, a duplicate verifier, a Formula implementation, a new job queue, or a new ledger.

## Deployment handoff law

A handoff packet must identify the source repository and immutable commit, approved deployment target, supported hosts and protocols, rollback, security and resource requirements, genuine test outcomes, engineering-loop evidence, and independent Veritas / canonical receipt / Learning references. It must distinguish:

- `PREPARATION_ONLY`: source and artifacts staged; unresolved admission or target checks.
- `READY_FOR_PRODUCTION_FABRIC_REVIEW`: artifact/provenance evidence is complete; only Production Fabric's independent release review and deployment remain.
- `DEPLOYMENT_AUTHORIZED`: existing canonical authorities (not this repository) supplied authenticated grants and receipt-bound release approval.
- `DEPLOYED_VERIFIED`: real deployment, post-state, independent readback and canonical receipt are verified.

Absent, expired, unavailable or contradictory evidence **blocks deployment**. CI PASS or Vercel READY alone does not establish independent Veritas admission. Do not fabricate approvals, production endpoints, learning, or receipts.

## Current handoffs

- [Edge RTC → Runtime Fabric → Production Fabric](handoffs/EDGE-RTC-20261027.md) — current preparation and outstanding deployment prerequisites.

The repository's first source files constitute documentation and a handoff intake, **not a running deployment service**. Production automation requires a separately verified canonical Runtime Fabric invocation and owner-controlled deployment credentials. No Fly.io services or third-party hosting are authorized by this repository.
