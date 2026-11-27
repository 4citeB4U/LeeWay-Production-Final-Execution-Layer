# LeeWay Production & Final Execution Layer

**Canonical role:** receive prequalified, source-pinned, independently governed release handoffs from LeeWay application repositories; coordinate deployment/final execution using the existing LeeWay Runtime Fabric, LeeWay Standards, Veritas, Receipt Ledger and Learning Ledger authorities.

This repository is **not** a substitute for the canonical Runtime Fabric, a duplicate verifier, a Formula implementation, a new job queue, or a new ledger.

## Deployment handoff law

A handoff packet must identify the source repository and immutable commit, approved deployment target, supported hosts and protocols, rollback, security and resource requirements, genuine test outcomes, engineering-loop evidence, and independent Veritas / canonical receipt / Learning references.

**Gate contract (Sentinel correction, 2026-11-13):** `evaluateProductionPromotion` now returns a **staged handoff review**, never a physical deployment authorization or successful production rollout. Its historical `qualified: true`, `admitted: true` and digest-shaped handoff fields are untrusted declarations. A host-injected `admissionProvider.verifyOriginalCustody` must independently re-check original Veritas readback, Receipt Authority readback, Creator release grant and the exact source/digest references; otherwise the handoff is blocked. The production host, not untrusted HTTP/task input or this repository, selects that provider. The existing Runtime/Veritas/Receipt/Production authorities remain the only sources of their respective decisions. Source fixture tests can exercise the provider shape but cannot establish a live admission. Owner-authorized deployment, process poststate, rollback and independent acceptance remain separate requirements. It must distinguish:

- `PREPARATION_ONLY`: source and artifacts staged; unresolved admission or target checks.
- `READY_FOR_PRODUCTION_FABRIC_REVIEW`: artifact/provenance evidence is complete; only Production Fabric's independent release review and deployment remain.
- `DEPLOYMENT_AUTHORIZED`: existing canonical authorities (not this repository) supplied authenticated grants and receipt-bound release approval.
- `DEPLOYED_VERIFIED`: real deployment, post-state, independent readback and canonical receipt are verified.

Absent, expired, unavailable or contradictory evidence **blocks deployment**. CI PASS or Vercel READY alone does not establish independent Veritas admission. Do not fabricate approvals, production endpoints, learning, or receipts.

## Current handoffs

- [Edge RTC → Runtime Fabric → Production Fabric](handoffs/EDGE-RTC-20261027.md) — current preparation and outstanding deployment prerequisites.

The repository's first source files constitute documentation and a handoff intake, **not a running deployment service**. Production automation requires a separately verified canonical Runtime Fabric invocation and owner-controlled deployment credentials. No Fly.io services or third-party hosting are authorized by this repository.

<!-- LEEWAY UNIVERSAL FORMULA GOVERNANCE BEGIN -->

# LeeWay Universal Formula Governance

Authority: Creator and LeeWay Standards.
Formula identity: LEEWAY-FORMULA-v1.0.

The canonical LeeWay Formula is mandatory throughout
the entire LeeWay ecosystem.

Every current and future application, capability,
agent, worker, employee, model, provider, adapter,
automation and integration inherits this requirement.

All applicable interactions, responses, decisions,
actions, revisions, executions, computations, model
inferences, resource allocations, information transfers,
memory operations, storage operations and deployments
must consume the canonical Formula through their
authorized and qualified domain contracts.

Formula availability, documentation, configuration,
health and historical results do not constitute actual
Formula consumption for a new operation.

Recover relevant authorized memory before substantive
work. Preserve identity, provenance, Formula integrity,
authorization, original receipts and verified learning.

Never invent observations, adapter mappings, mathematical
results, execution evidence or independent verification.

No application may bypass applicable Formula governance
by dispatching directly to a provider.

Every new application and capability must demonstrate
applicable Formula consumption before production admission.

Preserve the existing authority hierarchy:

Creator > Standards > Root of Trust > Runtime Fabric >
Agent Lee > Harness > Formula > skills/models/tools >
execution > Veritas > Receipt Authority > Learning Ledger.

Execute the complete engineering loop:

INVESTIGATE > DIAGNOSE > PLAN > IMPLEMENT > TEST >
VALIDATE > REPAIR > RETEST > VERIFY > EVIDENCE >
CHECKPOINT > CONTINUE.

Documentation compliance does not establish executable
enforcement or production admission.

<!-- LEEWAY UNIVERSAL FORMULA GOVERNANCE END -->
