/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.PRODUCTION.GOVERNED_HANDOFF.TEST
TAG: LEEWAY.PRODUCTION.REVIEW_INTAKE_NEGATIVE_TEST_V1
5WH:
WHAT = Exercise positive/negative source packet governance boundaries.
WHY = An LLM's or CI's success claim must never become permission to deploy.
WHO = Production source maintainer.
WHERE = test/governed-handoff-preflight.test.mjs.
WHEN = 2026-11-11.
HOW = Deterministic fabricated fixtures only, not independent authority execution.
LICENSE: Not asserted; repository license pending owner decision.
*/
import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectReleaseHandoff} from '../src/governed-handoff-preflight.mjs';
const H='a'.repeat(64),SOURCE='b'.repeat(40);
const roles=[['STANDARDS','standards'],['RUNTIME','runtime-fabric'],['FORMULA','formula'],['VERITAS_PRE','veritas'],['SOURCE_EVIDENCE','runtime-fabric'],['RECEIPT','receipt-authority'],['LEARNING','learning-ledger'],['RELEASE_AUTHORIZATION','production-final']];
const packet=()=>({schema:'leeway.production.release-handoff.v1',workId:'mission-1',
  source:{repository:'4citeB4U/ExampleProduct',commit:SOURCE,artifactSha256:H},
  target:{id:'target-1',rollbackPlanSha256:H},
  agent:{registered:true,id:'agent-1',directModelExecution:false},api:{governed:true},files:{governed:true},
  correlation:{workId:'mission-1',sourceCommit:SOURCE,requestId:'req-1'},
  proofs:roles.map(([stage,issuer])=>({stage,issuer,workId:'mission-1',sourceCommit:SOURCE,evidenceSha256:H})),
  release:{claimedAuthorized:false,deployed:false,approvalFromCi:false}});
test('complete source packet is REVIEW candidate, never deployment permission',()=>{
 const r=inspectReleaseHandoff(packet());
 assert.equal(r.state,'REVIEW_INTAKE_CANDIDATE');
 assert.equal(r.productionAuthorized,false);
 assert.equal(r.deployExecuted,false);
 assert.equal(r.receiptAppended,false);
 assert.equal(r.independentVeritasVerified,false);
});
test('missing governance stage does not erase original work',()=>{const p=packet();p.proofs.pop();const r=inspectReleaseHandoff(p);assert.equal(r.state,'PREPARATION_ONLY');assert.deepEqual(r.missing,['RELEASE_AUTHORIZATION'])});
test('unregistered model tool held',()=>{const p=packet();p.agent.registered=false;assert.equal(inspectReleaseHandoff(p).state,'HOLD_SECURITY')});
test('ungoverned API denied',()=>{const p=packet();p.api.governed=false;assert.equal(inspectReleaseHandoff(p).state,'HOLD_SECURITY')});
test('ungoverned file denied',()=>{const p=packet();p.files.governed=false;assert.equal(inspectReleaseHandoff(p).state,'HOLD_SECURITY')});
test('cross-mission Veritas proof denied',()=>{const p=packet();p.proofs[3].workId='other';assert.equal(inspectReleaseHandoff(p).state,'HOLD_SECURITY')});
test('fake independent review denied',()=>{const p=packet();p.proofs[3].independentReviewSelfCertified=true;assert.equal(inspectReleaseHandoff(p).state,'HOLD_SECURITY')});
test('duplicate receipt stage denied',()=>{const p=packet();p.proofs.push({...p.proofs[5]});assert.equal(inspectReleaseHandoff(p).state,'HOLD_SECURITY')});
test('unknown authority stage denied',()=>{const p=packet();p.proofs.push({...p.proofs[5],stage:'MODEL_APPROVAL'});assert.equal(inspectReleaseHandoff(p).state,'HOLD_SECURITY')});
test('source drift denied',()=>{const p=packet();p.correlation.sourceCommit='c'.repeat(40);assert.equal(inspectReleaseHandoff(p).state,'PREPARATION_ONLY')});
test('CI cannot authorize release',()=>{const p=packet();p.release.approvalFromCi=true;assert.equal(inspectReleaseHandoff(p).state,'HOLD_SECURITY')});
test('invalid source artifact digest blocked',()=>{const p=packet();p.source.artifactSha256='bad';assert.equal(inspectReleaseHandoff(p).state,'PREPARATION_ONLY')});

const devicePacket=()=>{
 const p=packet();
 p.source.repository='4citeB4U/Leeway-Digital-Brain-Diagnostincs-pkg';
 p.deviceProduct={family:'digital-brain',attachment:'DESTINATION_DEVICE_EXCLUSIVE',
  destinationDeviceId:p.target.id,nativeEnrollment:'PENDING_NATIVE_DEVICE_ATTESTATION',
  nativePathsResidence:'DESTINATION_DEVICE_ONLY',crossDeviceIndexReuse:false,
  offDeviceExportDefault:false,osAndHumanConsent:'REQUIRED_INDEPENDENTLY',sourceOnly:true};
 return p;
};
test('device-exclusive Brain release may enter source review, never execution',()=>{
 const r=inspectReleaseHandoff(devicePacket());
 assert.equal(r.state,'REVIEW_INTAKE_CANDIDATE');
 assert.equal(r.productionAuthorized,false);
});
test('device-exclusive diagnostics source must name its specific destination',()=>{
 const p=devicePacket();p.deviceProduct.family='diagnostics';
 p.deviceProduct.destinationDeviceId='other-device';
 assert.equal(inspectReleaseHandoff(p).reason,'DEVICE_EXCLUSIVE_DESTINATION_BOUNDARY_INVALID');
});
test('device Brain cannot copy another machine index',()=>{
 const p=devicePacket();p.deviceProduct.crossDeviceIndexReuse=true;
 assert.equal(inspectReleaseHandoff(p).state,'HOLD_SECURITY');
});
test('claimed native attestation and complete file index are forbidden in source candidate',()=>{
 for(const field of ['verifiedNativeIdentity','claimsPhysicalIndexComplete']){
  const p=devicePacket();p.deviceProduct[field]=true;
  assert.equal(inspectReleaseHandoff(p).reason,'DEVICE_EXCLUSIVE_NATIVE_AUTHORITY_FORGED');
 }
});
test('private native paths cannot be embedded in public release packet',()=>{
 const p=devicePacket();p.deviceProduct.localPathsIncludedInPublicPacket=true;
 assert.equal(inspectReleaseHandoff(p).state,'HOLD_SECURITY');
});
test('hardware-agnostic products cannot claim device-exclusive ownership',()=>{
 const p=packet();p.deviceProduct={attachment:'DESTINATION_DEVICE_EXCLUSIVE'};
 assert.equal(inspectReleaseHandoff(p).reason,'NON_DEVICE_SOURCE_CANNOT_CLAIM_EXCLUSIVE_PRODUCT');
});
