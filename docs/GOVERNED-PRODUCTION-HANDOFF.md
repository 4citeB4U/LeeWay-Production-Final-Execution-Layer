<!--
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.PRODUCTION.GOVERNED_HANDOFF
TAG: LEEWAY.PRODUCTION.SOURCE_REVIEW_INGRESS_V1
5WH:
WHAT=Document a deterministic, fail-closed candidate intake for full-market release.
WHY=Never bypass Standards, source evidence, independent Veritas, Receipt, learning, rollback or deployed POST.
WHO=Production & Final Execution Layer source custodian.
WHERE=docs/GOVERNED-PRODUCTION-HANDOFF.md.
WHEN=2026-11-11.
HOW=Source-only packet validator, 12 negative tests, three-OS CI with retained SHA-256 artifacts.
LICENSE: Not asserted pending owner license review.
-->
# Governed release intake — source contract, not a deployed service

A release request cannot travel from IDEA to marketable product because an LLM says 'approved'. `src/governed-handoff-preflight.mjs` provides a bounded inspection of the **existing** Production release handoff contract, enforcing exact original mission/source identity, registered actor/API/file assertions, required proof stages, Veritas independence scope, receipt and learning references, target and rollback. Unknown actor/API/file, counterfeit approval, mismatched source/workId or absent stage returns `HOLD_SECURITY` or `PREPARATION_ONLY`.

The strongest possible source result is `REVIEW_INTAKE_CANDIDATE`, **never `DEPLOYMENT_AUTHORIZED`**. All fields are untrusted source candidate data; even a complete packet is NOT a real independently verified Veritas or Receipt readback. An authenticated Runtime host must separately validate actual actor, adapter, source and all issuers before any execution, then Production uses an existing approved deployment connector. Do not create a new queue, token issuer, ledger, verifier, Formula evaluator, GPU or Machine Consciousness.

**Assembly responsibilities:** Standards policy → Runtime Formula/governed workplane → Machine Consciousness monitoring/hold request (not sovereign authority) → actual execution & immutable source tests → independent Veritas PRE/POST → Receipt Authority append/atomic learning outbox/readback → Learning Ledger eligible readback → owner-authorized Production target/release → deployed independent Veritas POST → deployed Receipt readback → scientific acceptance and marketability. Prior verified nodes remain reusable; source-only tests can be carried forward as supporting evidence but never become production signatures.

**Source CI custody:** Run the original Node 22 tests on Ubuntu, Windows and macOS. Both PASS and FAIL generate a machine-readable result and output hashes, uploaded as GitHub artifacts with 90-day requested retention, with fail-closed artifact metadata readback. GitHub artifacts are temporary custody pointers; independent byte-readback and original tenant-scoped Receipt Authority append/readback require a real provider.

**Production blocker at creation:** Source tests are not live policy enforcement; existing Runtime device bridge discovery failed upstream HTTP 401 and the original production signer, source-pinned provider integration, independent deployed POST, Receipt append/readback and Learning durable readback are not observed. This source candidate requires owner review and host integration; it does not install middleware, block any live external API or make an executable deployment.
