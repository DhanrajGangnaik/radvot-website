export const nodes = [
  { id: 'gateway', name: 'Edge gateway', type: 'Network boundary', x: 16, y: 27, symbol: '◇', path: [], detail: 'A fictional staging ingress. Only this sample relationship is included; no reachable target is contacted.', evidence: 'DEMO-E01 · Authored inventory lists the staging gateway.' },
  { id: 'agent', name: 'sentinel-linux-01', type: 'Endpoint agent', x: 50, y: 27, symbol: '▣', path: [0], detail: 'The example Linux endpoint is linked to demo-agent-024. Names are display labels; current remote tools resolve ID or IP.', evidence: 'DEMO-E02 · Synthetic registration and heartbeat record.' },
  { id: 'service', name: 'Service :8080', type: 'Potential exposure', x: 84, y: 27, symbol: '!', path: [0, 1], detail: 'An unexpected local listener suggests exposure. The depicted path is a hypothesis, not confirmed exploitation or external reachability.', evidence: 'DEMO-E03 · Authored service inventory differs from the example baseline.' },
  { id: 'sensor', name: 'Detection sensor', type: 'Detection coverage', x: 16, y: 73, symbol: '?', path: [0, 4], detail: 'No receipt is included from the fictional detection sink. Missing evidence cannot prove that a defense failed.', evidence: 'DEMO-E04 · No event receipt supplied. Result remains inconclusive.' },
  { id: 'data', name: 'Staging data', type: 'Protected resource', x: 50, y: 73, symbol: '▤', path: [0, 1, 2, 3], detail: 'The sample resource sits beyond a control boundary. Data access and credential behavior are outside the demonstration scope.', evidence: 'No data-access evidence. This resource is not tested.' },
  { id: 'control', name: 'Policy boundary', type: 'Security control', x: 84, y: 73, symbol: '✓', path: [0, 1, 2], detail: 'An authored control test describes one blocked transition. It does not establish real firewall, SIEM, or EDR effectiveness.', evidence: 'DEMO-E05 · Synthetic control record: transition denied in the example.' },
];
export const edges = [['gateway','agent'],['agent','service'],['service','control'],['control','data'],['agent','sensor']];
export const phases = [
  { name: 'Discover', title: 'Map the bounded environment.', copy: 'Identify the fictional gateway, Linux agent, and connected service. Start with one scoped environment.', result: '6 illustrative systems · no targets contacted', selected: 'gateway', event: 'Inventory assembled from authored demo records.' },
  { name: 'Investigate', title: 'Follow a potential exposure.', copy: 'A service on port 8080 differs from the baseline. Highlight its potential path and keep exploitability unconfirmed.', result: 'Potential exposure · DEMO-E03', selected: 'service', event: 'Sample inventory mismatch identified. Exploitability unverified.' },
  { name: 'Validate', title: 'Test a specific control claim.', copy: 'The sample control record shows a denied transition. Detection delivery remains inconclusive; data access is not tested.', result: 'Verified sample denial · DEMO-E05', selected: 'control', event: 'Authored control check: denied. Detection receipt: inconclusive.' },
  { name: 'Strengthen', title: 'Revisit the change with evidence.', copy: 'A fictional operator approves disabling the listener. The authored retest shows it absent; wider coverage is still incomplete.', result: 'Verified sample retest · DEMO-E06', selected: 'service', event: 'Synthetic retest: listener absent. Unassessed controls remain open.' },
];
export const tabs = ['Findings', 'Assessments', 'Agents', 'Attack Paths', 'Defense Validation'];
export function nodeStatus(id, phase) {
  if (id === 'gateway' || id === 'agent') return 'Verified';
  if (id === 'service') return phase === 0 ? 'Not tested' : phase === 3 ? 'Verified' : 'Potential';
  if (id === 'control') return phase >= 2 ? 'Verified' : 'Not tested';
  if (id === 'sensor') return phase >= 2 ? 'Inconclusive' : 'Not tested';
  return 'Not tested';
}
export function dashboardRows(tab, phase) {
  const serviceStatus = nodeStatus('service', phase);
  const rows = {
    Findings: [['Unexpected listener', serviceStatus, phase === 3 ? 'DEMO-E06 · absent on sample retest' : 'DEMO-E03 · baseline mismatch'], ['Detection receipt', nodeStatus('sensor',phase), 'DEMO-E04 · no receipt supplied']],
    Assessments: [['Staging exposure review', phases[phase].name, 'Scope: demo-agent-024 only'], ['Remediation change', phase === 3 ? 'Approved example' : 'Pending example', 'Separate synthetic approval DEMO-APR-02']],
    Agents: [['sentinel-linux-01', 'Illustrative heartbeat', 'demo-agent-024 · Linux display label'], ['Target resolution', 'ID / IP supported', 'Friendly-name targeting remains planned']],
    'Attack Paths': [['Gateway → agent → service', phase > 0 ? 'Potential' : 'Not tested', 'Hypothetical relationship; no exploitation'], ['Service → data boundary', phase >= 2 ? 'Denied in example' : 'Not tested', 'No data-access coverage claimed']],
    'Defense Validation': [['Boundary transition', nodeStatus('control',phase), 'DEMO-E05 · synthetic denial record'], ['Detection delivery', nodeStatus('sensor',phase), 'No SIEM/EDR effectiveness established']],
  };
  return rows[tab];
}
