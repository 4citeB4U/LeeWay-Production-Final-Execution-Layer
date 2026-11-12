/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.PRODUCTION.SOURCE_EVIDENCE
TAG: LEEWAY.PRODUCTION.SOURCE_CI_CAPTURE_V1
5WH:
WHAT = Record all source-test outcomes with original GitHub run and content hashes.
WHY = A passing or failing test must not be abandoned without custody references.
WHO = LeeWay Production source CI; not canonical Receipt Authority.
WHERE = scripts/capture-source-evidence.mjs.
WHEN = Each governed PR source run.
HOW = Spawn native test process, SHA-256 stdout/stderr and write sanitized candidate artifact.
LICENSE: Not asserted; repository license pending owner decision.
*/
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const sha=x=>createHash('sha256').update(x).digest('hex');
const digest=createHash('sha256'),errDigest=createHash('sha256');
let output='',byteCount=0,errBytes=0;
const child=spawn(process.execPath,['--test'],{stdio:['ignore','pipe','pipe']});
child.stdout.on('data',buf=>{digest.update(buf);byteCount+=buf.length;process.stdout.write(buf);output=(output+buf.toString('utf8')).slice(-131072);});
child.stderr.on('data',buf=>{errDigest.update(buf);errBytes+=buf.length;process.stderr.write(buf);});
let errorCode=null;
const exitCode=await new Promise(resolve=>{
 child.on('error',e=>{errorCode=e.code||'SPAWN_FAILED';});
 child.on('close',code=>resolve(code));
});
const summary=k=>{const m=[...output.matchAll(new RegExp('^# '+k+' (\\d+)','gm'))];return m.length?Number(m.at(-1)[1]):null;};
const total=summary('tests'),passed=summary('pass'),failed=summary('fail');
const state=exitCode===0&&!errorCode&&total>0&&passed===total&&failed===0?'SOURCE_TEST_PASS':'SOURCE_TEST_FAIL';
const record={
 schema:'leeway.production.source-ci-evidence.v1',
 state,classification:'SOURCE_ONLY_NOT_PRODUCTION_ADMISSION',
 generatedAt:new Date().toISOString(),
 source:{repository:process.env.GITHUB_REPOSITORY||null,commit:process.env.GITHUB_SHA||null,
  runId:process.env.GITHUB_RUN_ID||null,attempt:process.env.GITHUB_RUN_ATTEMPT||null,
  runnerOs:process.env.RUNNER_OS||process.platform},
 command:'node --test',exitCode,errorCode,
 stdoutSha256:digest.digest('hex'),stderrSha256:errDigest.digest('hex'),
 stdoutBytes:byteCount,stderrBytes:errBytes,
 tests:{total,passed,failed},
 originalHostFactsIncluded:false,
 independentVeritas:'NOT_EVALUATED',receiptAuthority:'NOT_ADMITTED',
 learningLedger:'NOT_UPDATED',productionAuthorized:false,mutationPerformed:false
};
const data=JSON.stringify(record,null,2)+'\n';
const directory=resolve('.local-evidence');
await mkdir(directory,{recursive:true,mode:0o700});
await writeFile(resolve(directory,'source-evidence.json'),data,{mode:0o600});
await writeFile(resolve(directory,'source-evidence.sha256'),sha(data)+'  source-evidence.json\n',{mode:0o600});
if(state!=='SOURCE_TEST_PASS')process.exitCode=1;
