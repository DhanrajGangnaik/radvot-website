import test from 'node:test';
import assert from 'node:assert/strict';
import { storyState, activation, glyphs, chapters } from '../src/features/cinematic-story/storyModel.js';

test('all six components activate at their narrative boundaries and reverse deterministically',()=>{
  activation.forEach((p,i)=>{
    assert.equal(storyState(p-.001).active,i);
    assert.equal(storyState(p+.001).active,i+1);
  });
  const points=Array.from({length:1000},(_,i)=>i/100);
  const forward=points.map(storyState);
  for(const p of points.reverse()) assert.deepEqual(storyState(p),forward[Math.round(p*100)]);
});
test('silence, arrival, departure, assembly and handoff are distinct geometric states',()=>{
  assert.equal(chapters.length,10);
  assert.equal(storyState(2.65).darkness,1);
  assert.equal(storyState(2.65).core,0);
  assert.equal(storyState(2.65).portal,0);
  assert.equal(storyState(3.85).portal,1);
  assert.ok(storyState(3.85).core>.8);
  assert.equal(storyState(5.75).evidence,1);
  assert.ok(storyState(7.95).portal>.9);
  assert.equal(storyState(8.95).core,0);
  assert.equal(storyState(8.95).word,1);
  assert.equal(storyState(9.75).handoff,1);
  assert.equal(glyphs.length,6);
  for(const glyph of glyphs){assert.equal(glyph.length,7);assert.ok(glyph.every(row=>/^[01]{5}$/.test(row)));}
});
