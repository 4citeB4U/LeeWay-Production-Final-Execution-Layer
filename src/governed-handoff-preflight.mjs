/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.PRODUCTION.GOVERNED_HANDOFF
TAG: LEEWAY.PRODUCTION.REVIEW_INTAKE_PREFLIGHT_V1
5WH:
WHAT = Source-only fail-closed review-intake preflight for a governed LeeWay marketable product.
WHY = Never let an ungoverned file, API, model, agent or orphaned CI result auto-promote to a deployment.
WHO = Production & Final Execution Layer, under Runtime and Standards authority.
WHERE = src/governed-handoff-preflight.mjs.
WHEN = 2026-11-11; Creator device-exclusive amendment and source intake review.
HOW = Schema, source identity, device-exclusive destination, stage proof and negative regression; no credential/deployment calls.
LICENSE: Not asserted; repository license pending explicit owner decision.
AUTHORITY: PREPARATION/REVIEW INTAKE ONLY. Not Veritas, Receipt writer, or deployment authorization.
*/
const ID=/^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;
const REPO=/^4citeB4U\/[A-Za-z0-9._-]{2,120}$/;
const SHA1=/^[0-9a-f]{40}$/;
const SHA256=/^[0-9a-f]{64}$/;
const PROOFS=Object.freeze([
 ['STANDARDS','standards'],
 ['RUNTIME','runtime-fabric'],
 ['FORMULA','formula'],
 ['VERITAS_PRE','veritas'],
 ['SOURCE_EVIDENCE','runtime-fabric'],
 ['RECEIPT','receipt-authority'],
 ['LEARNING','learning-ledger'],
 ['RELEASE_AUTHORIZATION','production-final']
]);
const result=(state,reason,extra={})=>Object.freeze({
 schema:'leeway.production.review-intake-result.v1',state,reason,
 productionAuthorized:false,deployExecuted:false,independentVeritasVerified:false,
 receiptAppended:false,learningAdmitted:false,...extra});
/**
 * A GitHub commit or source test does not confer runtime authority.
 * The only successful state here is REVIEW_INTAKE_CANDIDATE, never DEPLOYMENT_AUTHORIZED.
 * The real host must authenticate every role and run genuine release gates separately.
 */
export function inspectReleaseHandoff(packet){
 if(!packet||typeof packet!=='object'||Array.isArray(packet)||
    packet.schema!=='leeway.production.release-handoff.v1')
  return result('PREPARATION_ONLY','HANDOFF_SCHEMA_INVALID');
 if(!ID.test(packet.workId||'')||!REPO.test(packet.source?.repository||'')||
    !SHA1.test(packet.source?.commit||'')||!SHA256.test(packet.source?.artifactSha256||''))
  return result('PREPARATION_ONLY','ORIGINAL_SOURCE_IDENTITY_INVALID');
 if(!ID.test(packet.target?.id||'')||!SHA256.test(packet.target?.rollbackPlanSha256||''))
  return result('PREPARATION_ONLY','TARGET_OR_ROLLBACK_UNQUALIFIED');

 const deviceOnlySource=packet.source.repository==='4citeB4U/Leeway-Digital-Brain-Diagnostincs-pkg';
 if(deviceOnlySource){
   const product=packet.deviceProduct;
   if(!product||!['digital-brain','diagnostics','combined-device-package'].includes(product.family)||
      product.attachment!=='DESTINATION_DEVICE_EXCLUSIVE'||
      product.destinationDeviceId!==packet.target.id||
      product.nativeEnrollment!=='PENDING_NATIVE_DEVICE_ATTESTATION'||
      product.nativePathsResidence!=='DESTINATION_DEVICE_ONLY'||
      product.crossDeviceIndexReuse!==false||
      product.offDeviceExportDefault!==false||
      product.osAndHumanConsent!=='REQUIRED_INDEPENDENTLY'||
      product.sourceOnly!==true)
     return result('HOLD_SECURITY','DEVICE_EXCLUSIVE_DESTINATION_BOUNDARY_INVALID');
   if(product.verifiedNativeIdentity===true||product.claimsPhysicalIndexComplete===true||
      product.localPathsIncludedInPublicPacket===true||
      product.humanConsentBypassed===true)
     return result('HOLD_SECURITY','DEVICE_EXCLUSIVE_NATIVE_AUTHORITY_FORGED');
 }else if(packet.deviceProduct?.attachment==='DESTINATION_DEVICE_EXCLUSIVE')
   return result('HOLD_SECURITY','NON_DEVICE_SOURCE_CANNOT_CLAIM_EXCLUSIVE_PRODUCT');

 if(packet.agent?.registered!==true||!ID.test(packet.agent?.id||'')||
    packet.agent?.directModelExecution===true||packet.api?.governed!==true||
    packet.files?.governed!==true||packet.agent?.bypassedGovernance===true)
  return result('HOLD_SECURITY','UNREGISTERED_OR_UNGOVERNED_ACTOR_API_FILE');
 if(packet.workId!==packet.correlation?.workId||
    packet.source.commit!==packet.correlation?.sourceCommit||
    !ID.test(packet.correlation?.requestId||''))
  return result('PREPARATION_ONLY','ORIGINAL_MISSION_CORRELATION_INVALID');
 if(!Array.isArray(packet.proofs))return result('PREPARATION_ONLY','PROOF_CHAIN_MISSING');
 const observed=new Map();
 for(const claim of packet.proofs){
  if(!claim||typeof claim!=='object'||Array.isArray(claim)||
     !PROOFS.some(([k])=>k===claim.stage)||observed.has(claim.stage))
   return result('HOLD_SECURITY','DUPLICATE_OR_UNKNOWN_AUTHORITY_STAGE');
  const expected=PROOFS.find(([k])=>k===claim.stage)[1];
  if(claim.issuer!==expected||claim.workId!==packet.workId||
     claim.sourceCommit!==packet.source.commit||!SHA256.test(claim.evidenceSha256||'')||
     claim.verifiedByModel===true||claim.independentReviewSelfCertified===true)
   return result('HOLD_SECURITY','FORGED_OR_CROSS_MISSION_EVIDENCE');
  observed.set(claim.stage,claim);
 }
 const missing=PROOFS.map(([k])=>k).filter(k=>!observed.has(k));
 if(missing.length)return result('PREPARATION_ONLY','REQUIRED_HANDOFF_EVIDENCE_MISSING',{missing});
 if(packet.release?.claimedAuthorized===true||packet.release?.deployed===true||
    packet.release?.approvalFromCi===true)
  return result('HOLD_SECURITY','SELF_PROMOTED_RELEASE_CLAIM');
 return result('REVIEW_INTAKE_CANDIDATE','SOURCE_PACKET_SHAPE_COMPLETE_AUTHORITY_UNVERIFIED',{
  workId:packet.workId,sourceCommit:packet.source.commit,
  nextAuthority:'independent-veritas-and-runtime-release-custodians',
  dataClassification:'SOURCE_REFERENCES_ONLY',sourceTestClaimPresent:true});
}
