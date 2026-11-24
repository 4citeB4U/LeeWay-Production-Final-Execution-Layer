/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.PRODUCTION.TESTS
TAG: LEEWAY.PRODUCTION.TESTS.RELEASE_GATE.V1
DISCOVERY_PIPELINE: Voice → Intent → Location → Vertical → Ranking → Render
5WH:
WHAT = Verify PROMOTE_PRODUCTION gate fails closed without independent Veritas, Sovereign Constitution conformance, OS Trust clearance, and SQLite WAL replay protection.
WHY = Guarantee Production Final Execution Layer refuses self-issued Veritas, compromised signing custody, and replay handoffs.
WHO = Creator (The Creator <leonardlee6@outlook.com>) / LeeWay Production & Final Execution Layer.
WHERE = tests/production-release-gate.test.mjs
WHEN = 2026-11-12
HOW = Node 24 built-in test runner against mkdtemp SQLite WAL storage.
LICENSE: MIT
*/

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { CONSTITUTION_SCHEMA_AUTHORITY } from '../scripts/enforce-sovereign-colony-constitution.mjs';
import { evaluateProductionPromotion, openPromotionAuditWalStore } from '../src/production-release-gate.mjs';

const sha = (v) => createHash('sha256').update(v, 'utf8').digest('hex');

function makeValidHandoff(overrides = {}) {
  return {
    action: 'PROMOTE_PRODUCTION',
    sourceRepository: '4citeB4U/LEEWAY-DEVICE-BRIDGE',
    sourceCommitSha: 'a'.repeat(40),
    distributesPublicBinary: true,
    candidateEvidenceReceiptSha256: sha('CANDIDATE-1'),
    veritas: {
      qualified: true,
      issuedBySelf: false,
      authority: '4citeB4U/LEEWAY-VERITAS',
      veritasReceiptSha256: sha('VERITAS-QUALIFIED-1')
    },
    receiptAuthority: {
      admitted: true,
      canonicalReceiptSha256: sha('CANONICAL-RECEIPT-1')
    },
    learningLedger: {
      enforceOrderedLearning: true
    },
    osTrust: {
      externalKeystoreCustody: true,
      noEmbeddedPlaintextSecrets: true,
      securityHoldReleased: true,
      platformTrustStatus: 'CLEARED'
    },
    constitutionEnvelope: {
      schemaAuthority: CONSTITUTION_SCHEMA_AUTHORITY,
      citizen: {
        citizenId: 'CTZ-PROD-GATE-01',
        genesisSeedHash: sha('GENESIS-01'),
        caste: 'ALPHA',
        homeNodeId: 'pc-primary',
        persistenceMode: 'DURABLE_SQLITE_WAL'
      },
      colony: {
        activeWorkers: 1,
        singleSurvivorRegenSupported: true,
        creatorSafeModeBypassPreserved: true
      },
      ouroboros: {
        lane: 'SLOW_LANE',
        phoenixRollbackCeilingMs: 5000
      },
      learning: {
        enforceOrderedLearning: true,
        veritasQualified: true
      },
      foundationFreeze: {
        singleSchemaSource: true,
        noZeroWipeForProtectedDeviceBrain: true,
        receiptStage: 'QUALIFIED_CANONICAL_RECEIPT',
        candidateReceiptVerifiedByVeritas: true
      },
      provability: {
        lawZeroEvidenceLock: true,
        requireEmpiricalReceipt: true
      }
    },
    ...overrides
  };
}

test('PROMOTE_PRODUCTION blocks unverified Veritas, self-issued Veritas, OS security holds, and missing OS clearance', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'leeway-prod-gate-neg-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const dbPath = path.join(dir, 'prod.sqlite');

  const noVeritas = await evaluateProductionPromotion(
    makeValidHandoff({ veritas: { qualified: false, veritasReceiptSha256: '' } }),
    { dbPath }
  );
  assert.equal(noVeritas.promoted, false);
  assert.ok(noVeritas.blockers.includes('INDEPENDENT_VERITAS_QUALIFICATION_REQUIRED'));

  const selfVeritas = await evaluateProductionPromotion(
    makeValidHandoff({
      veritas: {
        qualified: true,
        issuedBySelf: true,
        authority: 'LeeWay-Production-Final-Execution-Layer',
        veritasReceiptSha256: sha('SELF')
      }
    }),
    { dbPath }
  );
  assert.equal(selfVeritas.promoted, false);
  assert.ok(selfVeritas.blockers.includes('SELF_ISSUED_VERITAS_FORBIDDEN'));

  const holdBinary = await evaluateProductionPromotion(
    makeValidHandoff({
      osTrust: {
        externalKeystoreCustody: false,
        noEmbeddedPlaintextSecrets: true,
        securityHoldReleased: false,
        platformTrustStatus: 'HOLD'
      }
    }),
    { dbPath }
  );
  assert.equal(holdBinary.promoted, false);
  assert.ok(holdBinary.blockers.includes('OS_TRUST_EXTERNAL_KEYSTORE_CUSTODY_REQUIRED'));
  assert.ok(holdBinary.blockers.includes('OS_TRUST_PLATFORM_CLEARANCE_REQUIRED_HOLD_ACTIVE'));
});

test('qualified fixture readback stages a handoff once; it does not deploy', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'leeway-prod-gate-wal-'));
  let inspectStore;
  t.after(() => {
    try { inspectStore?.close(); } catch {}
    fs.rmSync(dir, { recursive: true, force: true });
  });
  const dbPath = path.join(dir, 'prod-wal.sqlite');

  const handoff = makeValidHandoff();

  // Self-declared qualified booleans and plausible digests must not confer
  // production admission without the ORIGINAL independent provider.
  const unbound = await evaluateProductionPromotion(handoff, { dbPath });
  assert.equal(unbound.promoted, false);
  assert.equal(unbound.handoffAccepted, false);
  assert.ok(unbound.blockers.includes('ORIGINAL_AUTHORITY_READBACK_PROVIDER_UNBOUND'));

  const forged = await evaluateProductionPromotion(handoff, { dbPath, admissionProvider: {
    verifyOriginalCustody: async () => ({
      originalVeritasReadbackVerified: true, originalReceiptAuthorityReadbackVerified: true,
      creatorReleaseGrantVerified: true, sourceCommitSha: 'f'.repeat(40),
      veritasReceiptSha256: handoff.veritas.veritasReceiptSha256,
      canonicalReceiptSha256: handoff.receiptAuthority.canonicalReceiptSha256
    })
  } });
  assert.equal(forged.promoted, false);
  assert.ok(forged.blockers.includes('ORIGINAL_AUTHORITY_READBACK_UNQUALIFIED'));

  // This TEST fixture represents a trusted host provider *interface* only;
  // it is not an independent Veritas, owner grant or deployed Runtime.
  const admissionProvider = {
    verifyOriginalCustody: async (expected) => ({
      originalVeritasReadbackVerified: true,
      originalReceiptAuthorityReadbackVerified: true,
      creatorReleaseGrantVerified: true,
      sourceCommitSha: expected.sourceCommitSha,
      veritasReceiptSha256: expected.veritasReceiptSha256,
      canonicalReceiptSha256: expected.canonicalReceiptSha256
    })
  };
  const admitted = await evaluateProductionPromotion(handoff, { dbPath, admissionProvider });
  assert.equal(admitted.promoted, false);
  assert.equal(admitted.handoffAccepted, true);
  assert.equal(admitted.status, 'READY_FOR_PRODUCTION_FABRIC_REVIEW');

  // Reopen WAL store to verify persistent handoff custody and replay block.
  const replay = await evaluateProductionPromotion(handoff, { dbPath, admissionProvider });
  assert.equal(replay.promoted, false);
  assert.ok(replay.blockers.includes('PROMOTION_HANDOFF_REPLAY_REJECTED'));

  inspectStore = openPromotionAuditWalStore(dbPath);
  const persisted = inspectStore.getDecision(admitted.promotionKey);
  assert.equal(persisted.promotion_key, admitted.promotionKey);
  assert.equal(persisted.status, 'READY_FOR_PRODUCTION_FABRIC_REVIEW');
});
