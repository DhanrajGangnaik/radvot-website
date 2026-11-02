import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { capabilities, faqs } from './content';
import { PillarVisual } from './visuals';
import './styles.css';
import './visual-refresh.css';
import './premium.css';
import HeroSystem from './HeroSystem';
import ProductDemo from './ProductDemo';
import './experience.css';
import { usePageEffects } from './motion';

const nav = [['Platform', 'platform'], ['How It Works', 'how-it-works'], ['Capabilities', 'capabilities'], ['Trust', 'trust'], ['FAQ', 'faq']];

function Arrow({ diagonal = false }) {
  return <span aria-hidden="true">{diagonal ? '↗' : '→'}</span>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [motionPaused, setMotionPaused] = useState(false);
  usePageEffects(motionPaused);
  return <div className="site-shell" data-motion={motionPaused ? 'paused' : 'running'}>
    <div className="scroll-progress" aria-hidden="true" />
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><div className="header-inner"><a href="#" className="brand" aria-label="RADVOT home">RADVOT<span className="brand-period">.</span></a><button className="menu-toggle" aria-expanded={menuOpen} aria-controls="navigation" onClick={() => setMenuOpen(!menuOpen)} onKeyDown={e => { if (e.key === 'Escape') setMenuOpen(false); }}>{menuOpen ? 'Close' : 'Menu'} <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span></button><nav id="navigation" aria-label="Main navigation" className={menuOpen ? 'navigation open' : 'navigation'} onKeyDown={e => { if (e.key === 'Escape') { setMenuOpen(false); document.querySelector('.menu-toggle').focus(); } }}>{nav.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav></div></header>
    <main id="main">
      <section className="hero section" aria-labelledby="hero-title">
        <div className="hero-atmosphere" aria-hidden="true"><div className="aurora aurora-violet" /><div className="aurora aurora-pink" /><div className="perspective-grid" /><div className="pointer-halo" />{Array.from({length: 8}, (_,i)=><span key={i} className="hero-particle" style={{left:`${12+i*11}%`,top:`${18+(i*17)%65}%`,animationDelay:`-${i*1.7}s`}} />)}</div>
        <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-line" />AUTONOMOUS OFFENSIVE & DEFENSIVE SECURITY INTELLIGENCE</p><h1 id="hero-title">Know Your<br />Weaknesses.<br /><span>Prove Your<br />Defenses.</span></h1><p className="hero-description">Create and deploy agents. Investigate through natural language. Turn evidence into your next move.</p><div className="hero-actions"><a className="button" href="#platform">Explore the Platform <Arrow /></a><a className="text-link" href="#how-it-works">See How It Works <span aria-hidden="true">↘</span></a></div><p className="hero-note">Investigate exposure. Test controls. Follow the evidence.</p></div>
        <HeroSystem />
        <div className="hero-footer"><span>RISK ASSESSMENT / DEFENSE VALIDATION / ORCHESTRATED TESTING</span><button className="motion-toggle" aria-pressed={motionPaused} onClick={() => setMotionPaused(!motionPaused)}>{motionPaused ? 'Resume motion' : 'Pause motion'} <span aria-hidden="true">{motionPaused ? '▷' : 'Ⅱ'}</span></button></div>
      </section>

      <section id="platform" className="section pillars-section" aria-labelledby="platform-title">
        <div className="section-heading"><div><p className="eyebrow">THREE PILLARS. ONE PLATFORM.</p><h2 id="platform-title">Find it. Test it.<br /><span className="muted">Prove the next move.</span></h2></div><p>From exposure to evidence, with a human in control.</p></div>
        <div className="pillars">{[
          ['01', 'risk', 'Risk Assessment', 'Investigate vulnerabilities, misconfigurations, and exposure. Attack paths still need analyst validation.'],
          ['02', 'defense', 'Defense Validation', 'Check service exposure against policy. Broader prevention and response validation is a product direction.'],
          ['03', 'testing', 'Orchestrated Testing', 'Coordinate supported tools, reviewed plans, evidence, and targeted follow-up checks.'],
        ].map(([number, variant, title, body]) => <article key={title} className="pillar"><PillarVisual variant={variant} /><div className="pillar-top"><span className="mono">/{number}</span></div><h3>{title}</h3><p>{body}</p><details className="feature-details"><summary>Explore this pillar <span aria-hidden="true">+</span></summary><p>{variant === 'risk' ? 'Supported tools investigate exposure within configured scope. Findings are observations for review, not automatic proof of exploitability.' : variant === 'defense' ? 'Current checks compare ports and services against policy. Broader SIEM, EDR, and prevention validation is not established.' : 'Reviewed chat plans coordinate supported tools. Targeted verification exists; a universal mutation approval gate is not established.'}</p></details></article>)}</div>
      </section>

      <ProductDemo />

      <section id="capabilities" className="section capabilities-section" aria-labelledby="capabilities-title"><div className="section-heading"><div><p className="eyebrow">CAPABILITY, WITHOUT THE HYPE</p><h2 id="capabilities-title">Know what’s here.<br /><span className="muted">See what’s next.</span></h2></div><p>Source-backed, not production-certified. Expand a capability to see its current limits.</p></div><div className="filters" aria-label="Filter capabilities">{['All', 'Implemented', 'Experimental', 'Planned'].map(f => <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}{f === 'All' && <span>07</span>}</button>)}</div><div className="capability-list" aria-live="polite">{capabilities.filter(c => filter === 'All' || c.status === filter).map((c, i) => <details className="capability-row" key={c.title}><summary><span className="mono row-number">0{i + 1}</span><span className="capability-name">{c.title}</span><span className={`capability-status ${c.status.toLowerCase()}`}><span aria-hidden="true">{c.status === 'Implemented' ? '●' : c.status === 'Experimental' ? '◐' : '○'}</span>{c.status}</span><span className="expand-symbol" aria-hidden="true">+</span></summary><p>{c.detail}</p></details>)}</div></section>

      <section id="trust" className="trust-section" aria-labelledby="trust-title"><div className="section trust-inner"><div className="trust-intro"><p className="eyebrow">TRUST IS AN EXECUTION BOUNDARY</p><h2 id="trust-title">Intelligence proposes.<br /><span className="muted">Controls constrain.</span></h2><p>Code enforces supported boundaries. People authorize the work. Expand each control to see its limits.</p><div className="boundary-diagram" aria-label="Plan, scope check, execution, evidence"><span>PLAN</span><span aria-hidden="true">→</span><strong>SCOPE CHECK</strong><span aria-hidden="true">→</span><span>EXECUTION</span><span aria-hidden="true">→</span><span>EVIDENCE</span></div></div><div className="trust-list">{[['01', 'Defined scope', 'Supported active scan categories check targets against approved CIDRs in code. Passive and local tools follow different boundaries.'], ['02', 'Explicit approval states', 'Chat plans wait for confirmation. The execution engine skips approval-required steps. Universal mutation approval is not established.'], ['03', 'Agent and target validation', 'API-key authentication and registered ID/IP lookup support agent operations. This is not a claim of per-agent cryptographic attestation.'], ['04', 'Evidence with provenance', 'Structured findings retain their observation source, method, and confidence. Audit logs support review; immutable storage is not claimed.'], ['05', 'Uncertainty stays visible', 'Potential findings and coverage gaps require review. Incomplete evidence must not become a confident claim of safety.']].map(([n, title, body]) => <details key={n}><summary><span className="mono">{n}</span><span>{title}</span><span aria-hidden="true">+</span></summary><p>{body}</p></details>)}</div></div></section>

      <section className="section deployment-section" aria-labelledby="deployment-title">
        <div className="deployment-copy"><p className="eyebrow">YOUR ENVIRONMENT. A CLEAR DIRECTION.</p><h2 id="deployment-title">Security has<br /><span className="muted">no single address.</span></h2><p>Self-hosted Docker and Linux today.<br />Cloud and hybrid coverage as the direction.</p><a className="text-link" href="#faq">Read about supported environments <Arrow /></a></div>
        <figure className="infrastructure-figure"><picture><source media="(max-width: 580px)" srcSet="/images/infrastructure-small.webp" /><img src="/images/infrastructure.webp" width="1440" height="960" loading="lazy" decoding="async" alt="Concept illustration of three server environments connected by blue light paths" /></picture><figcaption>Concept illustration · dedicated cloud and identity connectors are planned.</figcaption></figure>
        <div className="deployment-strip"><div><span className="mono">01 / DOCUMENTED</span><h3>On-premises</h3><p>Docker &amp; Linux</p></div><div><span className="mono">02 / PLANNED</span><h3>Cloud</h3><p>Dedicated connectors</p></div><div><span className="mono">03 / DIRECTION</span><h3>Hybrid</h3><p>Broader platform coverage</p></div></div>
      </section>

      <section id="faq" className="section faq-section" aria-labelledby="faq-title"><div><p className="eyebrow">A FEW IMPORTANT ANSWERS</p><h2 id="faq-title">Clear by design.</h2><p>What RADVOT is.<br />Where it’s going. Where it stops.</p></div><div className="faq-list">{faqs.map(([q, a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>

      <section className="closing section"><p className="eyebrow">TURN ASSUMPTIONS INTO ANSWERS</p><h2>Your defenses deserve<br /><span>a worthy adversary.</span></h2><p>Know Your Weaknesses. Prove Your Defenses.</p><a className="button" href="#how-it-works">Explore the product demo <Arrow /></a><a className="contact-link" href="mailto:dhanrajgangnaik47@gmail.com">Get in Touch <Arrow diagonal /></a></section>
    </main>
    <footer className="section site-footer">
      <div className="footer-top">
        <div><a className="brand" href="#" aria-label="RADVOT home">RADVOT<span className="brand-period">.</span></a><p>An intelligent adversary working for your security.</p></div>
        <div className="footer-links">
          <a className="footer-contact contact-email" href="mailto:dhanrajgangnaik47@gmail.com"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg><span>dhanrajgangnaik47@gmail.com</span></a>
          <a className="footer-contact" href="https://www.linkedin.com/in/dhanraj-gangnaik-b5b9131b8/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (opens in a new tab)"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.46 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.29 10.85H15.8v-4.65c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.51V9.2h2.83v1.3h.04c.39-.74 1.36-1.52 2.79-1.52 2.98 0 3.58 1.96 3.58 4.5v5.27Z" /></svg><span>LinkedIn</span><span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
