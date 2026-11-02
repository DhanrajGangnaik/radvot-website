import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';

const IntelligencePreview = lazy(() => import('./IntelligencePreview'));

export default function LazyIntelligence({ motionPaused }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setReady(true); observer.disconnect(); }
    }, { rootMargin: '700px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <section ref={ref} id="intelligence" className="section intelligence-section" aria-labelledby="intelligence-title"><div className="section-heading"><div><p className="eyebrow">FOLLOW THE SIGNAL</p><h2 id="intelligence-title">See the relationships.<br /><span className="muted">Question the path.</span></h2></div><p>Select a system. Trace a potential exposure. See what the evidence actually supports.</p></div><div className="intelligence-reserved">{ready ? <Suspense fallback={<div className="preview-loading" role="status">Loading the interactive preview…</div>}><IntelligencePreview motionPaused={motionPaused} /></Suspense> : <div className="preview-loading"><button className="demo-secondary" onClick={()=>setReady(true)}>Load interactive preview</button></div>}</div></section>;
}
