import React, { useState } from 'react';

const stages = [
  ['Create Agent', 'Give the work an identity.', 'Prepare a named Linux agent for an authorized assessment. This guided preview illustrates the intended journey; available controls vary by deployment.'],
  ['Deploy Agent', 'Establish the connection.', 'Install and enroll the agent on the approved system, then check its heartbeat. This preview simulates enrollment locally.'],
  ['Natural Language', 'Ask clearly. Authorize precisely.', 'Describe the objective, review the proposed scope, and approve the plan. No commands or target requests leave this demonstration.'],
  ['Generate Reports', 'Move from evidence to action.', 'Review findings in risk order. Severity, exploit probability, exposure, and business context inform different parts of the decision.'],
];

const findings = [
  { id: 'DEMO-F01', name: 'Log4j component requires review', priority: 'P1 · Review first', severity: 'Critical', cvss: '10.0', cve: 'CVE-2021-44228', epss: '97.112%', percentile: '99.89th percentile', state: 'Potential', evidence: 'E-01 · Synthetic package inventory: log4j-core 2.14.1 in the example billing service. Version evidence suggests exposure; runtime exploitability has not been tested.', mitigation: 'Upgrade to a maintained vendor-supported version that fixes this CVE, rebuild the application, and verify the deployed dependency inventory.', reason: 'Critical severity, high historical exploit probability, and an internet-facing billing service. Business impact still requires owner review.' },
  { id: 'DEMO-F02', name: 'Unexpected service on port 8080', priority: 'P2 · Investigate', severity: 'Unscored configuration finding', cvss: 'Not scored', cve: null, epss: 'Not available', percentile: 'No matched CVE', state: 'Verified observation', evidence: 'E-02 · Synthetic local inventory: port 8080 is listening; the approved baseline allows 22 and 443. External reachability remains untested.', mitigation: 'Confirm the service owner and business need. If unnecessary, approve disabling it, then repeat the inventory and separately validate network exposure.', reason: 'Observed policy mismatch on the same asset. No assigned CVE or established exploitability; investigate scope before prioritizing a change.' },
];

function ReportPreview({ name }) {
  const [selected, setSelected] = useState(0);
  const [retestStates, setRetestStates] = useState({});
  const finding = findings[selected];
  const retested = Boolean(retestStates[finding.id]);
  return <div className="report-preview">
    <div className="report-summary"><span>RV-024 / SAMPLE REPORT</span><span>2 findings · 1 asset · synthetic evidence</span></div>
    <div className="report-layout"><div className="finding-list" aria-label="Findings in risk-based priority order">{findings.map((item, i) => <button key={item.id} aria-pressed={selected === i} onClick={() => setSelected(i)} aria-controls="finding-details"><span>{item.priority}</span><strong>{item.name}</strong><small>{item.severity}</small></button>)}</div>
      <div className="finding-details" id="finding-details" aria-live="polite">
        <div className="finding-title"><span className="badge">{finding.state}</span><span className="mono">{finding.id}</span></div>
        <h4>{finding.name}</h4><p className="asset-line">Affected asset: <strong>{name || 'sentinel-linux-01'}</strong> · 192.0.2.24</p>
        <div className="score-grid"><div><span>CVSS v3.1 · Severity</span><strong>{finding.cvss}</strong><small>{finding.severity}</small></div><div><span>EPSS · Exploit probability</span><strong>{finding.epss}</strong><small>{finding.percentile}</small></div></div>
        {finding.cve ? <p className="score-note">{finding.cve} · EPSS snapshot: 2025-03-01. Predicted exploitation in the wild within the following 30 days; this historical value is not a current score. Percentile ranks this score among scored CVEs.</p> : <p className="score-note">EPSS is unavailable without a matched CVE and published EPSS data. Unscored does not mean low risk.</p>}
        <details className="report-evidence"><summary>Evidence &amp; priority rationale <span aria-hidden="true">+</span></summary><p>{finding.evidence}</p><p>{finding.reason}</p></details>
        <div className="mitigation"><strong>Recommended mitigation</strong><p>{finding.mitigation}</p></div>
        <div className="retest-record"><strong>{retested ? 'Sample retest recorded' : 'Remediation pending · retest not run'}</strong><p>{retested ? selected === 0 ? 'E-03 · Synthetic follow-up inventory: affected package version absent. Dependency check verified; runtime security and other controls remain untested.' : 'E-04 · Synthetic follow-up inventory: local listener absent after an approved service change. Network enforcement remains untested.' : 'An operator must review and approve the change before follow-up validation.'}</p></div>
        <button className="demo-secondary" onClick={() => setRetestStates(states => ({ ...states, [finding.id]: !states[finding.id] }))}>{retested ? 'Reset retest example' : 'Show sample retest'}</button>
      </div>
    </div>
    <p className="report-source">Score references: <a href="https://nvd.nist.gov/vuln/detail/CVE-2021-44228">NVD CVSS</a> · <a href="https://api.first.org/data/v1/epss?cve=CVE-2021-44228&date=2025-03-01">FIRST EPSS, 2025-03-01</a>. Asset associations, priority order, and evidence are fictional.</p>
  </div>;
}

export default function ProductDemo() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('sentinel-linux-01');
  const [created, setCreated] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [approved, setApproved] = useState(false);
  const [generation, setGeneration] = useState(0);
  const current = stages[step];
  return <section id="how-it-works" className="section product-demo" aria-labelledby="workflow-title">
    <div className="section-heading"><div><p className="eyebrow">FROM AGENT TO ANSWERS</p><h2 id="workflow-title">Your objective.<br /><span className="muted">An evidence trail.</span></h2></div><p>Create. Deploy. Assess. Report.<br />Explore the complete journey in four steps.</p></div>
    <div className="console">
      <div className="console-top"><span className="console-title"><span className="violet-dot" aria-hidden="true" />Illustrative workflow</span><span className="mono">BROWSER-LOCAL / SYNTHETIC DATA</span></div>
      <p className="demo-disclosure">Fictional assets and authored evidence. No security commands, target connections, or live telemetry. This is a guided product preview, not an authenticated application.</p>
      <div className="steps" aria-label="Product workflow stages">{stages.map(([label], i) => <button key={label} className={step === i ? 'step active' : 'step'} aria-current={step === i ? 'step' : undefined} aria-controls="stage-content" onClick={() => setStep(i)}><span className="step-number">0{i + 1}</span>{label}<span className="step-dot" aria-hidden="true" /></button>)}</div>
      <div id="stage-content" className="product-stage" aria-live="polite">
        <div className="stage-story"><p className="eyebrow">0{step + 1} / {current[0].toUpperCase()}</p><h3>{current[1]}</h3><p>{current[2]}</p></div>
        {step === 0 && <div className="journey-panel"><span className="panel-label">AGENT CONFIGURATION / DEMO</span><label htmlFor="agent-name">Agent name</label><input id="agent-name" maxLength={40} value={name} onChange={event => { setName(event.target.value); setCreated(false); setDeployed(false); setApproved(false); }} /><dl><div><dt>Platform</dt><dd>Linux · example host</dd></div><div><dt>Assessment boundary</dt><dd>192.0.2.24 / single authorized system</dd></div></dl><button className="button small" disabled={!name.trim() || created} onClick={() => setCreated(true)}>{created ? 'Demo agent created ✓' : 'Create demo agent'}</button><p className="local-state">{created ? `${name} · demo-agent-024 · ready for the deployment example.` : 'Choose a recognizable label. This creates only a temporary browser-local example.'}</p></div>}
        {step === 1 && <div className="journey-panel"><span className="panel-label">ENROLLMENT / DEMO</span><h4>{name || 'sentinel-linux-01'}</h4><ol className="deploy-checks"><li>Install the agent on the authorized Linux host.</li><li>Enroll with the deployment’s approved configuration.</li><li>Verify identity and heartbeat before assessment.</li></ol><button className="button small" onClick={() => setDeployed(!deployed)}>{deployed ? 'Reset deployment example' : 'Simulate deployment'}</button><div className="heartbeat"><span aria-hidden="true">{deployed ? '●' : '○'}</span><strong>{deployed ? 'Enrolled · synthetic heartbeat received' : 'Awaiting simulated enrollment'}</strong></div><p>No installer runs and no enrollment credentials are generated.</p></div>}
        {step === 2 && <div className="journey-panel"><span className="panel-label">NATURAL-LANGUAGE INTERFACE / DEMO</span><div className="chat-message"><span>YOU / EXAMPLE PROMPT</span><p>Assess the approved Linux staging system for vulnerable packages and unexpected services. Keep checks read-only and report supporting evidence.</p></div><div className="proposed-plan"><strong>RADVOT / Proposed plan</strong><ul><li>Target: demo-agent-024 · 192.0.2.24 only.</li><li>Compare package inventory with vulnerability data.</li><li>Compare listening services with the approved baseline.</li><li>Exclude exploitation, credentials, and all other hosts.</li></ul></div><label className="approval-control"><input type="checkbox" checked={approved} onChange={event => setApproved(event.target.checked)} /><span>Approve this fictional, bounded assessment plan.</span></label><p className="local-state">Approval state: {approved ? 'approved for demonstration only' : 'awaiting review'}</p><button className="button small" disabled={!approved} onClick={() => setStep(3)}>View sample assessment report →</button></div>}
        {step === 3 && <ReportPreview key={generation} name={name} />}
      </div>
      <div className="console-bottom"><p>Explore any step. All state stays in this page and resets on reload.</p><div className="workflow-actions"><button className="restart" onClick={() => { setStep(0); setName('sentinel-linux-01'); setCreated(false); setDeployed(false); setApproved(false); setGeneration(value => value + 1); }}>Restart ↺</button><button className="button small" disabled={step === 3} onClick={() => setStep(value => Math.min(value + 1, 3))}>{step === 3 ? 'Walkthrough complete' : 'Next stage →'}</button></div></div>
    </div>
    <div className="legend" aria-label="Evidence status definitions"><span><b className="verified">✓ Verified</b> An observation supports this statement</span><span><b className="potential">◇ Potential</b> Further validation needed</span><span><b>— Not tested</b> Outside assessed coverage</span><span><b className="inconclusive">? Inconclusive</b> Insufficient evidence</span></div>
  </section>;
}
