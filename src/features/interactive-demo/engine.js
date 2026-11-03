import {
  fixtures,
  profiles,
  procedures,
  profileKeys,
  providers,
  deploymentSteps,
  executionSteps,
} from "./data.js";
export const NOTICE = "Interactive Simulation — No real systems are assessed.";
export const VERSION = 1;
export const initialState = () => ({
  version: VERSION,
  environment: null,
  agents: [],
  selected: null,
  assessments: [],
  reportId: null,
  messages: [],
  proposal: null,
  view: "environment",
  guided: true,
  error: "",
});
export const uid = () => crypto.randomUUID();
export const severity = (score) =>
  score >= 9
    ? "Critical"
    : score >= 7
      ? "High"
      : score >= 4
        ? "Medium"
        : score > 0
          ? "Low"
          : "Informational";
export function validateName(name, agents, except) {
  if (!/^[a-zA-Z][a-zA-Z0-9_-]{1,31}$/.test(name))
    return "Use 2–32 characters, starting with a letter; letters, numbers, hyphens and underscores only.";
  if (
    agents.some(
      (a) => a.id !== except && a.name.toLowerCase() === name.toLowerCase(),
    )
  )
    return "An agent with this name already exists.";
  return "";
}
export function validEnvironment(e) {
  return (
    e &&
    ["onprem", "cloud"].includes(e.mode) &&
    profileKeys(e.mode).includes(e.profile) &&
    typeof e.name === "string" &&
    e.name.trim().length > 0 &&
    e.name.length <= 60 &&
    (e.mode !== "cloud" || providers.includes(e.provider))
  );
}
export const capabilities = (env) =>
  Object.keys(procedures).filter((p) => p !== "cloud" || env.mode === "cloud");
const escaped = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export function resolveAgent(prompt, agents, selected) {
  const lower = prompt.toLowerCase();
  const matches = agents.filter((a) =>
    new RegExp(
      `(^|[^a-z0-9_-])${escaped(a.name.toLowerCase())}($|[^a-z0-9_-])`,
    ).test(lower),
  );
  // Explicit names must be checked even when another valid name also occurs.
  const candidates = [
    ...lower.matchAll(
      /(?:\bagent\s+(?:named\s+)?|\bon\s+|\bfor\s+agent\s+)["'“‘]?([a-z][a-z0-9_-]*)/g,
    ),
  ].map((m) => m[1]);
  for (const direct of lower.matchAll(
    /\b(?:assess|check|evaluate|scan)\s+(?:(?:whether|if)\s+)?["'“‘]?([a-z][a-z0-9_-]*)/g,
  )) candidates.push(direct[1]);
  for (const m of lower.matchAll(/\band\s+(?:agent\s+)?([a-z][a-z0-9_-]*)/g)) {
    if (
      matches.length &&
      ![
        "configuration",
        "package",
        "packages",
        "software",
        "service",
        "services",
        "cloud",
        "prioritize",
        "prioritise",
        "security",
        "known",
        "check",
        "report",
        "show",
        "misconfiguration",
        "misconfigurations",
        "vulnerabilities",
        "exposed",
      ].includes(m[1])
    )
      candidates.push(m[1]);
  }
  const generic = [
    "my",
    "the",
    "a",
    "an",
    "all",
    "this",
    "critical",
    "high",
    "security",
    "whether",
    "configuration",
    "configurations",
    "packages",
    "software",
    "services",
    "inventory",
    "permissions",
    "network",
    "exposed",
    "linux",
    "ubuntu",
    "cloud",
    "vulnerabilities",
    "after",
    "me",
    "it",
    "is",
    "has",
    "for",
  ];
  const unknown = candidates.find(
    (n) =>
      !generic.includes(n) && !agents.some((a) => a.name.toLowerCase() === n),
  );
  if (unknown)
    return {
      error: `I cannot find agent “${unknown}”. Available agents: ${agents.map((a) => a.name).join(", ") || "none"}. No target was substituted.`,
    };
  if (matches.length > 1)
    return {
      error:
        "This request names multiple agents. Choose one target, then send a request using its exact name.",
      ambiguous: true,
    };
  const agent =
    matches[0] ||
    (agents.length === 1 ? agents[0] : agents.find((a) => a.id === selected));
  if (!agent)
    return {
      error:
        "Choose a target agent first. Available agents: " +
        (agents.map((a) => a.name).join(", ") || "none"),
      ambiguous: true,
    };
  if (
    !matches.length &&
    agents.length > 1 &&
    /my agent|my server|my cloud|my ubuntu|all agents/.test(lower)
  )
    return {
      error:
        "Several agents could match. Choose a target below and name it explicitly in your request.",
      ambiguous: true,
    };
  return { agent };
}
export function planRequest(prompt, state, id, date) {
  if (
    /\b(exploit|attack|brute.?force|nmap|shell|execute command|curl|scan\s+https?:|delete files)\b|\b\d{1,3}(?:\.\d{1,3}){3}\b|https?:\/\//i.test(
      prompt,
    )
  )
    return {
      error:
        "This public simulation supports configuration, service, software and cloud-policy reviews only. Arbitrary commands, external targets and exploitation are not supported.",
    };
  const resolved = resolveAgent(prompt, state.agents, state.selected);
  if (resolved.error) return resolved;
  const agent = resolved.agent;
  if (agent.status !== "Online")
    return {
      error: `${agent.name} is ${agent.status.toLowerCase()}. Reconnect it in Deployment before requesting an assessment.`,
      agent,
    };
  if (/windows registry|active directory|wireless audit|wi-fi audit|kubernetes cluster|source.code audit|sql injection|penetration test/i.test(prompt))
    return {
      error: `That assessment procedure is not supported for ${agent.name} in this demo. Choose Linux configuration, exposed services, software inventory${agent.environment.mode === "cloud" ? ", or cloud-policy review" : ""}. No assessment has been started.`,
      agent,
    };
  const report = [...state.assessments]
    .reverse()
    .find((r) => r.agentId === agent.id && r.status === "complete");
  if (
    /fix first|prioriti[sz]e|highest|likelihood|explain|retest|remediat/i.test(
      prompt,
    ) &&
    !/assess|run|check|evaluate/i.test(prompt)
  ) {
    if (!report)
      return {
        answer: `${agent.name} has no completed assessment. Ask me to assess it first.`,
        agent,
      };
    const open = report.findings.filter(
      (f) => f.verification !== "Verified Resolved" && f.score > 0,
    );
    const byLikelihood = /likelihood|epss/i.test(prompt);
    if (byLikelihood && !open.some((f) => f.epss))
      return {
        agent,
        reportId: report.id,
        answer: `${agent.name} has no unresolved CVE findings with EPSS data. Configuration observations cannot be ranked by exploitation probability. Review severity, exposure and business context in the report.`,
      };
    const ranked = [...open].sort(
      /likelihood|epss/i.test(prompt)
        ? (a, b) => (b.epss?.probability ?? -1) - (a.epss?.probability ?? -1)
        : (a, b) => b.score - a.score,
    );
    return {
      agent,
      reportId: report.id,
      answer: /retest|remediat/i.test(prompt)
        ? `Open a finding in ${agent.name}’s report, inspect its mitigation, claim it applied, and request a simulated retest. A claim alone does not resolve a finding.`
        : ranked[0]
          ? `For ${agent.name}, review “${ranked[0].title}” first. ${ranked[0].impact} ${/likelihood|epss/i.test(prompt) ? "Only CVE fixtures have illustrative EPSS data; unscored configurations cannot be ranked by exploitation probability." : "Severity supports prioritization, but exposure and business context also matter."}`
          : "No unresolved actionable findings remain in this scoped simulation. This is not a clean bill of health.",
    };
  }
  if (
    !/assess|scan|check|evaluate|review|test|vulnerab|configuration|services|packages/i.test(
      prompt,
    )
  )
    return {
      answer: `I can prepare a scoped assessment for ${agent.name}, explain priorities from a completed report, or guide remediation and retesting. Try “Assess ${agent.name} for configuration and package risks.”`,
      agent,
    };
  let scope = [];
  if (/config|misconfig|hardening/i.test(prompt)) scope.push("configuration");
  if (/expos|service|port|network/i.test(prompt)) scope.push("services");
  if (/package|software|inventory|cve/i.test(prompt)) scope.push("packages");
  if (/permission|iam|cloud policy/i.test(prompt)) scope.push("cloud");
  if (!scope.length) scope = capabilities(agent.environment);
  if (scope.some((p) => !capabilities(agent.environment).includes(p)))
    return {
      error:
        "Cloud permission review is available only for a simulated cloud target.",
      agent,
    };
  return {
    agent,
    proposal: {
      id,
      agentId: agent.id,
      agentName: agent.name,
      environment: { ...agent.environment },
      objective: prompt,
      scope,
      priority: /critical/i.test(prompt) ? "Critical first" : "Severity first",
      scenario: "baseline",
      date,
      status: "proposed",
    },
  };
}
export function validatePlan(plan, state) {
  const agent = state.agents.find((a) => a.id === plan?.agentId);
  if (!agent || agent.status !== "Online")
    return "The selected agent must be online.";
  if (
    plan.agentName !== agent.name ||
    JSON.stringify(plan.environment) !== JSON.stringify(agent.environment)
  )
    return "The target identity changed. Request a fresh plan.";
  if (
    !Array.isArray(plan.scope) ||
    !plan.scope.length ||
    new Set(plan.scope).size !== plan.scope.length ||
    plan.scope.some((p) => !capabilities(agent.environment).includes(p))
  )
    return "Select at least one supported procedure.";
  if (!["baseline", "hardened"].includes(plan.scenario))
    return "Unsupported scenario.";
  if (plan.status !== "proposed")
    return "A new proposal and explicit approval are required.";
  return "";
}
const affectedServices = {
  ssh: "OpenSSH server",
  "db-auth": "PostgreSQL authentication",
  "db-listener": "PostgreSQL TCP 5432",
  "api-debug": "HTTPS diagnostics",
  "dev-listener": "Development debug console",
  docker: "Docker container runtime",
  screen: "Desktop session policy",
  "cloud-ingress": "Cloud management network policy",
  "cloud-role": "Workload storage role",
  log4j: "Apache Log4j Core 2.14.1",
  updates: "Operating system update scheduler",
  banner: "Service response headers",
  inventory: "Host inventory",
};
export function selectFindings(plan, resolved = []) {
  return fixtures
    .filter(
      (f) =>
        plan.scope.includes(f.check) &&
        (!f.mode || f.mode === plan.environment.mode) &&
        (f.roles.includes("*") || f.roles.includes(plan.environment.profile)),
    )
    .filter(
      (f) =>
        plan.scenario !== "hardened" || ["inventory", "banner"].includes(f.id),
    )
    .map((f) => ({
      ...f,
      severity: severity(f.score),
      service: affectedServices[f.id],
      asset: plan.environment.name,
      agentName: plan.agentName,
      cvssVersion: f.score > 0 ? "3.1" : null,
      scoreProvenance: f.cve
        ? "Apache published base score; synthetic asset evidence"
        : "Illustrative analyst base score, not a vendor rating",
      verification: resolved.includes(f.id)
        ? "Verified Resolved"
        : "Not tested",
      remediation: "Open",
      mitigationGenerated: false,
      retests: [],
      evidenceAfter: resolved.includes(f.id) ? f.verify : null,
      exploitability: "Not exploited; runtime exploitability unverified",
      synthetic: true,
    }));
}
export function mitigation(finding, report) {
  return {
    explanation: `${finding.title}. Observed on ${report.environment.name} (${profiles[report.environment.profile].os}): ${finding.evidence}`,
    impact: finding.impact,
    steps: finding.steps,
    operational: `${report.environment.mode === "cloud" ? `${report.environment.provider} example: coordinate workload and network-policy owners.` : "On-premises example: coordinate with the host and network owners."} ${finding.ops}`,
    verification: finding.verify,
    priority: `${finding.severity} severity (${finding.score.toFixed(1)} illustrative assessment). ${finding.score >= 7 ? "Schedule prompt review with the asset owner." : "Plan alongside the regular hardening cycle."} EPSS is separate from severity.`,
    residual:
      "A passing simulated check validates only this fixture. Unobserved dependencies, alternative paths and configuration drift remain outside this assessment.",
  };
}
export function mitigationReply(prompt, f, r) {
  if (/cannot|can't|unable|upgrade|alternative/i.test(prompt))
    return `If the primary fix for “${f.title}” is not possible, ${f.ops} Record an owner and an exception expiry. Restrict access to ${r.environment.name}; compensating controls do not establish resolution. Verify with: ${f.verify}`;
  if (/simple|plain|explain/i.test(prompt))
    return `In plain terms: ${f.impact} Start with this change: ${f.steps[0]} We observed: ${f.evidence}`;
  if (/verify|secure|test/i.test(prompt))
    return `${f.verify} Claiming a change is not proof. Run the simulated retest and review both evidence snapshots.`;
  if (/critical|priority|first|why/i.test(prompt))
    return `${f.title} is rated ${f.severity}: ${f.impact} ${f.cve ? "The published CVSS base score describes severity, not your specific environment’s exploitation likelihood." : "This is a configuration observation; CVE and EPSS are not applicable."}`;
  return `For “${f.title}”, the next step is: ${f.steps[0]} ${f.ops} Ask about verification, alternatives, or why the risk matters.`;
}
export function reportDocument(report) {
  return {
    title: "Illustrative Demo Report",
    notice: NOTICE,
    provenance:
      "Curated synthetic fixtures. No live assessment or threat-intelligence retrieval.",
    ...report,
    scopeLimitations:
      "Only approved fixture procedures and the selected target. No exploitation, external scanning, credentials, cloud API access, or assurance of real-system security.",
    mitigations: report.findings
      .filter((f) => f.mitigationGenerated)
      .map((f) => ({
        findingId: f.id,
        ...mitigation(f, report),
        remediation: f.remediation,
        verification: f.verification,
        retests: f.retests,
      })),
  };
}
const updateAgent = (s, id, fn) => ({
  ...s,
  agents: s.agents.map((a) => (a.id === id ? fn(a) : a)),
});
const updateReport = (s, id, fn) => ({
  ...s,
  assessments: s.assessments.map((r) => (r.id === id ? fn(r) : r)),
});
export function demoReducer(s, a) {
  const agent = s.agents.find((x) => x.id === (a.agentId || s.selected));
  switch (a.type) {
    case "RESET":
      return initialState();
    case "ENVIRONMENT":
      return validEnvironment(a.environment)
        ? {
            ...initialState(),
            environment: a.environment,
            guided: s.guided,
            view: "agents",
          }
        : { ...s, error: "Choose a valid environment and display name." };
    case "VIEW":
      return [
        "environment",
        "agents",
        "deployment",
        "assistant",
        "execution",
        "report",
      ].includes(a.view)
        ? { ...s, view: a.view, error: "" }
        : s;
    case "GUIDED":
      return { ...s, guided: !s.guided };
    case "CREATE": {
      const error = validateName(a.name, s.agents);
      if (error || !s.environment)
        return { ...s, error: error || "Choose an environment first." };
      return {
        ...s,
        agents: [
          ...s.agents,
          {
            id: a.id,
            name: a.name,
            description: a.description.slice(0, 160),
            environment: { ...s.environment },
            status: "Created",
            deploymentIndex: 0,
            deploymentRunning: false,
            deploymentFailure: "none",
            deploymentLog: [],
            resolved: [],
          },
        ],
        selected: a.id,
        reportId: null,
        proposal: null,
        view: "deployment",
        error: "",
      };
    }
    case "SELECT":
      return s.agents.some((x) => x.id === a.id)
        ? {
            ...s,
            selected: a.id,
            proposal: null,
            reportId:
              [...s.assessments].reverse().find((r) => r.agentId === a.id)
                ?.id || null,
            error: "",
          }
        : s;
    case "RENAME": {
      if (
        !agent ||
        agent.deploymentRunning ||
        s.assessments.some(
          (r) =>
            r.agentId === agent.id && ["running", "paused"].includes(r.status),
        )
      )
        return { ...s, error: "Finish or cancel active work before renaming." };
      const error = validateName(a.name, s.agents, agent.id);
      if (error) return { ...s, error };
      return {
        ...updateAgent(s, agent.id, (x) => ({ ...x, name: a.name })),
        proposal: null,
        error: "",
      };
    }
    case "DELETE":
      return {
        ...s,
        agents: s.agents.filter((x) => x.id !== a.id),
        assessments: s.assessments.filter((r) => r.agentId !== a.id),
        selected: s.selected === a.id ? null : s.selected,
        reportId: null,
        proposal: null,
        view: "agents",
      };
    case "OFFLINE":
      if (!agent) return s;
      return {
        ...updateAgent(s, agent.id, (x) => ({
          ...x,
          status: "Offline",
          deploymentRunning: false,
        })),
        proposal: null,
        assessments: s.assessments.map((r) =>
          r.agentId === agent.id && r.status === "running"
            ? {
                ...r,
                status: "failed",
                failure: "Agent went offline. Reconnect before retrying.",
              }
            : r,
        ),
      };
    case "DEPLOY":
      if (!agent || agent.deploymentRunning) return s;
      return updateAgent(s, agent.id, (x) => ({
        ...x,
        status: "Deployment Prepared",
        deploymentIndex: 1,
        deploymentRunning: true,
        deploymentFailure: a.failure || "none",
        deploymentLog: [
          `${x.name}: prepared illustrative session for ${x.environment.name}.`,
        ],
      }));
    case "DEPLOY_TICK": {
      if (!agent?.deploymentRunning) return s;
      const index = agent.deploymentIndex + 1;
      if (agent.deploymentFailure !== "none" && index === 3)
        return updateAgent(s, agent.id, (x) => ({
          ...x,
          deploymentRunning: false,
          status: "Deployment failed",
          deploymentLog: [
            ...x.deploymentLog,
            `${x.deploymentFailure}. No enrollment completed. Retry this illustrative session.`,
          ],
        }));
      return updateAgent(s, agent.id, (x) => ({
        ...x,
        deploymentIndex: index,
        status: deploymentSteps[index],
        deploymentRunning: index < 5,
        deploymentLog: [
          ...x.deploymentLog,
          `${x.name} → ${index === 2 ? "Illustrative files installed" : index === 3 ? "Simulated enrollment and identity authentication" : index === 4 ? "Outbound encrypted control-plane link established (simulated)" : "Online. Simulated heartbeat acknowledged"}.`,
        ],
      }));
    }
    case "PROMPT": {
      const result = planRequest(a.text, s, a.id, a.date);
      return {
        ...s,
        selected: result.agent?.id || s.selected,
        proposal: result.proposal || null,
        reportId:
          result.reportId ||
          (result.agent
            ? [...s.assessments]
                .reverse()
                .find((r) => r.agentId === result.agent.id)?.id || null
            : s.reportId),
        error: "",
        messages: [
          ...s.messages,
          { id: a.id + "u", role: "user", text: a.text },
          {
            id: a.id + "a",
            role: "assistant",
            text:
              result.error ||
              result.answer ||
              `${result.agent.name} is online. I recommend a scoped review based on its ${profiles[result.agent.environment.profile].role.toLowerCase()} role and your objective. Review the plan below; nothing starts before approval.`,
            ambiguous: result.ambiguous,
          },
        ],
      };
    }
    case "SCOPE":
      return s.proposal
        ? { ...s, proposal: { ...s.proposal, scope: a.scope }, error: "" }
        : s;
    case "SCENARIO":
      return s.proposal
        ? { ...s, proposal: { ...s.proposal, scenario: a.scenario } }
        : s;
    case "CANCEL_PLAN":
      return {
        ...s,
        proposal: null,
        messages: [
          ...s.messages,
          {
            id: a.id,
            role: "assistant",
            text: "Proposal cancelled. No assessment was started.",
          },
        ],
      };
    case "APPROVE": {
      const error = validatePlan(s.proposal, s);
      if (error) return { ...s, error };
      if (s.assessments.some((r) => ["running", "paused"].includes(r.status)))
        return {
          ...s,
          error: "Finish or cancel the current assessment first.",
        };
      const r = {
        ...s.proposal,
        status: "running",
        phase: 0,
        approvedAt: a.date,
        failureMode: a.failure || "none",
        findings: [],
        log: [
          `Approved: ${s.proposal.scope.map((p) => procedures[p].name).join(", ")}`,
        ],
      };
      return {
        ...s,
        assessments: [...s.assessments, r],
        reportId: r.id,
        proposal: null,
        view: "execution",
        error: "",
      };
    }
    case "EXEC_TICK": {
      const r = s.assessments.find((r) => r.id === a.id);
      if (!r || r.status !== "running") return s;
      const target = s.agents.find((x) => x.id === r.agentId);
      if (target?.status !== "Online")
        return updateReport(s, r.id, (x) => ({
          ...x,
          status: "failed",
          failure: "Agent offline. Reconnect before retrying.",
        }));
      const phase = r.phase + 1;
      if (r.failureMode !== "none" && phase === 4)
        return updateReport(s, r.id, (x) => ({
          ...x,
          status: "failed",
          failure:
            "Evidence collection interrupted. No partial result is presented as complete.",
        }));
      const done = phase === executionSteps.length - 1;
      const next = updateReport(s, r.id, (x) => ({
        ...x,
        phase,
        status: done ? "complete" : "running",
        completedAt: done ? a.date : null,
        findings: done ? selectFindings(r, target.resolved) : [],
        log: [
          ...x.log,
          `${phase < 4 ? "RADVOT → " + r.agentName : r.agentName + " → RADVOT"}: ${executionSteps[phase]} (simulated).`,
        ],
      }));
      return {
        ...next,
        view:
          done && s.reportId === r.id && s.view === "execution"
            ? "report"
            : s.view,
      };
    }
    case "RUN_CONTROL":
      return updateReport(s, a.id, (r) => {
        if (
          a.action === "retry" &&
          !s.assessments.some(
            (other) =>
              other.id !== r.id && ["running", "paused"].includes(other.status),
          ) &&
          r.status === "failed" &&
          s.agents.find((x) => x.id === r.agentId)?.status === "Online"
        )
          return {
            ...r,
            status: "running",
            failureMode: "none",
            failure: null,
          };
        if (a.action === "pause" && r.status === "running")
          return { ...r, status: "paused" };
        if (a.action === "resume" && r.status === "paused")
          return { ...r, status: "running" };
        if (
          a.action === "cancel" &&
          ["running", "paused", "failed"].includes(r.status)
        )
          return { ...r, status: "cancelled" };
        return r;
      });
    case "REPORT": {
      const r = s.assessments.find((x) => x.id === a.id);
      return r
        ? {
            ...s,
            reportId: r.id,
            selected: r.agentId,
            proposal: null,
            view: r.status === "complete" ? "report" : "execution",
          }
        : s;
    }
    case "FINDING": {
      const r = s.assessments.find((x) => x.id === a.reportId);
      const f = r?.findings.find((x) => x.id === a.findingId);
      if (!r || r.status !== "complete" || !f) return s;
      if (
        a.action === "retest" &&
        (f.remediation !== "Remediation Claimed" ||
          f.verification === "Retest Pending" ||
          s.agents.find((x) => x.id === r.agentId)?.status !== "Online")
      )
        return {
          ...s,
          error:
            "Claim the mitigation and reconnect the agent before retesting.",
        };
      let next = updateReport(s, r.id, (x) => ({
        ...x,
        findings: x.findings.map((y) => {
          if (y.id !== f.id) return y;
          if (a.action === "mitigation")
            return { ...y, mitigationGenerated: true };
          if (
            a.action === "claim" &&
            y.mitigationGenerated &&
            y.verification !== "Retest Pending" &&
            y.verification !== "Verified Resolved"
          )
            return { ...y, remediation: "Remediation Claimed" };
          if (
            a.action === "retest" &&
            ["resolved", "present", "inconclusive"].includes(a.outcome)
          )
            return {
              ...y,
              verification: "Retest Pending",
              pendingOutcome: a.outcome,
            };
          if (a.action === "result" && y.verification === "Retest Pending") {
            const online =
              s.agents.find((z) => z.id === r.agentId)?.status === "Online";
            const status = !online
              ? "Inconclusive"
              : y.pendingOutcome === "resolved"
                ? "Verified Resolved"
                : y.pendingOutcome === "present"
                  ? "Still present"
                  : "Inconclusive";
            const after =
              status === "Verified Resolved"
                ? y.verify
                : status === "Still present"
                  ? y.evidence
                  : "Evidence unavailable. No conclusion can be drawn.";
            return {
              ...y,
              verification: status,
              evidenceAfter: after,
              pendingOutcome: null,
              retests: [
                ...y.retests,
                { date: a.date, status, before: y.evidence, after },
              ],
            };
          }
          return y;
        }),
      }));
      if (a.action === "result") {
        const passed =
          next.assessments
            .find((x) => x.id === r.id)
            .findings.find((x) => x.id === f.id).verification ===
          "Verified Resolved";
        next = updateAgent(next, r.agentId, (x) => ({
          ...x,
          resolved: passed
            ? [...new Set([...x.resolved, f.id])]
            : x.resolved.filter((id) => id !== f.id),
        }));
      }
      return { ...next, error: "" };
    }
    default:
      return s;
  }
}
export function restoreSession(storage) {
  try {
    const s = JSON.parse(storage.getItem("radvot-demo-v1"));
    if (
      s?.version !== VERSION ||
      !Array.isArray(s.agents) ||
      !Array.isArray(s.assessments) ||
      !Array.isArray(s.messages) ||
      !validEnvironment(s.environment)
    )
      return initialState();
    if (
      s.agents.some(
        (a) =>
          !validEnvironment(a.environment) ||
          validateName(a.name, [], null) ||
          !Array.isArray(a.resolved) ||
          !Array.isArray(a.deploymentLog),
      )
    )
      return initialState();
    if (
      s.assessments.some(
        (r) =>
          !Array.isArray(r.scope) ||
          !Array.isArray(r.findings) ||
          !Array.isArray(r.log) ||
          !validEnvironment(r.environment) ||
          r.scope.some((p) => !procedures[p]) ||
          r.findings.some(
            (f) =>
              !Array.isArray(f.retests) || !fixtures.some((x) => x.id === f.id),
          ),
      )
    )
      return initialState();
    return {
      ...initialState(),
      ...s,
      agents: s.agents.map((a) =>
        a.deploymentRunning
          ? {
              ...a,
              deploymentRunning: false,
              status: "Deployment failed",
              deploymentLog: [
                ...a.deploymentLog,
                "Session restored: retry interrupted deployment.",
              ],
            }
          : a,
      ),
      assessments: s.assessments.map((r) => ({
        ...r,
        status: r.status === "running" ? "paused" : r.status,
        findings: r.findings.map((f) =>
          f.verification === "Retest Pending"
            ? {
                ...f,
                verification: "Inconclusive",
                pendingOutcome: null,
                evidenceAfter: "Retest interrupted by session reload.",
              }
            : f,
        ),
      })),
      error: "",
    };
  } catch {
    return initialState();
  }
}
