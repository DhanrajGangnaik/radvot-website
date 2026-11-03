import { clamp, smooth } from './storyModel.js';

// One scrub owns temporal smoothing. These envelopes only author the spatial path.
export const SCRUB_SECONDS = .28;
export function motionState(p, s) {
  return {
    network: (1-s.darkness)*clamp(1-smooth(7.95,8.4,p)+s.handoff),
    signals: (1-smooth(1.8,2.2,p)) + smooth(4.3,4.65,p)*(1-smooth(7.7,8.1,p)),
    beacon: smooth(4.2,4.6,p),
    bridge: smooth(4.15,4.65,p)*(1-smooth(7.85,8.35,p))+s.handoff,
    fragments: (1-smooth(1.8,2.2,p))+s.portal,
    selection: smooth(4.95,5.2,p)*(1-smooth(7,7.2,p)),
    seed: smooth(3,3.15,p)*(1-smooth(3.5,3.7,p))+smooth(7.9,8.25,p),
  };
}
export function qualityProfile(width, { cores=8, memory=8, saveData=false }={}) {
  if(saveData || cores<=4 || memory<=4) return {name:'economy',city:64,fragments:24,pulses:10,segments:64,dpr:1};
  if(width<960) return {name:'compact',city:64,fragments:36,pulses:14,segments:72,dpr:1};
  if(width<1440) return {name:'balanced',city:100,fragments:60,pulses:20,segments:96,dpr:1.25};
  return {name:'full',city:144,fragments:90,pulses:28,segments:128,dpr:1.5};
}
export function copyEnvelope(p) {
  const chapter=Math.min(9,Math.floor(p)), local=p-chapter;
  return (chapter===0?1:smooth(0,.08,local))*(chapter===9?1:1-smooth(.96,1,local));
}
