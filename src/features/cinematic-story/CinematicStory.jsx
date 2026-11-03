import React, { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { chapters, parts, smooth, storyState } from './storyModel';
import { SCRUB_SECONDS, copyEnvelope } from './motionModel';
import './cinematic.css';

gsap.registerPlugin(ScrollTrigger);
const StoryWorld = lazy(()=>import('./StoryWorld'));

class SceneBoundary extends Component {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){this.props.onFailure();}
  render(){return this.state.failed?null:this.props.children;}
}
function supportsWebGL(){try{const c=document.createElement('canvas');const gl=c.getContext('webgl2');if(!gl)return false;gl.getExtension('WEBGL_lose_context')?.loseContext();return true;}catch{return false;}}

function TextStory({ reason, onCinema }) {
  return <main className="cin-text" id="story-text">
    <p className="cin-kicker">THE THIRD FORCE / COMPLETE TEXT EDITION</p>
    <h1>Two teams.<br/>One intelligence.</h1>
    <p>{reason} All eight chapters, the brand reveal, and the demo remain available.</p>
    {onCinema && <button className="cin-button" onClick={onCinema}>Return to cinematic experience</button>}
    {chapters.map((c,i)=><article key={c.title}><span className="cin-kicker">{c.kicker}</span><h2>{c.title}</h2><h3>{c.heading}</h3><p>{c.text}</p>{c.dialogue?.map(([who,line],j)=><p key={j}><strong>{who}: </strong>{line}</p>)}{i===4&&<p>Scope defined → Approval granted → Agents connected. Only approved systems participate.</p>}{i===5&&<p>Illustrative evidence: public admin access is a High-priority policy issue. CVE, CVSS and EPSS are not applicable to this configuration observation. A separate illustrative CVE-2021-44228 inventory match has CVSS v3.1 10.0; EPSS is unavailable and exploitation is not verified.</p>}{i===6&&<p>Recommendation: restrict the admin route to an approved private network, preserve a recovery path, and verify both public denial and authorized access. A retest may find Verified Resolved, Still Present, or Inconclusive. Applying a change is not proof.</p>}<p>{c.cue}</p>{i<8&&<small>Active components: {parts.slice(0,[1,1,1,1,3,5,6,6][i]).join(' · ')}</small>}</article>)}
    <DemoChoices/>
  </main>;
}
function DemoChoices(){return <div className="cin-choices" onPointerEnter={()=>import('../interactive-demo/DemoApp')} onFocus={()=>import('../interactive-demo/DemoApp')}><a href="/demo?from=story&mode=onprem"><span aria-hidden="true">▤</span><strong>On-Premises</strong><small>Your infrastructure. Your boundary.</small><b>Enter workspace ↗</b></a><a href="/demo?from=story&mode=cloud"><span aria-hidden="true">◇</span><strong>Cloud</strong><small>Your workloads. Shared intelligence.</small><b>Enter workspace ↗</b></a></div>;}

function Decision({selected,setSelected,step,setStep,outcome,setOutcome}) {
  const findings=['Public admin route','Incomplete audit trail'];
  return <div className="cin-decision">
    <div className="cin-select">{findings.map((f,i)=><button key={f} aria-pressed={selected===i} onClick={()=>{setSelected(i);setStep(0);setOutcome('');}}>{f}</button>)}</div>
    <p><b>{selected===0?'Observed: public access accepted.':'Observed: sensitive reads lack audit events.'}</b> Illustrative evidence only.</p>
    {step===0?<button className="cin-button" onClick={()=>setStep(1)}>Review mitigation →</button>:<>
      <p>{selected===0?'Restrict the admin route to approved private access. Preserve a recovery path and check legitimate traffic before rollout.':'Enable audit coverage for sensitive reads, restrict log access, and verify event delivery. Plan retention capacity and protect personal data.'}</p>
      {step===1?<button className="cin-button" onClick={()=>setStep(2)}>Mark change as simulated / applied</button>:<>
        <p className="cin-status">{step===2?'Remediation claimed — not yet verified.':`Retest: ${outcome}`}</p>
        <label>Simulated verification evidence<select value={outcome||'Verified Resolved'} onChange={e=>{setOutcome(e.target.value);setStep(2);}}><option>Verified Resolved</option><option>Still Present</option><option>Inconclusive</option></select></label>
        <button className="cin-button" onClick={()=>{setOutcome(outcome||'Verified Resolved');setStep(3);}}>Run simulated retest</button>
        {step===3&&<p role="status">{outcome==='Verified Resolved'?(selected===0?'After: public access denied; private admin access succeeds.':'After: test read produces a complete, protected audit event.'):outcome==='Still Present'?(selected===0?'After: public access remains accepted. Recheck the route policy.':'After: test read still produces no audit event.'): 'After: evidence collection interrupted. Coverage is insufficient to verify the change.'}</p>}
      </>}
    </>}
  </div>;
}

export default function CinematicStory(){
  const root=useRef(null), stage=useRef(null), timeline=useRef({p:0,invalidate:null});
  const [position,setPosition]=useState(0),[hidden,setHidden]=useState(document.hidden),[inView,setInView]=useState(true);
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [mobile,setMobile]=useState(()=>innerWidth<960);
  const [available,setAvailable]=useState(supportsWebGL),[text,setText]=useState(false),[ready,setReady]=useState(false);
  const [selected,setSelected]=useState(0),[step,setStep]=useState(0),[outcome,setOutcome]=useState('');
  const onReady=useCallback(()=>setReady(true),[]),onFailure=useCallback(()=>setAvailable(false),[]);
  const textMode=text||reduced||!available;
  const state=storyState(position),chapter=chapters[state.chapter];
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);
    const resize=()=>setMobile(innerWidth<960);const visibility=()=>{setHidden(document.hidden);timeline.current.invalidate?.();};
    media.addEventListener('change',update);window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);
    const oldTitle=document.title;document.title='The Third Force — RADVOT cinematic experience';
    return()=>{media.removeEventListener('change',update);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);document.title=oldTitle;};
  },[]);
  useEffect(()=>{
    if(textMode)return;
    let previousKey='';
    const ctx=gsap.context(()=>{
      gsap.to(timeline.current,{p:9.99,ease:'none',onUpdate:()=>{
        const p=timeline.current.p,s=storyState(p);
        const authorization=Number(p>=4.05)+Number(p>=4.27)+Number(p>=4.49);
        const key=`${s.chapter}:${s.active}:${authorization}`;
        // Discrete content belongs in React; continuous motion stays in refs/CSS.
        if(key!==previousKey){setPosition(p);previousKey=key;}
        const style=stage.current?.style;
        if(style){
          const opacity=copyEnvelope(p);
          style.setProperty('--copy-opacity',opacity);
          style.setProperty('--copy-shift',`${(1-opacity)*8}px`);
          style.setProperty('--darkness',s.darkness);
          style.setProperty('--environment',1-smooth(1.7,2.3,p));
          style.setProperty('--parts-opacity',1-s.handoff);
          const assembly=smooth(7.9,8.5,p);
          style.setProperty('--parts-left',`${43-18*assembly}%`);
          style.setProperty('--parts-right',`${6+19*assembly}%`);
          style.setProperty('--parts-bottom',`${92-27*assembly}px`);
          style.setProperty('--legend-opacity',(1-s.darkness)*(1-smooth(7.8,8.1,p)));
          style.setProperty('--mask-start',`${27*(1-smooth(7.9,8.5,p))+40*s.handoff}%`);
          style.setProperty('--mask-end',`${40*(1-smooth(7.9,8.5,p))+50*s.handoff}%`);
        }
        timeline.current.invalidate?.();
      },scrollTrigger:{trigger:root.current,start:'top top',end:'bottom bottom',scrub:SCRUB_SECONDS}});
    },root);
    const observer=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting));observer.observe(root.current);
    ScrollTrigger.refresh();
    return()=>{observer.disconnect();ctx.revert();};
  },[textMode]);
  const go=()=>{
    const el=root.current;if(!el)return;
    const top=el.getBoundingClientRect().top+scrollY+(el.offsetHeight-innerHeight)*(.18/9.99);
    window.scrollTo({top,behavior:'instant'});
    ScrollTrigger.update();
  };
  return <div className="cinematic" data-chapter={state.chapter} data-active={state.active} data-ready={ready} data-mode={textMode?'text':'cinema'}>
    <header className="cin-header"><a className="cin-brand" href="/" aria-label="RADVOT home">RADVOT<span> /</span></a><span className="cin-edition">THE THIRD FORCE <i>AN IMMERSIVE EXPERIENCE</i></span><nav aria-label="Product navigation"><a href="/demo">Product demo ↗</a></nav></header>
    {textMode?<TextStory reason={reduced?'Reduced motion is enabled.':!available?'WebGL is unavailable, so the accessible text edition is shown.':'You are reading the complete experience.'} onCinema={!reduced&&available?()=>{setText(false);setPosition(0);timeline.current.p=0;window.scrollTo({top:0,behavior:'instant'});}:null}/>:<>
      <main className="cin-scroll" ref={root} aria-label="Explore The Third Force">
        <div ref={stage} className={`cin-stage cin-stage-${state.chapter}`}>
          <div className="cin-atmosphere" aria-hidden="true"/>
          <div className="cin-scene" aria-hidden="true" ><SceneBoundary onFailure={onFailure}><Suspense fallback={<p className="cin-loading">Constructing the digital world…</p>}><StoryWorld timeline={timeline} paused={hidden||!inView} mobile={mobile} selection={selected} outcome={step===3?outcome:''} onReady={onReady} onFailure={onFailure}/></Suspense></SceneBoundary></div>
          {!ready&&<p className="cin-loading" role="status">Building procedural geometry… <button onClick={()=>setText(true)}>Read the experience now</button></p>}
          {<div className="cin-legend" aria-hidden="true"><span>● RED / OFFENSIVE INVESTIGATION</span><span>● BLUE / DEFENSIVE SECURITY</span></div>}
          <div className="cin-copy" key={state.chapter} tabIndex={0} aria-label="Chapter narrative and controls">
            <p className="cin-kicker">{chapter.kicker}</p>
            <h1>{chapter.heading}</h1><p className="cin-description">{chapter.text}</p>
            {chapter.dialogue&&(mobile&&state.chapter===5?<details className="cin-dialogue"><summary>Hear both perspectives</summary>{chapter.dialogue.map(([speaker,line],i)=><p key={i}><span data-speaker={speaker}>{speaker}</span>{line}</p>)}</details>:<div className="cin-dialogue">{chapter.dialogue.map(([speaker,line],i)=><p key={i}><span data-speaker={speaker}>{speaker}</span>{line}</p>)}</div>)}
            {state.chapter===4&&<ol className="cin-authorization">{['Scope defined','Approval granted','Agents connected'].map((s,i)=><li key={s} data-done={position>=4.05+i*.22}>{position>=4.05+i*.22?'✓':'○'} {s}</li>)}</ol>}
            {state.chapter===5&&<div className="cin-evidence"><button onClick={()=>setSelected(0)} aria-pressed={selected===0}><b>HIGH / Public admin route</b><span>Asset: admin-gateway · Public response accepted</span><small>CVE / CVSS / EPSS: Not applicable · Policy observation</small></button><button onClick={()=>setSelected(1)} aria-pressed={selected===1}><b>MEDIUM / Incomplete audit trail</b><span>Asset: data-service · Sensitive reads not recorded</span><small>CVE / CVSS / EPSS: Not applicable</small></button><small>Additional inventory example: CVE-2021-44228 · CVSS v3.1 10.0 · EPSS unavailable · Exploitation not verified.</small><small>Synthetic examples. CVSS is severity; EPSS estimates exploitation probability over 30 days. No live intelligence.</small></div>}
            {state.chapter===6&&<Decision selected={selected} setSelected={setSelected} step={step} setStep={setStep} outcome={outcome} setOutcome={setOutcome}/>}
            {state.chapter===9&&<DemoChoices/>}
            {chapter.cue&&<p className="cin-cue">{chapter.cue}</p>}
            {state.chapter===9&&<button className="cin-link" onClick={()=>{setSelected(0);setStep(0);setOutcome('');go();}}>Replay experience ↺</button>}
          </div>
          <div className="cin-parts" aria-label="Intelligence Core components">{parts.map((part,i)=><div key={part} data-lit={i<state.active}><b>{'RADVOT'[i]}</b><span>{part}</span></div>)}</div>
          <div className="cin-caption"><span>{state.chapter<9?'SCROLL TO UNFOLD':'CONTINUE IN THE WORKSPACE'} <b>↓</b></span><small>Illustrative narrative · No real systems accessed</small></div>
        </div>
      </main>
      <footer className="cin-end"><p>The experience ends. Your investigation begins.</p><a className="cin-button" href="/demo">Launch interactive demo ↗</a><a href="mailto:dhanrajgangnaik47@gmail.com">Email ↗</a><a href="https://www.linkedin.com/in/dhanraj-gangnaik-b5b9131b8/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></footer>
    </>}
  </div>;
}
