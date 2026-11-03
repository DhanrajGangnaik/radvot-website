import test from "node:test";
import assert from "node:assert/strict";
import {
  demoReducer as r,
  initialState,
  planRequest,
  resolveAgent,
  selectFindings,
  validatePlan,
  validateName,
  severity,
  mitigation,
  mitigationReply,
  reportDocument,
  restoreSession,
} from "../src/features/interactive-demo/engine.js";
import { operationalAdapter } from "../src/features/interactive-demo/planningAdapter.js";
const env = (mode = "onprem", profile = "database") => ({
  mode,
  profile,
  name: "Finance host",
  provider: "AWS",
});
function ready(mode = "onprem", profile = "database", name = "internal-db") {
  let s = r(initialState(), {
    type: "ENVIRONMENT",
    environment: env(mode, profile),
  });
  s = r(s, { type: "CREATE", id: "a", name, description: "" });
  s = r(s, { type: "DEPLOY" });
  for (let i = 0; i < 4; i++) s = r(s, { type: "DEPLOY_TICK", agentId: "a" });
  return s;
}
function run(
  s,
  text = "Assess internal-db for configuration vulnerabilities",
  failure = "none",
) {
  s = r(s, { type: "PROMPT", text, id: "report", date: "2026-01-01" });
  assert.ok(s.proposal);
  s = r(s, { type: "APPROVE", date: "2026-01-01", failure });
  for (let i = 0; i < 7; i++)
    s = r(s, { type: "EXEC_TICK", id: "report", date: "2026-01-01" });
  return s;
}
test("full onprem workflow, evidence, mitigation, retest and contextual export", () => {
  let s = ready();
  assert.equal(s.agents[0].status, "Online");
  s = run(s);
  const report = s.assessments[0];
  assert.equal(report.status, "complete");
  assert.equal(report.agentName, "internal-db");
  assert.deepEqual(selectFindings(report), report.findings);
  const f = report.findings.find((f) => f.id === "db-auth");
  assert.ok(f);
  assert.match(mitigation(f, report).steps.join(" "), /SCRAM/);
  assert.match(mitigationReply("How can I verify?", f, report), /trust rule/);
  const act = (action, extra = {}) =>
    (s = r(s, {
      type: "FINDING",
      reportId: "report",
      findingId: f.id,
      action,
      ...extra,
    }));
  act("mitigation");
  act("claim");
  assert.equal(
    s.assessments[0].findings.find((x) => x.id === f.id).verification,
    "Not tested",
  );
  act("retest", { outcome: "resolved" });
  assert.equal(
    s.assessments[0].findings.find((x) => x.id === f.id).verification,
    "Retest Pending",
  );
  act("result", { date: "2026-01-02" });
  assert.equal(
    s.assessments[0].findings.find((x) => x.id === f.id).verification,
    "Verified Resolved",
  );
  const doc = reportDocument(s.assessments[0]);
  assert.equal(doc.title, "Illustrative Demo Report");
  assert.equal(doc.mitigations[0].retests.length, 1);
  assert.deepEqual(s.agents[0].resolved, ["db-auth"]);
});
test("cloud, database, workstation, and container produce different findings", () => {
  const cloud = run(
    ready("cloud", "api", "cloud-api"),
    "Evaluate exposed services on cloud-api",
  );
  const ids = cloud.assessments[0].findings.map((f) => f.id);
  assert.ok(ids.includes("cloud-ingress"));
  assert.ok(ids.includes("api-debug"));
  assert.ok(!ids.includes("db-auth"));
  assert.ok(
    run(
      ready("onprem", "workstation", "desk"),
      "Assess desk",
    ).assessments[0].findings.some((f) => f.id === "screen"),
  );
  const container = run(ready("cloud", "container", "pods"), "Assess pods");
  assert.ok(container.assessments[0].findings.some((f) => f.id === "docker"));
  assert.ok(
    container.assessments[0].findings.some((f) => f.id === "cloud-role"),
  );
});
test("scope modification, approval and target guards", () => {
  let s = ready();
  const p = planRequest("Assess internal-db", s, "r", "d").proposal;
  s = { ...s, proposal: p };
  s = r(s, { type: "SCOPE", scope: ["services"] });
  assert.deepEqual(s.proposal.scope, ["services"]);
  for (const tamper of [
    { scope: [] },
    { scope: ["shell"] },
    { agentName: "unrelated" },
    { environment: env("cloud") },
  ])
    assert.ok(validatePlan({ ...p, ...tamper }, s));
  assert.equal(
    r({ ...s, proposal: null }, { type: "APPROVE" }).assessments.length,
    0,
  );
  assert.equal(r(s, { type: "EXEC_TICK", id: "r" }).assessments.length, 0);
});
test("unknown, ambiguous and offline agents never fall back; execution requests rejected", () => {
  let s = ready();
  for (const text of [
    "Assess ghost",
    "Run an assessment on missing",
    "Check agent absent",
    "Please assess ghost for critical vulnerabilities",
    "Check whether ghost has dangerous misconfigurations",
    "Could you check if ghost has exposed services?",
    'Assess "ghost" for vulnerabilities',
    "Assess internal-db and run an assessment on ‘ghost’",
  ])
    assert.ok(planRequest(text, s, "r", "d").error, text);
  assert.ok(resolveAgent("Assess internal", s.agents, s.selected).error);
  s = r(s, { type: "CREATE", id: "b", name: "alpha", description: "" });
  assert.ok(
    resolveAgent("Assess internal-db and alpha", s.agents, s.selected)
      .ambiguous,
  );
  assert.ok(resolveAgent("Assess my agent", s.agents, s.selected).ambiguous);
  assert.equal(
    resolveAgent("Assess INTERNAL-DB", s.agents, s.selected).agent.id,
    "a",
  );
  assert.match(planRequest("Assess alpha", s, "r", "d").error, /created/);
  s = r(s, { type: "OFFLINE", agentId: "a" });
  assert.match(planRequest("Assess internal-db", s, "r", "d").error, /offline/);
  for (const text of [
    "nmap example.com",
    "exploit internal-db",
    "scan 10.0.0.1",
    "assess https://example.com",
  ])
    assert.match(planRequest(text, s, "r", "d").error, /not supported/);
});
test("polite requests resolve exact names and unsupported procedures do not create plans", () => {
  const s = ready();
  for (const text of [
    "Please assess internal-db for critical vulnerabilities",
    "Check whether internal-db has dangerous misconfigurations",
    'Can you assess "internal-db"?',
    "Check packages on internal-db",
    "Evaluate services on internal-db",
  ]) {
    const result = planRequest(text, s, "r", "d");
    assert.equal(result.proposal?.agentId, "a", text);
  }
  for (const text of [
    "Assess internal-db for Windows registry issues",
    "Run a Kubernetes cluster assessment on internal-db",
    "Run a source code audit on internal-db",
  ]) {
    const result = planRequest(text, s, "r", "d");
    assert.match(result.error, /not supported/);
    assert.equal(result.proposal, undefined);
    const next = r(s, { type: "PROMPT", text, id: "r", date: "d" });
    assert.equal(next.proposal, null);
    assert.equal(next.assessments.length, 0);
  }
});
test("custom names, duplicate protection, rename snapshot, delete and reset", () => {
  for (const name of ["x", "2alpha", "alpha space"])
    assert.ok(validateName(name, []));
  assert.equal(validateName("ethereum-node", []), "");
  let s = ready();
  s = r(s, {
    type: "CREATE",
    id: "duplicate",
    name: "INTERNAL-DB",
    description: "",
  });
  assert.equal(s.agents.length, 1);
  s = run(s);
  s = r(s, { type: "RENAME", name: "finance-server" });
  assert.equal(s.agents[0].name, "finance-server");
  assert.equal(s.assessments[0].agentName, "internal-db");
  s = r(s, { type: "DELETE", id: "a" });
  assert.equal(s.assessments.length, 0);
  assert.deepEqual(r(s, { type: "RESET" }), initialState());
});
test("deployment and execution failures, retry, pause and offline", () => {
  let s = ready();
  s = r(s, { type: "DEPLOY", failure: "Enrollment interrupted" });
  for (let i = 0; i < 2; i++) s = r(s, { type: "DEPLOY_TICK", agentId: "a" });
  assert.equal(s.agents[0].status, "Deployment failed");
  s = r(s, { type: "DEPLOY" });
  for (let i = 0; i < 4; i++) s = r(s, { type: "DEPLOY_TICK", agentId: "a" });
  s = run(s, "Assess internal-db", "interrupted");
  assert.equal(s.assessments[0].status, "failed");
  assert.equal(s.assessments[0].findings.length, 0);
  s = r(s, { type: "RUN_CONTROL", id: "report", action: "retry" });
  s = r(s, { type: "RUN_CONTROL", id: "report", action: "pause" });
  assert.equal(
    r(s, { type: "EXEC_TICK", id: "report" }).assessments[0].phase,
    s.assessments[0].phase,
  );
  s = r(s, { type: "RUN_CONTROL", id: "report", action: "resume" });
  s = r(s, { type: "OFFLINE", agentId: "a" });
  assert.equal(s.assessments[0].status, "failed");
});
test("claim bypass rejected; still present and inconclusive remain unresolved", () => {
  for (const outcome of ["present", "inconclusive"]) {
    let s = run(ready());
    const event = { type: "FINDING", reportId: "report", findingId: "db-auth" };
    s = r(s, { ...event, action: "retest", outcome: "resolved" });
    assert.equal(
      s.assessments[0].findings.find((f) => f.id === "db-auth").verification,
      "Not tested",
    );
    for (const action of ["mitigation", "claim", "retest", "result"])
      s = r(s, { ...event, action, outcome, date: "2026-01-02" });
    assert.equal(s.agents[0].resolved.length, 0);
    assert.equal(
      s.assessments[0].findings.find((f) => f.id === "db-auth").verification,
      outcome === "present" ? "Still present" : "Inconclusive",
    );
  }
});
test("severity thresholds, EPSS provenance, hardened fixtures and stable export", () => {
  for (const [n, label] of [
    [0, "Informational"],
    [0.1, "Low"],
    [3.9, "Low"],
    [4, "Medium"],
    [6.9, "Medium"],
    [7, "High"],
    [8.9, "High"],
    [9, "Critical"],
    [10, "Critical"],
  ])
    assert.equal(severity(n), label);
  const report = run(ready("cloud", "api", "api-prod"), "Assess api-prod")
    .assessments[0];
  const f = report.findings.find((f) => f.cve);
  assert.equal(f.cve, "CVE-2021-44228");
  assert.match(f.epss.provenance, /Invented/);
  assert.ok(
    report.findings.filter((f) => !f.cve).every((f) => f.epss === null),
  );
  assert.ok(
    selectFindings({ ...report, scenario: "hardened" }).every(
      (f) => f.score < 4,
    ),
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(reportDocument(report))),
    reportDocument(report),
  );
});
test("restoration pauses work, corrupt storage rejected, live adapter fails closed", () => {
  let s = ready();
  s = r(s, {
    type: "PROMPT",
    text: "Assess internal-db",
    id: "r",
    date: "2026-01-01",
  });
  s = r(s, { type: "APPROVE", date: "2026-01-01" });
  assert.equal(
    restoreSession({ getItem: () => JSON.stringify(s) }).assessments[0].status,
    "paused",
  );
  assert.deepEqual(restoreSession({ getItem: () => "{" }), initialState());
  assert.deepEqual(
    restoreSession({ getItem: () => JSON.stringify({ version: 1 }) }),
    initialState(),
  );
  assert.throws(() => operationalAdapter(), /unavailable/);
});
test("unknown target clears stale approval and selected report follows the named agent", () => {
  let s = run(ready());
  s = r(s, {
    type: "PROMPT",
    text: "Assess internal-db",
    id: "next",
    date: "2026-01-02",
  });
  assert.ok(s.proposal);
  s = r(s, {
    type: "PROMPT",
    text: "Assess internal-db and ghost",
    id: "bad",
    date: "2026-01-02",
  });
  assert.equal(s.proposal, null);
  assert.match(s.messages.at(-1).text, /cannot find/);
  s = r(s, { type: "CREATE", id: "b", name: "beta", description: "" });
  assert.equal(s.reportId, null);
  s = r(s, { type: "DEPLOY" });
  for (let i = 0; i < 4; i++) s = r(s, { type: "DEPLOY_TICK", agentId: "b" });
  s = r(s, {
    type: "PROMPT",
    text: "Assess internal-db",
    id: "second",
    date: "2026-01-02",
  });
  assert.equal(s.selected, "a");
  assert.equal(s.reportId, "report");
  s = r(s, {
    type: "PROMPT",
    text: "Assess beta",
    id: "third",
    date: "2026-01-02",
  });
  assert.equal(s.selected, "b");
  assert.equal(s.reportId, null);
});
test("EPSS is never inferred for configurations; retest knowledge affects only its own agent", () => {
  let s = run(ready());
  assert.match(
    planRequest("Show highest exploitation likelihood", s, "q", "d").answer,
    /cannot be ranked/,
  );
  const event = { type: "FINDING", reportId: "report", findingId: "db-auth" };
  for (const action of ["mitigation", "claim", "retest", "result"])
    s = r(s, { ...event, action, outcome: "resolved", date: "2026-01-02" });
  const next = planRequest(
    "Assess internal-db for configuration risks",
    s,
    "next",
    "2026-01-02",
  ).proposal;
  assert.equal(
    selectFindings(next, s.agents[0].resolved).find((f) => f.id === "db-auth")
      .verification,
    "Verified Resolved",
  );
  assert.equal(
    selectFindings(next, []).find((f) => f.id === "db-auth").verification,
    "Not tested",
  );
  assert.ok(selectFindings(next).every((f) => f.service));
});
