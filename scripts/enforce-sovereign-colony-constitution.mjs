/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.PRODUCTION.GOVERNANCE
TAG: LEEWAY.PRODUCTION.SOVEREIGN_CONSTITUTION_ENFORCER.V1
DISCOVERY_PIPELINE: Voice → Intent → Location → Vertical → Ranking → Render
5WH:
WHAT = Production Final Execution Layer adapter referencing LeeWay Sovereign Colony Constitution (Parts 1-6) without duplicating schemas.
WHY = Ensure deployment/promotion handoffs cannot bypass Constitutional law, Two-Stage Receipt Ordering, or OS signing custody rules.
WHO = Creator (The Creator <leonardlee6@outlook.com>) / LeeWay Production & Final Execution Layer.
WHERE = scripts/enforce-sovereign-colony-constitution.mjs
WHEN = 2026-11-12
HOW = Pure zero-dependency ESM validation aligned to 4citeB4U/LeeWay-Standards/contracts/LEEWAY-SOVEREIGN-COLONY-CONSTITUTION.v1.json.
LICENSE: MIT
*/

export const CONSTITUTION_SCHEMA_AUTHORITY =
  '4citeB4U/LeeWay-Standards@contracts/LEEWAY-SOVEREIGN-COLONY-CONSTITUTION.v1.json';

export const SOVEREIGN_CONSTITUTION_CONTRACT_IDS = Object.freeze({
  part1: 'CONTRACT-CTZ-008',
  part2: 'CONTRACT-ANT-007',
  part3: 'CONTRACT-OR-006',
  part4: 'CONTRACT-LG-009',
  part5: 'CONTRACT-FF-010',
  part6: 'CONTRACT-PRV-011'
});

const SHA256_RE = /^[a-f0-9]{64}$/;
const VOLATILE_STORAGE_RE = /(IN_MEMORY|RAM_ONLY|EPHEMERAL_MAP|VOLATILE_SET)/i;
const CORP_BAN_RE = /\b(As an AI|As an artificial intelligence|I apologize for the inconvenience|I cannot guarantee|let's unpack|delve into|it is important to note that)\b/i;

export function enforceSovereignConstitution(envelope = {}, {
  requireAllParts = true,
  allowedSchemaAuthority = CONSTITUTION_SCHEMA_AUTHORITY
} = {}) {
  const errors = [];
  if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) {
    return {
      admitted: false,
      status: 'BLOCKED',
      contractAuthority: allowedSchemaAuthority,
      errors: ['CONSTITUTION_ENVELOPE_REQUIRED']
    };
  }

  if (envelope.schemaAuthority !== allowedSchemaAuthority) {
    errors.push(`RIVAL_SCHEMA_AUTHORITY_REJECTED:${envelope.schemaAuthority || 'MISSING'}`);
  }
  if (envelope.duplicateJsonSchemaPath &&
      !String(envelope.duplicateJsonSchemaPath).includes('LeeWay-Standards')) {
    errors.push(`FF010_DUPLICATE_SCHEMA_FORBIDDEN:${envelope.duplicateJsonSchemaPath}`);
  }

  const citizen = envelope.citizen;
  if (citizen || requireAllParts) {
    if (!citizen || typeof citizen.citizenId !== 'string' || !citizen.citizenId.trim()) {
      errors.push('CTZ008_CITIZEN_ID_REQUIRED');
    }
    if (!citizen || !SHA256_RE.test(String(citizen.genesisSeedHash || ''))) {
      errors.push('CTZ008_GENESIS_SEED_HASH_INVALID');
    }
    if (!citizen || !['ALPHA', 'BETA', 'GAMMA'].includes(String(citizen.caste || ''))) {
      errors.push('CTZ008_CASTE_INVALID');
    }
    if (!citizen || typeof citizen.homeNodeId !== 'string' || !citizen.homeNodeId.trim()) {
      errors.push('CTZ008_HOME_NODE_REQUIRED');
    }
    if (!citizen || citizen.persistenceMode !== 'DURABLE_SQLITE_WAL' ||
        VOLATILE_STORAGE_RE.test(String(citizen.persistenceMode || ''))) {
      errors.push('CTZ008_DURABLE_SQLITE_WAL_REQUIRED');
    }
  }

  const colony = envelope.colony;
  if (colony || requireAllParts) {
    const active = Number(colony?.activeWorkers ?? 0);
    if (!Number.isFinite(active) || active < 1) errors.push('ANT007_MIN_ONE_WORKER_REQUIRED');
    if (colony?.singleSurvivorRegenSupported !== true) errors.push('ANT007_SINGLE_SURVIVOR_REGEN_REQUIRED');
    if (colony?.creatorSafeModeBypassPreserved !== true) errors.push('ANT007_CREATOR_SAFEMODE_BYPASS_REQUIRED');
  }

  const ouroboros = envelope.ouroboros;
  if (ouroboros || requireAllParts) {
    if (!['FAST_LANE', 'SLOW_LANE'].includes(String(ouroboros?.lane || ''))) {
      errors.push('OR006_LANE_INVALID');
    }
    if (ouroboros?.lane === 'FAST_LANE') {
      const budgetMs = Number(ouroboros.latencyBudgetMs);
      if (!Number.isFinite(budgetMs) || budgetMs <= 0 || budgetMs > 500) {
        errors.push('OR006_FAST_LANE_BUDGET_EXCEEDS_500MS');
      }
      if (ouroboros.synchronousSlowHooksAttached === true) {
        errors.push('OR006_SYNCHRONOUS_SLOW_HOOKS_FORBIDDEN_ON_FAST_LANE');
      }
    }
    const phoenixMs = Number(ouroboros?.phoenixRollbackCeilingMs);
    if (!Number.isFinite(phoenixMs) || phoenixMs <= 0 || phoenixMs > 10000) {
      errors.push('OR006_PHOENIX_ROLLBACK_EXCEEDS_10000MS');
    }
  }

  const learning = envelope.learning;
  if (learning || requireAllParts) {
    if (learning?.enforceOrderedLearning !== true) {
      errors.push('LG009_ORDERED_LEARNING_ENFORCEMENT_REQUIRED');
    }
    if (learning?.veritasQualified !== true) {
      errors.push('LG009_VERITAS_QUALIFICATION_REQUIRED_FOR_CANONICAL');
    }
  }

  const freeze = envelope.foundationFreeze;
  if (freeze || requireAllParts) {
    if (freeze?.singleSchemaSource !== true) errors.push('FF010_SINGLE_SCHEMA_SOURCE_REQUIRED');
    if (freeze?.noZeroWipeForProtectedDeviceBrain !== true) {
      errors.push('FF010_NO_ZERO_WIPE_PROTECTION_REQUIRED');
    }
    if (freeze?.receiptStage !== 'QUALIFIED_CANONICAL_RECEIPT' ||
        freeze?.candidateReceiptVerifiedByVeritas !== true) {
      errors.push('FF010_CANDIDATE_MUST_PASS_VERITAS_BEFORE_CANONICAL');
    }
  }

  const provability = envelope.provability;
  if (provability || requireAllParts) {
    if (provability?.lawZeroEvidenceLock !== true) errors.push('PRV011_LAW_ZERO_EVIDENCE_LOCK_REQUIRED');
    if (provability?.requireEmpiricalReceipt !== true) errors.push('PRV011_EMPIRICAL_RECEIPT_REQUIRED');
    if (typeof provability?.outputSample === 'string' && CORP_BAN_RE.test(provability.outputSample)) {
      errors.push('PRV011_CORPORATE_BAN_PATTERN_DETECTED');
    }
  }

  return {
    admitted: errors.length === 0,
    status: errors.length === 0 ? 'PASS' : 'BLOCKED',
    contractAuthority: allowedSchemaAuthority,
    contractsChecked: Object.values(SOVEREIGN_CONSTITUTION_CONTRACT_IDS),
    errors
  };
}
