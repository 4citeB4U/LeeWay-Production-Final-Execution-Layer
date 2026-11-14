/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.PRODUCTION.RELEASE_GATE
TAG: LEEWAY.PRODUCTION.FINAL_EXECUTION_RELEASE_GATE.V1
DISCOVERY_PIPELINE: Voice → Intent → Location → Vertical → Ranking → Render
5WH:
WHAT = Fail-closed PROMOTE_PRODUCTION release gate requiring external Veritas qualification, Two-Stage Receipt Ordering, Sovereign Constitution compliance, OS Trust signing/malware clearance, and durable SQLite WAL decision custody.
WHY = Prevent CI green or unsigned/unverified binaries from being promoted to production without independent Veritas and OS Trust custody.
WHO = Creator (The Creator <leonardlee6@outlook.com>) / LeeWay Production & Final Execution Layer.
WHERE = src/production-release-gate.mjs
WHEN = 2026-11-12
HOW = Pure verifier delegating schema truth to LeeWay-Standards, Veritas truth to LEEWAY-VERITAS, and persisting promotion keys in SQLite WAL.
LICENSE: MIT
*/

import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { enforceSovereignConstitution } from '../scripts/enforce-sovereign-colony-constitution.mjs';

const SHA256_RE = /^[a-f0-9]{64}$/;
export const PRODUCTION_GATE_PERSISTENCE_MODE = 'DURABLE_SQLITE_WAL';

export function openPromotionAuditWalStore(dbPath) {
  if (typeof dbPath !== 'string' || !dbPath.trim()) {
    throw new Error('PRODUCTION_WAL_DB_PATH_REQUIRED');
  }
  const resolved = path.resolve(dbPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  const db = new DatabaseSync(resolved);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS promotion_decisions (
      promotion_key TEXT PRIMARY KEY,
      source_repo TEXT NOT NULL,
      source_commit TEXT NOT NULL,
      veritas_receipt_sha256 TEXT NOT NULL,
      status TEXT NOT NULL,
      decided_at TEXT NOT NULL
    );
  `);

  const findStmt = db.prepare('SELECT promotion_key FROM promotion_decisions WHERE promotion_key = ?');
  const insertStmt = db.prepare(`
    INSERT INTO promotion_decisions (
      promotion_key, source_repo, source_commit, veritas_receipt_sha256, status, decided_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  return {
    dbPath: resolved,
    persistenceMode: PRODUCTION_GATE_PERSISTENCE_MODE,

    reservePromotion({ promotionKey, sourceRepo, sourceCommit, veritasReceiptSha256, status }) {
      if (findStmt.get(String(promotionKey))) {
        return { reserved: false, reason: 'PROMOTION_HANDOFF_REPLAY_REJECTED' };
      }
      insertStmt.run(
        String(promotionKey),
        String(sourceRepo),
        String(sourceCommit),
        String(veritasReceiptSha256),
        String(status),
        new Date().toISOString()
      );
      return { reserved: true };
    },

    getDecision(promotionKey) {
      return findStmt.get(String(promotionKey)) || null;
    },

    close() {
      db.close();
    }
  };
}

export async function evaluateProductionPromotion(handoff = {}, { walStore, dbPath, admissionProvider } = {}) {
  const blockers = [];

  if (!handoff || typeof handoff !== 'object' || Array.isArray(handoff)) {
    return { promoted: false, status: 'HOLD_FOR_CANONICAL_ADMISSION', blockers: ['HANDOFF_PACKET_REQUIRED'] };
  }

  if (handoff.action !== 'PROMOTE_PRODUCTION') {
    blockers.push(`UNSUPPORTED_PROMOTION_ACTION:${handoff.action || 'MISSING'}`);
  }

  if (typeof handoff.sourceRepository !== 'string' || !handoff.sourceRepository.trim()) {
    blockers.push('SOURCE_REPOSITORY_REQUIRED');
  }
  if (!/^[a-f0-9]{40}$/i.test(String(handoff.sourceCommitSha || ''))) {
    blockers.push('IMMUTABLE_40_CHAR_SOURCE_SHA_REQUIRED');
  }

  // 1. Must not self-issue Veritas
  if (handoff.veritas?.issuedBySelf === true ||
      handoff.veritas?.authority === 'LeeWay-Production-Final-Execution-Layer') {
    blockers.push('SELF_ISSUED_VERITAS_FORBIDDEN');
  }
  if (handoff.veritas?.qualified !== true ||
      !SHA256_RE.test(String(handoff.veritas?.veritasReceiptSha256 || ''))) {
    blockers.push('INDEPENDENT_VERITAS_QUALIFICATION_REQUIRED');
  }

  // 2. Two-Stage Receipt Ordering (CANDIDATE -> VERITAS -> QUALIFIED_CANONICAL)
  if (!SHA256_RE.test(String(handoff.candidateEvidenceReceiptSha256 || ''))) {
    blockers.push('CANDIDATE_EVIDENCE_RECEIPT_SHA256_REQUIRED');
  }
  if (handoff.receiptAuthority?.admitted !== true ||
      !SHA256_RE.test(String(handoff.receiptAuthority?.canonicalReceiptSha256 || ''))) {
    blockers.push('CANONICAL_RECEIPT_AUTHORITY_REQUIRED');
  }
  if (handoff.learningLedger?.enforceOrderedLearning !== true) {
    blockers.push('LG009_ORDERED_LEARNING_REQUIRED');
  }

  // 3. Sovereign Colony Constitution alignment
  const constCheck = enforceSovereignConstitution(handoff.constitutionEnvelope, { requireAllParts: true });
  if (!constCheck.admitted) {
    blockers.push(...constCheck.errors);
  }

  // 4. OS Trust & Signing Custody (SmartScreen / Play Protect / External Keystore)
  const osTrust = handoff.osTrust || {};
  if (handoff.distributesPublicBinary === true) {
    if (osTrust.externalKeystoreCustody !== true) {
      blockers.push('OS_TRUST_EXTERNAL_KEYSTORE_CUSTODY_REQUIRED');
    }
    if (osTrust.noEmbeddedPlaintextSecrets !== true) {
      blockers.push('OS_TRUST_EMBEDDED_SECRETS_FORBIDDEN');
    }
    if (osTrust.securityHoldReleased !== true || osTrust.platformTrustStatus !== 'CLEARED') {
      blockers.push('OS_TRUST_PLATFORM_CLEARANCE_REQUIRED_HOLD_ACTIVE');
    }
  }

  if (blockers.length > 0) {
    return {
      promoted: false,
      status: 'HOLD_FOR_CANONICAL_ADMISSION',
      persistenceMode: PRODUCTION_GATE_PERSISTENCE_MODE,
      blockers
    };
  }

  // The handoff contains self-asserted booleans and digest-shaped strings. They
  // are not a Veritas signature, Receipt Authority readback, or creator grant.
  // Only a provider injected by the owner-controlled Runtime may perform the
  // original authority lookups. Missing/failed provider cannot authorize release.
  if (typeof admissionProvider?.verifyOriginalCustody !== 'function') {
    return {
      promoted: false,
      handoffAccepted: false,
      status: 'HOLD_FOR_CANONICAL_ADMISSION',
      persistenceMode: PRODUCTION_GATE_PERSISTENCE_MODE,
      blockers: ['ORIGINAL_AUTHORITY_READBACK_PROVIDER_UNBOUND']
    };
  }
  let admitted;
  try {
    admitted = await admissionProvider.verifyOriginalCustody({
      sourceRepository: handoff.sourceRepository,
      sourceCommitSha: handoff.sourceCommitSha,
      veritasReceiptSha256: handoff.veritas.veritasReceiptSha256,
      canonicalReceiptSha256: handoff.receiptAuthority.canonicalReceiptSha256,
      candidateEvidenceReceiptSha256: handoff.candidateEvidenceReceiptSha256
    });
  } catch {
    admitted = null;
  }
  if (admitted?.originalVeritasReadbackVerified !== true ||
      admitted?.originalReceiptAuthorityReadbackVerified !== true ||
      admitted?.creatorReleaseGrantVerified !== true ||
      admitted?.sourceCommitSha !== handoff.sourceCommitSha ||
      admitted?.veritasReceiptSha256 !== handoff.veritas.veritasReceiptSha256 ||
      admitted?.canonicalReceiptSha256 !== handoff.receiptAuthority.canonicalReceiptSha256) {
    return {
      promoted: false,
      handoffAccepted: false,
      status: 'HOLD_FOR_CANONICAL_ADMISSION',
      persistenceMode: PRODUCTION_GATE_PERSISTENCE_MODE,
      blockers: ['ORIGINAL_AUTHORITY_READBACK_UNQUALIFIED']
    };
  }

  // This is a *handoff acceptance gate*. Even genuine readback is not OS
  // installation or post-deployment observation. The original Production Fabric
  // owns the distinct, owner-controlled DEPLOYMENT_AUTHORIZED/DEPLOYED_VERIFIED steps.
  const promotionKey = createHash('sha256')
    .update(JSON.stringify({
      sourceRepository: handoff.sourceRepository,
      sourceCommitSha: handoff.sourceCommitSha,
      veritasReceiptSha256: handoff.veritas.veritasReceiptSha256,
      canonicalReceiptSha256: handoff.receiptAuthority.canonicalReceiptSha256
    }), 'utf8')
    .digest('hex');

  const ownStore = !walStore;
  const store = walStore || openPromotionAuditWalStore(dbPath);
  try {
    const reserved = store.reservePromotion({
      promotionKey,
      sourceRepo: handoff.sourceRepository,
      sourceCommit: handoff.sourceCommitSha,
      veritasReceiptSha256: handoff.veritas.veritasReceiptSha256,
      status: 'READY_FOR_PRODUCTION_FABRIC_REVIEW'
    });
    if (!reserved.reserved) {
      return {
        promoted: false,
        status: 'HOLD_FOR_CANONICAL_ADMISSION',
        blockers: [reserved.reason]
      };
    }

    return {
      promoted: false,
      handoffAccepted: true,
      status: 'READY_FOR_PRODUCTION_FABRIC_REVIEW',
      promotionKey,
      persistenceMode: PRODUCTION_GATE_PERSISTENCE_MODE,
      sourceRepository: handoff.sourceRepository,
      sourceCommitSha: handoff.sourceCommitSha,
      blockers: []
    };
  } finally {
    if (ownStore) store.close();
  }
}
