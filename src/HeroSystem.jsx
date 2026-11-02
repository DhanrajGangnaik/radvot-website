import React, { useState } from 'react';

const signals = [
  { title: 'Agent', label: '01 / Create', symbol: '⌘', detail: 'A named agent. A defined responsibility.', sub: 'Prepare an agent for an authorized system.' },
  { title: 'System', label: '02 / Deploy', symbol: '▣', detail: 'Connect the system you intend to assess.', sub: 'Review enrollment and heartbeat before proceeding.' },
  { title: 'Assessment', label: '03 / Investigate', symbol: '◎', detail: 'Natural language. Explicit boundaries.', sub: 'Describe the objective; review scope and the proposed plan.' },
  { title: 'Report', label: '04 / Prioritize', symbol: '≡', detail: 'Evidence becomes your next move.', sub: 'Review severity, exploit probability, and mitigation.' },
];

export default function HeroSystem() {
  const [selected, setSelected] = useState(0);
  return <div className="hero-system" aria-label="Interactive RADVOT workflow overview">
    <div className="system-heading"><span className="mono">RADVOT / INTELLIGENCE FABRIC</span><span className="system-demo">ILLUSTRATIVE</span></div>
    <div className="system-space">
      <div className="system-depth">
        <div className="orbit-plane plane-back" aria-hidden="true" />
        <div className="orbit-plane plane-front" aria-hidden="true" />
        <svg className="system-paths" viewBox="0 0 520 420" aria-hidden="true">
          <path d="M90 95 260 210 430 95M90 325 260 210 430 325" />
          <path className="signal-stream" d={['M90 95 260 210','M430 95 260 210','M90 325 260 210','M430 325 260 210'][selected]} />
          <circle cx="260" cy="210" r="115" strokeDasharray="2 10" />
        </svg>
        <div className="intelligence-lens" aria-hidden="true"><div className="lens-ring" /><span>R</span><small>INTELLIGENCE</small></div>
        {signals.map((signal, i) => <button key={signal.title} className={`system-node system-node-${i}`} aria-pressed={selected === i} aria-controls="system-readout" onClick={() => setSelected(i)}><span className="node-glyph" aria-hidden="true">{signal.symbol}</span><small>{signal.label}</small><strong>{signal.title}</strong></button>)}
      </div>
    </div>
    <div className="system-readout" id="system-readout" aria-live="polite"><span className="readout-marker" aria-hidden="true" /><div><strong>{signals[selected].detail}</strong><p>{signals[selected].sub}</p></div><span className="mono">0{selected + 1}/04</span></div>
    <p className="system-footnote">Select a node to explore · conceptual workflow, not live telemetry</p>
  </div>;
}
