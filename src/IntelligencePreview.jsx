import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './motion';
import { nodes, edges, phases, tabs, nodeStatus, dashboardRows } from './intelligence-data';

export default function IntelligencePreview({ motionPaused }) {
  const [phase, setPhase] = useState(0);
  const [selected, setSelected] = useState('gateway');
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [tab, setTab] = useState('Findings');
  const root = useRef(null);
  const reduced = useReducedMotion();
  const node = nodes.find(n => n.id === selected);
  const current = phases[phase];
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .05 });
    observer.observe(root.current);
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);
  useEffect(() => {
    if (!running || !visible || !pageVisible || motionPaused || reduced) return;
    const timer = setTimeout(() => {
      if (phase === 3) { setRunning(false); return; }
      setPhase(phase + 1); setSelected(phases[phase + 1].selected);
      if (phase + 1 === 3) setRunning(false);
    }, 2400);
    return () => clearTimeout(timer);
  }, [running, visible, pageVisible, motionPaused, reduced, phase]);
  useEffect(() => { if (reduced || motionPaused) setRunning(false); }, [reduced, motionPaused]);
  const choosePhase = index => { setRunning(false); setStarted(false); setPhase(index); setSelected(phases[index].selected); };
  const play = () => {
    if (reduced) { choosePhase(3); return; }
    setPhase(0); setSelected('gateway'); setStarted(true); setRunning(true);
  };
  const toggleSequence = () => {
    if (running) setRunning(false);
    else if (started && phase < 3 && !reduced) setRunning(true);
    else play();
  };
  const tabKeys = event => {
    let index = tabs.indexOf(tab);
    if (event.key === 'ArrowRight') index = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') index = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = tabs.length - 1;
    else return;
    event.preventDefault(); setTab(tabs[index]);
    root.current.querySelectorAll('[role="tab"]')[index].focus();
  };
  return <div ref={root} className="intelligence-console" data-running={running && visible && !motionPaused && !reduced && pageVisible}>
    <div className="intelligence-top"><div><span className="demo-light" aria-hidden="true" />RADVOT / INTELLIGENCE PREVIEW</div><span className="demo-tag">FICTIONAL DEMONSTRATION</span></div>
    <p className="intelligence-disclosure">Synthetic assets, evidence, and outcomes. No scans, target connections, or live telemetry.</p>
    <div className="scan-stages" aria-label="Security demonstration stages">{phases.map((item,index) => <button key={item.name} aria-pressed={phase===index} onClick={() => choosePhase(index)}><span>0{index+1}</span>{item.name}<span className="phase-mark" aria-hidden="true">{phase>index?'✓':phase===index?'●':'○'}</span></button>)}</div>
    <div className="graph-layout">
      <div className="graph-column"><div className="graph-heading"><span className="mono">STAGING ENVIRONMENT / 06 NODES</span><span className="graph-live-label">{running ? 'Demo playing' : 'Explore the nodes'}</span></div>
        <div className="network-graph" aria-label="Interactive fictional security graph">
          <svg viewBox="0 0 900 420" preserveAspectRatio="none" aria-hidden="true" className="network-lines"><defs><pattern id="graph-grid" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#6f60a0" opacity=".3" /></pattern></defs><rect width="900" height="420" fill="url(#graph-grid)"/>{edges.map(([a,b],index) => {
            const from=nodes.find(n=>n.id===a), to=nodes.find(n=>n.id===b);
            const highlighted=node.path.includes(index);
            return <g key={index}><path className={highlighted?'graph-edge selected':'graph-edge'} d={`M${from.x*9},${from.y*4.2} L${to.x*9},${to.y*4.2}`} />{highlighted && <path className="edge-flow" d={`M${from.x*9},${from.y*4.2} L${to.x*9},${to.y*4.2}`} />}</g>;
          })}</svg>
          <div className="graph-scan" aria-hidden="true" />
          {nodes.map(n=><button key={n.id} className={`graph-node status-${nodeStatus(n.id,phase).toLowerCase().replace(' ','-')}`} style={{left:`${n.x}%`,top:`${n.y}%`}} aria-label={`${n.name}: ${nodeStatus(n.id,phase)}`} aria-pressed={n.id===selected} aria-controls="node-inspector" onClick={()=>{setSelected(n.id);setRunning(false);}}><span className="node-symbol" aria-hidden="true">{n.symbol}</span><strong>{n.name}</strong><span className="node-status"><span aria-hidden="true">{{Verified: '✓', Potential: '◇', 'Not tested': '○', Inconclusive: '?'}[nodeStatus(n.id,phase)]}</span> {nodeStatus(n.id,phase)}</span></button>)}
        </div>
        <div className="graph-legend"><span>✓ Verified <small>Sample evidence</small></span><span>◇ Potential <small>Needs validation</small></span><span>○ Not tested <small>No coverage</small></span><span>? Inconclusive <small>Insufficient evidence</small></span></div>
      </div>
      <aside id="node-inspector" className="node-inspector" aria-live="polite" aria-atomic="true"><span className="eyebrow">SELECTED SYSTEM</span><h3>{node.name}</h3><span className="inspector-type">{phase===3 && node.id==='service' ? 'Retested service' : node.type}</span><span className="inspector-status">{nodeStatus(node.id,phase)}</span><p>{phase===3 && node.id==='service' ? 'The authored retest shows the local listener absent after a separately approved change. Broader network protection remains untested.' : node.detail}</p><div className="node-evidence"><span className="mono">EVIDENCE NOTE</span><p>{phase===3 && node.id==='service' ? 'DEMO-E06 · Synthetic post-change inventory: listener absent.' : node.evidence}</p></div></aside>
    </div>
    <div className="scan-story"><div aria-live="polite" aria-atomic="true"><span className="eyebrow">{current.name.toUpperCase()} / ILLUSTRATIVE RESULT</span><h3>{current.title}</h3><p>{current.copy}</p><span className="phase-result">{current.result}</span></div><div className="scan-controls"><button className="button small" onClick={toggleSequence} disabled={motionPaused && !reduced}>{running?'Pause sequence':reduced?'Show final result':started && phase<3?'Resume sequence':'Run demo'}</button><button className="demo-secondary" onClick={play} disabled={motionPaused && !reduced}>Replay demo</button><button className="demo-secondary" onClick={()=>choosePhase(0)}>Reset graph</button>{motionPaused && <span className="control-note">Global motion is paused. Select any stage manually.</span>}</div></div>
    <div className="dashboard-preview"><div className="dashboard-label"><span className="mono">EXPLORE THE PRODUCT VIEW</span><span>Representative content · no login needed</span></div><div className="dashboard-tabs" role="tablist" aria-label="Product preview categories" onKeyDown={tabKeys}>{tabs.map((name,index)=><button role="tab" id={`preview-tab-${index}`} aria-controls="preview-panel" aria-selected={tab===name} tabIndex={tab===name?0:-1} key={name} onClick={()=>setTab(name)}>{name}</button>)}</div>
      <div id="preview-panel" role="tabpanel" aria-labelledby={`preview-tab-${tabs.indexOf(tab)}`} tabIndex={0}><div className="dashboard-table" key={tab+phase}><div className="dashboard-row table-head"><span>{tab}</span><span>Example status</span><span>Evidence / boundary</span></div>{dashboardRows(tab,phase).map(([name,status,detail])=><div className="dashboard-row" key={name}><strong>{name}</strong><span>{status}</span><p>{detail}</p></div>)}</div></div>
    </div>
    <div className="demo-event" role="status"><span aria-hidden="true">›</span> {current.event}</div>
  </div>;
}
