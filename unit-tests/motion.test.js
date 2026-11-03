import test from 'node:test';
import assert from 'node:assert/strict';
import { motionState, qualityProfile, copyEnvelope, SCRUB_SECONDS } from '../src/features/cinematic-story/motionModel.js';
import { storyState } from '../src/features/cinematic-story/storyModel.js';

test('motion envelopes stay bounded and continuous in both scroll directions',()=>{
  let previous=motionState(0,storyState(0));
  for(let i=1;i<10000;i++){
    const p=i/1000,current=motionState(p,storyState(p));
    for(const key of Object.keys(current)){
      assert.ok(current[key]>=0 && current[key]<=1.001,`${key} at ${p}`);
      assert.ok(Math.abs(current[key]-previous[key])<.02,`${key} discontinuity at ${p}`);
    }
    assert.deepEqual(current,motionState(p,storyState(p)));
    previous=current;
  }
});
test('silence suppresses streams and network; handoff restores coordinated topology',()=>{
  const silent=motionState(2.65,storyState(2.65));
  assert.equal(silent.network,0);assert.equal(silent.signals,0);assert.equal(silent.fragments,0);
  const handoff=motionState(9.75,storyState(9.75));
  assert.equal(handoff.network,1);assert.equal(handoff.bridge,1);assert.equal(handoff.seed,1);
});
test('copy leaves before chapter swap and returns without overlapping text',()=>{
  assert.equal(copyEnvelope(0),1);assert.equal(copyEnvelope(9.99),1);
  for(let i=1;i<=9;i++){
    assert.ok(copyEnvelope(i-.0001)<.001);assert.equal(copyEnvelope(i),0);
    assert.equal(copyEnvelope(i+.5),1);
  }
  assert.ok(SCRUB_SECONDS>0 && SCRUB_SECONDS<.4);
});
test('adaptive profiles retain essential geometry and bound render resolution',()=>{
  assert.equal(qualityProfile(390).name,'compact');
  assert.equal(qualityProfile(1200).name,'balanced');
  assert.equal(qualityProfile(1920).name,'full');
  for(const hint of [{cores:2},{memory:4},{saveData:true}]){
    const profile=qualityProfile(1920,hint);assert.equal(profile.name,'economy');
    assert.ok(profile.fragments>=24);assert.equal(profile.dpr,1);
  }
  assert.ok(qualityProfile(390).fragments<qualityProfile(1920).fragments);
});
