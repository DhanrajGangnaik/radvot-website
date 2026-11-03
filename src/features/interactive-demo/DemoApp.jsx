import React, { useEffect, useRef, useReducer, useState } from "react";
import {
  profiles,
  profileKeys,
  providers,
  procedures,
  severities,
  deploymentSteps,
  executionSteps,
} from "./data.js";
import {
  NOTICE,
  demoReducer,
  restoreSession,
  uid,
  capabilities,
  mitigation,
  mitigationReply,
  reportDocument,
} from "./engine.js";
import "./demo.css";
const now = () => new Date().toISOString();
const date = (s) => (s ? new Date(s).toLocaleString() : "—");
const pct = (n) => (n == null ? "Not applicable" : `${(n * 100).toFixed(1)}%`);
const navigation = [
  ["environment", "01", "Environment"],
  ["agents", "02", "Agents"],
  ["deployment", "03", "Deployment"],
  ["assistant", "04", "RADVOT AI"],
  ["execution", "05", "Execution"],
  ["report", "06", "Findings"],
];
function Icon({ name = "shield" }) {
  const paths = {
    shield: "M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7l-9-4M8 12l3 3 5-6",
    cloud: "M7 18h11a4 4 0 0 0 0-8 6 6 0 0 0-12-1 4.5 4.5 0 0 0 1 9",
    server: "M4 3h16v7H4zM4 14h16v7H4zM7 6h2M7 17h2",
    spark: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z",
    arrow: "M4 12h16m-6-6 6 6-6 6",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.shield} />
    </svg>
  );
}
function Button({ children, secondary = false, ...props }) {
  return (
    <button
      className={`rd-button ${secondary ? "rd-secondary" : ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
function Badge({ children, tone = "" }) {
  return (
    <span className={`rd-badge ${tone.toLowerCase().replaceAll(" ", "-")}`}>
      {children}
    </span>
  );
}
function Empty({ title, children, action, onAction }) {
  return (
    <div className="rd-empty">
      <Icon name="spark" />
      <h2>{title}</h2>
      <p>{children}</p>
      {action && (
        <Button onClick={onAction}>
          {action} <Icon name="arrow" />
        </Button>
      )}
    </div>
  );
}
function Modal({ title, onClose, children, wide = false }) {
  const ref = useRef();
  useEffect(() => {
    const focus = document.activeElement;
    ref.current.showModal();
    return () => {
      if (focus?.isConnected) focus.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`rd-dialog ${wide ? "rd-wide" : ""}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="rd-dialog-title"
    >
      <div className="rd-dialog-head">
        <div>
          <span className="rd-kicker">RADVOT / SIMULATION</span>
          <h2 id="rd-dialog-title">{title}</h2>
        </div>
        <button
          className="rd-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
function Topology({ environment, agent, running = false }) {
  const cloud = environment?.mode === "cloud",
    online = agent?.status === "Online";
  return (
    <div
      className={`rd-topology ${cloud ? "rd-cloud" : "rd-prem"} ${online ? "rd-linked" : ""} ${running ? "rd-working" : ""}`}
    >
      <div className="rd-topo-caption">
        <span>
          {cloud
            ? environment.provider + " / VIRTUAL PRIVATE NETWORK"
            : "ORGANIZATION / PRIVATE NETWORK"}
        </span>
        <Badge tone={online ? "low" : ""}>
          {online ? "Link established" : "Isolated simulation"}
        </Badge>
      </div>
      <svg
        className="rd-connections"
        viewBox="0 0 720 220"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M140 110H360H580M360 110V35H580M360 110V185H580" />
        <path className="rd-signal" d="M140 110H580" />
      </svg>
      <div className="rd-topo-node rd-control">
        <div className="rd-orb">
          <Icon name="shield" />
        </div>
        <strong>RADVOT</strong>
        <small>Control plane</small>
      </div>
      <div className="rd-link-label">
        <span className="rd-dot" />
        {online ? "Outbound secure link" : "Awaiting connection"}
        <small>Identity · scope · approval</small>
      </div>
      <div className="rd-topo-node rd-target">
        <div className="rd-target-icon">
          <Icon name={cloud ? "cloud" : "server"} />
        </div>
        <strong>{agent?.name || "Your agent"}</strong>
        <small>{environment?.name || "Choose your target"}</small>
        <span className="rd-status">{agent?.status || "Not created"}</span>
      </div>
      <span className="rd-satellite rd-satellite-top">
        {cloud ? "Policy boundary" : "Network boundary"}
      </span>
      <span className="rd-satellite rd-satellite-bottom">
        {environment
          ? profiles[environment.profile].services
          : "Synthetic evidence only"}
      </span>
    </div>
  );
}
function Environment({ state, dispatch, confirm }) {
  const [draft, setDraft] = useState(
    state.environment || {
      mode: "onprem",
      profile: "linux",
      provider: "AWS",
      name: "Atlas Linux host",
    },
  );
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const mode = (m) =>
    setDraft((d) => ({
      ...d,
      mode: m,
      profile: profileKeys(m).includes(d.profile) ? d.profile : "linux",
    }));
  const save = () => {
    const environment = { ...draft, name: draft.name.trim() };
    const go = () => dispatch({ type: "ENVIRONMENT", environment });
    if (
      state.agents.length &&
      JSON.stringify(environment) !== JSON.stringify(state.environment)
    )
      confirm(
        "Change deployment environment?",
        "This replaces the current environment and removes its agents, conversations and reports. Export anything you want to keep first.",
        go,
      );
    else if (JSON.stringify(environment) === JSON.stringify(state.environment))
      dispatch({ type: "VIEW", view: "agents" });
    else go();
  };
  return (
    <>
      <div className="rd-heading">
        <span className="rd-kicker">YOUR MISSION STARTS HERE</span>
        <h1>
          Where would you like
          <br />
          to deploy RADVOT?
        </h1>
        <p>
          Build your environment. Give your agent an identity.
          <br />
          Then put security intelligence to work.
        </p>
      </div>
      <div className="rd-mode-grid">
        {[
          [
            "onprem",
            "server",
            "On-Premises",
            "Your infrastructure. Your boundary.",
            "Organization-controlled servers and endpoints.",
          ],
          [
            "cloud",
            "cloud",
            "Cloud",
            "Your workloads. Connected intelligence.",
            "A simulated VM in your chosen cloud environment.",
          ],
        ].map(([m, icon, title, sub, body]) => (
          <button
            key={m}
            className={`rd-mode ${draft.mode === m ? "rd-chosen" : ""}`}
            aria-pressed={draft.mode === m}
            onClick={() => mode(m)}
          >
            <span className="rd-mode-visual">
              <Icon name={icon} />
              <i />
              <i />
            </span>
            <span className="rd-mode-title">
              {title}
              <span>{draft.mode === m ? "●" : "○"}</span>
            </span>
            <strong>{sub}</strong>
            <small>{body}</small>
          </button>
        ))}
      </div>
      <form
        className="rd-panel rd-environment-form"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div>
          <span className="rd-kicker">CONFIGURE YOUR TARGET</span>
          <h2>A little context goes a long way.</h2>
          <p>
            These choices determine the assessment procedures and evidence
            you’ll see.
          </p>
        </div>
        <div className="rd-form-grid">
          {draft.mode === "cloud" && (
            <label>
              Cloud provider
              <select
                value={draft.provider}
                onChange={(e) => set("provider", e.target.value)}
              >
                {providers.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
          )}
          <label>
            Target profile
            <select
              value={draft.profile}
              onChange={(e) => set("profile", e.target.value)}
            >
              {profileKeys(draft.mode).map((k) => (
                <option value={k} key={k}>
                  {profiles[k].label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Target display name
            <input
              required
              maxLength={60}
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Atlas Linux host"
            />
          </label>
        </div>
        <dl className="rd-context-grid">
          <div>
            <dt>OS</dt>
            <dd>{profiles[draft.profile].os}</dd>
          </div>
          <div>
            <dt>Example hostname</dt>
            <dd>{draft.profile}.demo.invalid</dd>
          </div>
          <div>
            <dt>Role & services</dt>
            <dd>
              {profiles[draft.profile].role}
              <small>{profiles[draft.profile].services}</small>
            </dd>
          </div>
          <div>
            <dt>Boundary</dt>
            <dd>
              {profiles[draft.profile].network}
              <small>
                {draft.mode === "cloud"
                  ? "Example tenant only. No provider connection."
                  : "Organization-controlled host only."}
              </small>
            </dd>
          </div>
        </dl>
        <div className="rd-actions">
          <span className="rd-muted">No IP address or credentials needed.</span>
          <Button type="submit">
            Continue to agents <Icon name="arrow" />
          </Button>
        </div>
      </form>
    </>
  );
}
function Agents({ state, dispatch, confirm }) {
  const [name, setName] = useState(""),
    [description, setDescription] = useState(""),
    [rename, setRename] = useState(null);
  if (!state.environment)
    return (
      <Empty
        title="Choose your environment first"
        action="Choose environment"
        onAction={() => dispatch({ type: "VIEW", view: "environment" })}
      >
        An agent belongs to one selected infrastructure boundary.
      </Empty>
    );
  return (
    <>
      <div className="rd-heading">
        <span className="rd-kicker">IDENTITY BEFORE ACTION</span>
        <h1>Your agents, under control.</h1>
        <p>
          Create one or several agents in {state.environment.name}. Each keeps
          its own history and verified remediation state.
        </p>
      </div>
      <div className="rd-two-column">
        <form
          className="rd-panel"
          onSubmit={(e) => {
            e.preventDefault();
            dispatch({
              type: "CREATE",
              id: uid(),
              name: name.trim(),
              description,
            });
          }}
        >
          <Icon name="spark" />
          <h2>Create an agent</h2>
          <label>
            Agent name
            <input
              required
              minLength={2}
              maxLength={32}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="alpha"
              aria-describedby="rd-name-rule"
            />
          </label>
          <small id="rd-name-rule">
            2–32 characters. Start with a letter; use letters, numbers, hyphens
            or underscores. Names must be unique, ignoring case.
          </small>
          <label>
            Description (optional)
            <textarea
              maxLength={160}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will this agent protect?"
            />
          </label>
          <Button type="submit">
            Create agent <Icon name="arrow" />
          </Button>
        </form>
        <section className="rd-panel">
          <h2>
            Agent directory{" "}
            <span className="rd-count">{state.agents.length}</span>
          </h2>
          {!state.agents.length && (
            <p>
              Your first agent will appear here. Try a name such as alpha,
              finance-server, or test-agent-01.
            </p>
          )}
          {state.agents.map((a) => (
            <article
              className={`rd-agent-card ${state.selected === a.id ? "rd-selected" : ""}`}
              key={a.id}
            >
              <div className="rd-actions">
                <button
                  className="rd-text-button"
                  onClick={() => dispatch({ type: "SELECT", id: a.id })}
                >
                  {a.name}
                </button>
                <Badge tone={a.status === "Online" ? "low" : ""}>
                  {a.status}
                </Badge>
              </div>
              <p>
                {a.description || "No description"} · {a.environment.name}
              </p>
              <details>
                <summary>Agent details & history</summary>
                <dl>
                  <dt>Demo identity</dt>
                  <dd className="rd-code">{a.id}</dd>
                  <dt>Environment</dt>
                  <dd>
                    {a.environment.mode === "cloud"
                      ? a.environment.provider
                      : "On-Premises"}{" "}
                    / {profiles[a.environment.profile].label}
                  </dd>
                </dl>
                {state.assessments
                  .filter((r) => r.agentId === a.id)
                  .map((r) => (
                    <button
                      key={r.id}
                      className="rd-history"
                      onClick={() => dispatch({ type: "REPORT", id: r.id })}
                    >
                      {date(r.date)} · {r.status} · {r.findings.length} findings
                    </button>
                  ))}
              </details>
              <div className="rd-button-row">
                <Button
                  secondary
                  onClick={() => {
                    dispatch({ type: "SELECT", id: a.id });
                    dispatch({ type: "VIEW", view: "deployment" });
                  }}
                >
                  Deploy / inspect
                </Button>
                <button onClick={() => setRename({ id: a.id, name: a.name })}>
                  Rename
                </button>
                <button
                  onClick={() =>
                    confirm(
                      `Delete ${a.name}?`,
                      "Its assessment history and remediation records will also be removed.",
                      () => dispatch({ type: "DELETE", id: a.id }),
                    )
                  }
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
      {rename && (
        <Modal title="Rename agent" onClose={() => setRename(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              dispatch({
                type: "RENAME",
                agentId: rename.id,
                name: rename.name.trim(),
              });
              setRename(null);
            }}
          >
            <p>
              Completed reports retain the identity recorded at assessment time.
              Pending proposals will be discarded.
            </p>
            <label>
              New agent name
              <input
                autoFocus
                required
                value={rename.name}
                maxLength={32}
                onChange={(e) => setRename({ ...rename, name: e.target.value })}
              />
            </label>
            <Button>Save name</Button>
          </form>
        </Modal>
      )}
    </>
  );
}
function Deployment({ state, agent, dispatch }) {
  const [failure, setFailure] = useState("none");
  if (!agent)
    return (
      <Empty
        title="Give your agent a name"
        action="Create agent"
        onAction={() => dispatch({ type: "VIEW", view: "agents" })}
      >
        A consistent identity connects every stage of the assessment.
      </Empty>
    );
  return (
    <>
      <div className="rd-heading">
        <span className="rd-kicker">ESTABLISH THE CONNECTION</span>
        <h1>Bring {agent.name} online.</h1>
        <p>
          An outbound connection links your{" "}
          {state.environment.mode === "cloud" ? "cloud VM" : "internal host"} to
          RADVOT. Walk through enrollment without installing anything.
        </p>
      </div>
      <Topology
        environment={agent.environment}
        agent={agent}
        running={agent.deploymentRunning}
      />
      <div className="rd-two-column">
        <section className="rd-panel">
          <h2>Deployment session</h2>
          <ol className="rd-lifecycle">
            {deploymentSteps.map((step, i) => (
              <li
                key={step}
                className={i <= agent.deploymentIndex ? "rd-done" : ""}
              >
                <span>{i < agent.deploymentIndex ? "✓" : i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <label>
            Deployment scenario
            <select
              disabled={agent.deploymentRunning}
              value={failure}
              onChange={(e) => setFailure(e.target.value)}
            >
              <option value="none">Successful enrollment</option>
              <option>Enrollment interrupted</option>
              <option>Connection unavailable</option>
            </select>
          </label>
          {agent.status === "Online" ? (
            <>
              <p className="rd-success">
                ● Online · simulated heartbeat acknowledged
              </p>
              <div className="rd-button-row">
                <Button
                  onClick={() => dispatch({ type: "VIEW", view: "assistant" })}
                >
                  Open RADVOT AI <Icon name="arrow" />
                </Button>
                <Button
                  secondary
                  onClick={() =>
                    dispatch({ type: "OFFLINE", agentId: agent.id })
                  }
                >
                  Simulate offline
                </Button>
              </div>
            </>
          ) : (
            <Button
              disabled={agent.deploymentRunning}
              onClick={() =>
                dispatch({
                  type: "DEPLOY",
                  agentId: agent.id,
                  failure:
                    agent.status === "Deployment failed" ? "none" : failure,
                })
              }
            >
              {agent.deploymentRunning
                ? "Deployment in progress…"
                : agent.status === "Deployment failed"
                  ? "Retry deployment"
                  : agent.status === "Offline"
                    ? "Reconnect agent"
                    : "Simulate Deployment"}
            </Button>
          )}
        </section>
        <section className="rd-terminal">
          <div className="rd-terminal-bar">
            <span>● ● ●</span> Illustrative deployment ·{" "}
            {profiles[agent.environment.profile].os}
          </div>
          <p className="rd-kicker">EXAMPLE GUIDANCE / NOT EXECUTABLE</p>
          <p>01 Obtain an approved signed agent release.</p>
          <p>
            02 Verify its signature and the control-plane trust configuration.
          </p>
          <p>
            03 Enroll within an authenticated, authorized deployment session.
          </p>
          <p>04 Permit the approved outbound connection.</p>
          <hr />
          <div role="log" aria-label="Deployment activity">
            {agent.deploymentLog.length ? (
              agent.deploymentLog.map((line, i) => (
                <p key={i}>
                  <span className="rd-terminal-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {line}
                </p>
              ))
            ) : (
              <p>
                Waiting for you to start the simulated session for {agent.name}.
              </p>
            )}
          </div>
          <small>
            No executable command, enrollment token, or software is supplied
            here.
          </small>
        </section>
      </div>
    </>
  );
}
function Proposal({ plan, dispatch }) {
  const [failure, setFailure] = useState("none");
  return (
    <section className="rd-proposal" aria-label="Assessment proposal">
      <div className="rd-actions">
        <span className="rd-kicker">ASSESSMENT PLAN / DECISION SUMMARY</span>
        <Badge>Approval required</Badge>
      </div>
      <h2>
        {plan.agentName}{" "}
        <span className="rd-muted">/ scoped security assessment</span>
      </h2>
      <p>{plan.objective}</p>
      <dl className="rd-context-grid">
        <div>
          <dt>Target</dt>
          <dd>
            {plan.environment.name} · {profiles[plan.environment.profile].label}
          </dd>
        </div>
        <div>
          <dt>Boundary</dt>
          <dd>One selected agent; synthetic evidence only.</dd>
        </div>
      </dl>
      <fieldset>
        <legend>Modify scope</legend>
        {capabilities(plan.environment).map((key) => (
          <label className="rd-check" key={key}>
            <input
              type="checkbox"
              checked={plan.scope.includes(key)}
              onChange={(e) =>
                dispatch({
                  type: "SCOPE",
                  scope: e.target.checked
                    ? [...plan.scope, key]
                    : plan.scope.filter((p) => p !== key),
                })
              }
            />
            <span>
              {procedures[key].name}
              <small>{procedures[key].evidence}</small>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="rd-form-grid">
        <label>
          Evidence scenario
          <select
            value={plan.scenario}
            onChange={(e) =>
              dispatch({ type: "SCENARIO", scenario: e.target.value })
            }
          >
            <option value="baseline">Baseline — discover risks</option>
            <option value="hardened">Hardened — reduced exposure</option>
          </select>
        </label>
        <label>
          Execution scenario
          <select value={failure} onChange={(e) => setFailure(e.target.value)}>
            <option value="none">Normal completion</option>
            <option value="interrupted">Interrupt evidence collection</option>
          </select>
        </label>
      </div>
      <p className="rd-boundary">
        <strong>Excluded:</strong> exploitation, credential collection, real
        network probes, external targets and configuration changes.{" "}
        {plan.priority}; all selected checks remain in scope.
      </p>
      <div className="rd-button-row">
        <Button
          disabled={!plan.scope.length}
          onClick={() => dispatch({ type: "APPROVE", date: now(), failure })}
        >
          Approve Assessment <Icon name="arrow" />
        </Button>
        <Button
          secondary
          onClick={() => dispatch({ type: "CANCEL_PLAN", id: uid() })}
        >
          Cancel proposal
        </Button>
      </div>
    </section>
  );
}
function Assistant({ state, agent, dispatch }) {
  const [prompt, setPrompt] = useState("");
  const end = useRef();
  const send = (text) => {
    if (text.trim()) {
      dispatch({
        type: "PROMPT",
        text: text.trim().slice(0, 600),
        id: uid(),
        date: now(),
      });
      setPrompt("");
    }
  };
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [state.messages.length]);
  if (!agent)
    return (
      <Empty
        title="Meet your assessment partner"
        action="Create agent"
        onAction={() => dispatch({ type: "VIEW", view: "agents" })}
      >
        Create an agent, then tell RADVOT what you want to understand.
      </Empty>
    );
  return (
    <>
      <div className="rd-heading rd-compact">
        <span className="rd-kicker">RADVOT INTELLIGENCE</span>
        <h1>
          You set the objective.
          <br />
          RADVOT builds the plan.
        </h1>
        <p>Simulated demo assistant · intent-aware, deterministic responses.</p>
      </div>
      <div className="rd-chat" role="log" aria-label="RADVOT conversation">
        <article className="rd-message">
          <span className="rd-avatar">
            <Icon name="spark" />
          </span>
          <div>
            <strong>
              RADVOT AI <Badge>Simulated</Badge>
            </strong>
            <p>
              I can review configuration, services and software for your named
              agents. I’ll propose the scope and wait for your approval. What
              would you like to assess?
            </p>
          </div>
        </article>
        {state.messages.map((m) => (
          <article key={m.id} className={`rd-message rd-${m.role}`}>
            <span className="rd-avatar">
              {m.role === "user" ? "YOU" : <Icon name="spark" />}
            </span>
            <div>
              <strong>{m.role === "user" ? "You" : "RADVOT AI"}</strong>
              <p>{m.text}</p>
              {m.ambiguous && (
                <div className="rd-button-row">
                  {state.agents.map((a) => (
                    <Button
                      secondary
                      key={a.id}
                      onClick={() =>
                        send(`Assess ${a.name} for security vulnerabilities.`)
                      }
                    >
                      {a.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
        <div ref={end} />
      </div>
      {state.proposal && <Proposal plan={state.proposal} dispatch={dispatch} />}
      <div className="rd-prompt-suggestions">
        {[
          `Assess ${agent.name} for critical vulnerabilities.`,
          `Check ${agent.name} for dangerous misconfigurations.`,
          `Evaluate exposed services on ${agent.name}.`,
        ].map((t) => (
          <button key={t} onClick={() => send(t)}>
            {t}
          </button>
        ))}
      </div>
      <form
        className="rd-composer"
        onSubmit={(e) => {
          e.preventDefault();
          send(prompt);
        }}
      >
        <label className="rd-sr-only" htmlFor="rd-prompt">
          Message RADVOT AI
        </label>
        <textarea
          id="rd-prompt"
          maxLength={600}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Ask RADVOT about ${agent.name}…`}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(prompt);
            }
          }}
        />
        <Button disabled={!prompt.trim()}>
          Send <Icon name="arrow" />
        </Button>
      </form>
      <small>
        Enter to send · Shift+Enter for a new line · No model or external
        systems are connected.
      </small>
      {state.reportId && (
        <button
          className="rd-text-button"
          onClick={() => dispatch({ type: "REPORT", id: state.reportId })}
        >
          Open assessment activity / report →
        </button>
      )}
    </>
  );
}
function Execution({ state, dispatch, report }) {
  if (!report)
    return (
      <Empty
        title="An approved plan comes first"
        action="Plan with RADVOT AI"
        onAction={() => dispatch({ type: "VIEW", view: "assistant" })}
      >
        Tell RADVOT your objective, review the scope, and approve it before
        anything runs.
      </Empty>
    );
  const agent = state.agents.find((a) => a.id === report.agentId);
  return (
    <>
      <div className="rd-heading">
        <span className="rd-kicker">ASSESSMENT OPERATIONS</span>
        <h1>
          {report.status === "complete"
            ? "Evidence, ready for review."
            : `Working with ${report.agentName}.`}
        </h1>
        <p>{report.objective}</p>
      </div>
      <Topology
        agent={agent}
        environment={report.environment}
        running={report.status === "running"}
      />
      <div className="rd-actions rd-run-summary">
        <Badge>{report.status}</Badge>
        <span>
          {report.phase >= 4 ? report.scope.length : 0} / {report.scope.length}{" "}
          simulated checks collected
        </span>
        <span>{report.findings.length} findings published</span>
      </div>
      <progress max="7" value={report.phase} aria-label="Assessment progress" />
      <div className="rd-two-column">
        <section className="rd-panel">
          <h2>Execution timeline</h2>
          <ol className="rd-lifecycle">
            {executionSteps.map((step, i) => (
              <li key={step} className={i <= report.phase ? "rd-done" : ""}>
                <span>{i < report.phase ? "✓" : i + 1}</span>
                <div>
                  {step}
                  {i === report.phase && (
                    <small>
                      {report.status === "running"
                        ? "In progress"
                        : report.status}
                    </small>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <div className="rd-button-row">
            {report.status === "running" && (
              <Button
                secondary
                onClick={() =>
                  dispatch({
                    type: "RUN_CONTROL",
                    id: report.id,
                    action: "pause",
                  })
                }
              >
                Pause assessment
              </Button>
            )}
            {report.status === "paused" && (
              <Button
                onClick={() =>
                  dispatch({
                    type: "RUN_CONTROL",
                    id: report.id,
                    action: "resume",
                  })
                }
              >
                Resume assessment
              </Button>
            )}
            {report.status === "failed" && (
              <Button
                onClick={() =>
                  dispatch({
                    type: "RUN_CONTROL",
                    id: report.id,
                    action: "retry",
                  })
                }
              >
                Retry assessment
              </Button>
            )}
            {["running", "paused", "failed"].includes(report.status) && (
              <button
                onClick={() =>
                  dispatch({
                    type: "RUN_CONTROL",
                    id: report.id,
                    action: "cancel",
                  })
                }
              >
                Cancel run
              </button>
            )}
            {report.status === "complete" && (
              <Button
                onClick={() => dispatch({ type: "VIEW", view: "report" })}
              >
                Analyze findings
              </Button>
            )}
            {report.status === "cancelled" && (
              <Button
                onClick={() => dispatch({ type: "VIEW", view: "assistant" })}
              >
                Create another plan
              </Button>
            )}
          </div>
          {report.failure && (
            <p role="status" className="rd-warning">
              {report.failure}
            </p>
          )}
        </section>
        <section className="rd-panel">
          <h2>Approved procedures</h2>
          {report.scope.map((k) => (
            <details key={k}>
              <summary>{procedures[k].name}</summary>
              <p>{procedures[k].detail}</p>
              <p>Expected evidence: {procedures[k].evidence}</p>
            </details>
          ))}
          <h3>Activity log</h3>
          <div
            role="log"
            aria-label="Assessment activity"
            className="rd-activity"
          >
            {report.log.map((l, i) => (
              <p key={i}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {l}
              </p>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
function Metrics({ report }) {
  const active = report.findings.filter(
      (f) => f.verification !== "Verified Resolved",
    ),
    resolved = report.findings.length - active.length;
  return (
    <div className="rd-report-metrics">
      <div className="rd-score-circle">
        <strong>{active.filter((f) => f.score > 0).length}</strong>
        <span>open risks</span>
      </div>
      <div
        className="rd-severity-chart"
        aria-label="Unresolved severity distribution"
      >
        {severities.map((s) => {
          const count = active.filter((f) => f.severity === s).length;
          return (
            <div key={s}>
              <span>{s}</span>
              <div className="rd-bar">
                <i
                  className={s.toLowerCase()}
                  style={{
                    width: `${(count / Math.max(1, report.findings.length)) * 100}%`,
                  }}
                />
              </div>
              <b>{count}</b>
            </div>
          );
        })}
      </div>
      <div className="rd-metric-pair">
        <div>
          <strong>{report.scope.length}</strong>
          <span>completed checks</span>
        </div>
        <div>
          <strong>{resolved}</strong>
          <span>verified resolved</span>
        </div>
        <small>
          {report.findings.length} total observations · evidence available for
          all
        </small>
      </div>
    </div>
  );
}
function FindingDetails({ report, finding, dispatch, onClose, online, error }) {
  const [outcome, setOutcome] = useState("resolved"),
    [prompt, setPrompt] = useState(""),
    [answers, setAnswers] = useState([]);
  const action = (action, other = {}) =>
    dispatch({
      type: "FINDING",
      reportId: report.id,
      findingId: finding.id,
      action,
      ...other,
    });
  const strategy = mitigation(finding, report);
  return (
    <Modal title={finding.title} onClose={onClose} wide>
      <div className="rd-button-row">
        <Badge tone={finding.severity}>{finding.severity}</Badge>
        <Badge>{finding.verification}</Badge>
        <span>
          {finding.asset} / {finding.agentName}
        </span>
      </div>
      <p className="rd-boundary">
        Synthetic demonstration finding. No system was accessed or exploited.
      </p>
      <div className="rd-detail-grid">
        <section>
          <h3>What was observed</h3>
          <p>{finding.evidence}</p>
          <h3>Why it matters</h3>
          <p>{finding.impact}</p>
          <h3>Confidence & uncertainty</h3>
          <p>{finding.confidence}</p>
          <p>{finding.exploitability}</p>
        </section>
        <dl className="rd-intel-data">
          <dt>Affected service / package</dt>
          <dd>{finding.service}</dd>
          <dt>CVE</dt>
          <dd>{finding.cve || "Not applicable"}</dd>
          <dt>CVSS severity</dt>
          <dd>
            {finding.score > 0
              ? `${finding.score.toFixed(1)} / 10 · v${finding.cvssVersion}`
              : "Not applicable (informational)"}
          </dd>
          <dt>CVSS vector</dt>
          <dd className="rd-code">
            {finding.vector ||
              "Not supplied for this illustrative configuration rating"}
          </dd>
          <dt>Score provenance</dt>
          <dd>{finding.scoreProvenance}</dd>
          <dt>EPSS probability / percentile</dt>
          <dd>
            {pct(finding.epss?.probability)} / {pct(finding.epss?.percentile)}
          </dd>
          <dt>EPSS data date</dt>
          <dd>{finding.epss?.date || "Not applicable"}</dd>
          {finding.epss && (
            <>
              <dt>EPSS provenance</dt>
              <dd>{finding.epss.provenance}</dd>
            </>
          )}
        </dl>
      </div>
      <p className="rd-muted">
        CVSS describes severity. EPSS estimates exploitation in the wild over
        the next 30 days; it is not a severity score. Values shown here are
        illustrative, never live intelligence.
      </p>
      <div className="rd-button-row">
        <a href={finding.reference} target="_blank" rel="noreferrer">
          Relevant reference ↗
        </a>
        <a
          href="https://www.first.org/cvss/v3.1/specification-document"
          target="_blank"
          rel="noreferrer"
        >
          CVSS specification ↗
        </a>
        <a href="https://www.first.org/epss/" target="_blank" rel="noreferrer">
          About EPSS ↗
        </a>
      </div>
      <details>
        <summary>
          Supporting evidence · {procedures[finding.check].evidence}
        </summary>
        <pre>{finding.evidence}</pre>
        <p>
          Asset: {finding.asset} · observed in assessment {report.id} ·{" "}
          {date(report.completedAt)}
        </p>
      </details>
      {!finding.mitigationGenerated ? (
        <Button onClick={() => action("mitigation")}>
          Generate Mitigation Strategy <Icon name="spark" />
        </Button>
      ) : (
        <section className="rd-mitigation">
          <span className="rd-kicker">
            RADVOT / CONTEXTUAL SIMULATED GUIDANCE
          </span>
          <h2>From finding to a safer state.</h2>
          <h3>Explanation</h3>
          <p>{strategy.explanation}</p>
          <h3>Security impact</h3>
          <p>{strategy.impact}</p>
          <h3>Recommended remediation</h3>
          <ol>
            {strategy.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {[
            ["Operational considerations", strategy.operational],
            ["Verification", strategy.verification],
            ["Priority", strategy.priority],
            ["Residual risk", strategy.residual],
          ].map(([t, v]) => (
            <section key={t}>
              <h3>{t}</h3>
              <p>{v}</p>
            </section>
          ))}
          <div className="rd-followups">
            <h3>Ask about this finding</h3>
            {answers.map((a, i) => (
              <div key={i} className="rd-reply">
                <strong>{a.q}</strong>
                <p>{a.a}</p>
              </div>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (prompt.trim()) {
                  setAnswers([
                    ...answers,
                    { q: prompt, a: mitigationReply(prompt, finding, report) },
                  ]);
                  setPrompt("");
                }
              }}
            >
              <label>
                Mitigation follow-up
                <input
                  maxLength={400}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What if I cannot upgrade?"
                />
              </label>
              <Button secondary disabled={!prompt.trim()}>
                Ask about finding
              </Button>
            </form>
          </div>
          <div className="rd-retest">
            <h3>Verify the change</h3>
            {error && (
              <p role="alert" className="rd-error">
                {error}
              </p>
            )}
            {!online && (
              <p className="rd-warning">
                This agent is offline. Reconnect it in Deployment before
                requesting a retest.
              </p>
            )}
            <p>
              Claiming remediation does not resolve the finding. The selected
              synthetic verification outcome determines the result.
            </p>
            <Badge>{finding.remediation}</Badge>
            <div className="rd-button-row">
              <Button
                secondary
                disabled={
                  finding.remediation === "Remediation Claimed" ||
                  finding.verification === "Verified Resolved"
                }
                onClick={() => action("claim")}
              >
                Mark mitigation as simulated / applied
              </Button>
            </div>
            <label>
              Retest evidence scenario
              <select
                value={outcome}
                disabled={finding.verification === "Retest Pending"}
                onChange={(e) => setOutcome(e.target.value)}
              >
                <option value="resolved">
                  Updated evidence — fix verified
                </option>
                <option value="present">
                  Original evidence — still present
                </option>
                <option value="inconclusive">
                  Evidence unavailable — inconclusive
                </option>
              </select>
            </label>
            <Button
              disabled={
                !online ||
                finding.remediation !== "Remediation Claimed" ||
                ["Retest Pending", "Verified Resolved"].includes(
                  finding.verification,
                )
              }
              onClick={() => action("retest", { outcome })}
            >
              {finding.verification === "Retest Pending"
                ? "Retest Pending…"
                : "Request simulated retest"}
            </Button>
            <p role="status">
              <strong>{finding.verification}</strong>
            </p>
            {finding.evidenceAfter && (
              <div className="rd-before-after">
                <div>
                  <span className="rd-kicker">BEFORE</span>
                  <p>{finding.evidence}</p>
                </div>
                <div>
                  <span className="rd-kicker">AFTER</span>
                  <p>{finding.evidenceAfter}</p>
                </div>
              </div>
            )}
            {finding.retests.map((r, i) => (
              <p key={i} className="rd-muted">
                {date(r.date)} · {r.status}
              </p>
            ))}
          </div>
        </section>
      )}
    </Modal>
  );
}
function Reports({ state, report, dispatch }) {
  const [severity, setSeverity] = useState("All"),
    [verification, setVerification] = useState("All"),
    [asset, setAsset] = useState("All"),
    [search, setSearch] = useState(""),
    [sort, setSort] = useState("cvss"),
    [selected, setSelected] = useState(null),
    [exported, setExported] = useState("");
  if (!report || report.status !== "complete")
    return (
      <Empty
        title="Let the evidence guide your next move"
        action={report ? "View execution" : "Plan an assessment"}
        onAction={() =>
          dispatch({ type: "VIEW", view: report ? "execution" : "assistant" })
        }
      >
        Complete an approved assessment to unlock a report tailored to your
        target and scope.
      </Empty>
    );
  const findings = report.findings
    .filter(
      (f) =>
        (severity === "All" || severity === f.severity) &&
        (verification === "All" || verification === f.verification) &&
        (asset === "All" || asset === f.asset) &&
        `${f.title} ${f.cve || ""} ${f.evidence}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "epss"
        ? (b.epss?.probability ?? -1) - (a.epss?.probability ?? -1)
        : b.score - a.score,
    );
  const selectedFinding = report.findings.find((f) => f.id === selected);
  const download = () => {
    const blob = new Blob([JSON.stringify(reportDocument(report), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RADVOT-demo-${report.agentName}-${report.id.slice(0, 8)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExported("Contextual JSON report downloaded.");
  };
  return (
    <>
      <div className="rd-heading rd-report-heading">
        <div>
          <span className="rd-kicker">ILLUSTRATIVE DEMO REPORT</span>
          <h1>Clarity. Then action.</h1>
          <p>
            {report.agentName} / {report.environment.name} · {date(report.date)}
          </p>
        </div>
        <div className="rd-button-row">
          <Button secondary onClick={download}>
            Export JSON ↓
          </Button>
          <Button secondary onClick={() => window.print()}>
            Print / Save PDF
          </Button>
        </div>
      </div>
      <p role="status" className="rd-sr-only">
        {exported}
      </p>
      <Metrics report={report} />
      <section className="rd-summary">
        <Icon name="spark" />
        <div>
          <h2>Assessment summary</h2>
          <p>
            {
              report.findings.filter(
                (f) => f.score >= 7 && f.verification !== "Verified Resolved",
              ).length
            }{" "}
            unresolved high or critical observations in the approved scope.
            Review evidence before choosing remediation.{" "}
            {report.scenario === "hardened"
              ? "The hardened fixture removes the baseline high-impact conditions. "
              : ""}
            Results cover this synthetic scenario only.
          </p>
          <details>
            <summary>Objective, scope & limitations</summary>
            <p>{report.objective}</p>
            <p>
              Procedures:{" "}
              {report.scope.map((k) => procedures[k].name).join(", ")}.
            </p>
            <p>
              Environment:{" "}
              {report.environment.mode === "cloud"
                ? report.environment.provider
                : "On-Premises"}{" "}
              · {profiles[report.environment.profile].label} ·{" "}
              {profiles[report.environment.profile].os}.
            </p>
            <p>{reportDocument(report).scopeLimitations}</p>
            <p>
              Approved {date(report.approvedAt)} · completed{" "}
              {date(report.completedAt)}.
            </p>
          </details>
        </div>
      </section>
      <div className="rd-filters">
        <label>
          Search findings
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Title, evidence or CVE…"
          />
        </label>
        <label>
          Severity
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            {["All", ...severities].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Verification
          <select
            value={verification}
            onChange={(e) => setVerification(e.target.value)}
          >
            {[
              "All",
              "Not tested",
              "Retest Pending",
              "Verified Resolved",
              "Still present",
              "Inconclusive",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Asset
          <select value={asset} onChange={(e) => setAsset(e.target.value)}>
            <option>All</option>
            <option>{report.environment.name}</option>
          </select>
        </label>
        <label>
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="cvss">CVSS · highest first</option>
            <option value="epss">EPSS · highest first</option>
          </select>
        </label>
      </div>
      <div className="rd-findings-table">
        <div className="rd-table-heading">
          <span>Finding / affected asset</span>
          <span>Severity</span>
          <span>CVSS 3.1</span>
          <span>EPSS demo</span>
          <span>Verification</span>
        </div>
        {findings.map((f) => (
          <button
            key={f.id}
            className="rd-finding-row"
            onClick={() => setSelected(f.id)}
          >
            <span>
              <strong>{f.title}</strong>
              <small>
                {f.asset} · {f.cve || "Configuration / observation"} ·{" "}
                {procedures[f.check].name}
              </small>
            </span>
            <Badge tone={f.severity}>{f.severity}</Badge>
            <span className="rd-number">
              <small>CVSS</small>
              {f.score > 0 ? f.score.toFixed(1) : "N/A"}
            </span>
            <span className="rd-number">
              <small>EPSS</small>
              {pct(f.epss?.probability)}
            </span>
            <span>
              {f.verification}
              <b aria-hidden="true"> ↗</b>
            </span>
          </button>
        ))}
        {!findings.length && (
          <p className="rd-empty">
            No findings match these filters. Try another severity or clear your
            search.
          </p>
        )}
      </div>
      <p className="rd-muted">
        {findings.length} of {report.findings.length} findings · CVSS
        thresholds: Critical 9–10, High 7–8.9, Medium 4–6.9, Low 0.1–3.9. A
        zero-score observation is informational (CVSS “None”). EPSS values are
        invented demonstration data.
      </p>
      <div className="rd-button-row">
        <Button onClick={() => dispatch({ type: "VIEW", view: "assistant" })}>
          Run another assessment <Icon name="arrow" />
        </Button>
      </div>
      <details className="rd-panel">
        <summary>Assessment history & comparison</summary>
        <p>
          Counts reflect each report’s own scope and remediation state. Compare
          matching scopes for meaningful changes.
        </p>
        {state.assessments
          .filter((r) => r.agentId === report.agentId)
          .map((r) => (
            <button
              className="rd-history"
              key={r.id}
              onClick={() => dispatch({ type: "REPORT", id: r.id })}
            >
              <strong>{r.agentName}</strong> · {date(r.date)} · {r.scenario} ·{" "}
              {r.scope.join(", ")} · {r.status} ·{" "}
              {
                r.findings.filter(
                  (f) => f.score > 0 && f.verification !== "Verified Resolved",
                ).length
              }{" "}
              open risks
            </button>
          ))}
      </details>
      {selectedFinding && (
        <FindingDetails
          key={report.id + selected}
          report={report}
          finding={selectedFinding}
          online={
            state.agents.find((a) => a.id === report.agentId)?.status ===
            "Online"
          }
          error={state.error}
          dispatch={dispatch}
          onClose={() => setSelected(null)}
        />
      )}
      <PrintReport report={report} />
    </>
  );
}
function PrintReport({ report }) {
  return (
    <article className="rd-print">
      <h1>Illustrative Demo Report</h1>
      <p>{NOTICE}</p>
      <h2>
        {report.agentName} / {report.environment.name}
      </h2>
      <p>
        {report.environment.mode === "cloud"
          ? report.environment.provider
          : "On-Premises"}{" "}
        · {profiles[report.environment.profile].label} ·{" "}
        {profiles[report.environment.profile].os}
      </p>
      <p>
        Assessment: {report.id} · {date(report.date)}
      </p>
      <p>Objective: {report.objective}</p>
      <p>
        Completed procedures:{" "}
        {report.scope.map((k) => procedures[k].name).join(", ")}
      </p>
      <p>{reportDocument(report).scopeLimitations}</p>
      <p>
        {report.findings.length} observations;{" "}
        {
          report.findings.filter((f) => f.verification === "Verified Resolved")
            .length
        }{" "}
        verified resolved.
      </p>
      {report.findings.map((f) => (
        <section key={f.id}>
          <h2>{f.title}</h2>
          <p>
            {f.severity} · {f.verification} · {f.remediation}
          </p>
          <p>
            Asset: {f.asset} · Service/package: {f.service} ·{" "}
            {f.cve || "CVE: Not applicable"} · CVSS{" "}
            {f.score > 0 ? `${f.score} v3.1` : "Not applicable"} ·{" "}
            {f.vector || "Vector not supplied"}
          </p>
          <p>{f.scoreProvenance}</p>
          <p>
            EPSS probability: {pct(f.epss?.probability)}; percentile:{" "}
            {pct(f.epss?.percentile)}; date: {f.epss?.date || "Not applicable"}.{" "}
            {f.epss?.provenance}
          </p>
          <p>Evidence: {f.evidence}</p>
          <p>Impact: {f.impact}</p>
          <p>
            {f.confidence} {f.exploitability}
          </p>
          <p>Reference: {f.reference}</p>
          {f.mitigationGenerated && (
            <>
              <h3>Selected mitigation</h3>
              <ol>
                {f.steps.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ol>
              <p>{mitigation(f, report).operational}</p>
              <p>Verify: {f.verify}</p>
              <p>{mitigation(f, report).residual}</p>
            </>
          )}
          {f.evidenceAfter && <p>After retest: {f.evidenceAfter}</p>}
          {f.retests.map((r, i) => (
            <p key={i}>
              {date(r.date)} · {r.status} · {r.after}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
export default function DemoApp() {
  const [state, dispatch] = useReducer(demoReducer, null, () => {
    try {
      return restoreSession(window.sessionStorage);
    } catch {
      return restoreSession({ getItem: () => null });
    }
  });
  const [confirmation, setConfirmation] = useState(null),
    [storageError, setStorageError] = useState(false);
  const title = useRef();
  const agent = state.agents.find((a) => a.id === state.selected),
    report = state.assessments.find((r) => r.id === state.reportId);
  const busyAgent = state.agents.find((a) => a.deploymentRunning),
    busyReport = state.assessments.find((r) => r.status === "running");
  const pendingReport = state.assessments.find((r) =>
    r.findings.some((f) => f.verification === "Retest Pending"),
  );
  const pendingFinding = pendingReport?.findings.find(
    (f) => f.verification === "Retest Pending",
  );
  useEffect(() => {
    document.title = "RADVOT — Interactive Security Assessment";
    const visibility = () => {
      document.documentElement.dataset.demoHidden = String(document.hidden);
    };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      delete document.documentElement.dataset.demoHidden;
    };
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) =>
      entries.forEach(
        (entry) =>
          (entry.target.dataset.visible = String(entry.isIntersecting)),
      ),
    );
    document
      .querySelectorAll(".rd-topology")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [state.view, agent?.id]);
  useEffect(() => {
    try {
      sessionStorage.setItem("radvot-demo-v1", JSON.stringify(state));
    } catch {
      setStorageError(true);
    }
  }, [state]);
  useEffect(() => {
    if (!busyAgent) return;
    const id = setTimeout(
      () => dispatch({ type: "DEPLOY_TICK", agentId: busyAgent.id }),
      650,
    );
    return () => clearTimeout(id);
  }, [busyAgent?.id, busyAgent?.deploymentIndex]);
  useEffect(() => {
    if (!busyReport) return;
    const id = setTimeout(
      () => dispatch({ type: "EXEC_TICK", id: busyReport.id, date: now() }),
      700,
    );
    return () => clearTimeout(id);
  }, [busyReport?.id, busyReport?.phase, busyReport?.status]);
  useEffect(() => {
    if (!pendingFinding) return;
    const id = setTimeout(
      () =>
        dispatch({
          type: "FINDING",
          reportId: pendingReport.id,
          findingId: pendingFinding.id,
          action: "result",
          date: now(),
        }),
      900,
    );
    return () => clearTimeout(id);
  }, [pendingReport?.id, pendingFinding?.id]);
  useEffect(() => {
    title.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [state.view]);
  const confirm = (title, text, action) =>
    setConfirmation({ title, text, action });
  const nav = (view) => dispatch({ type: "VIEW", view });
  return (
    <div className="rd-app">
      <a className="rd-skip" href="#rd-main">
        Skip to workspace
      </a>
      <header className="rd-topbar">
        <a href="/" className="rd-logo">
          <Icon />
          RADVOT <span>/ The Third Force</span>
        </a>
        <span className="rd-disclosure">
          <span className="rd-dot" />
          {NOTICE}
        </span>
        <button
          className="rd-mobile-guide"
          aria-pressed={state.guided}
          onClick={() => dispatch({ type: "GUIDED" })}
        >
          {state.guided ? "Guided" : "Explore"}
        </button>
        <button
          className="rd-reset"
          onClick={() =>
            confirm(
              "Restart the simulation?",
              "This removes all agents, conversations, reports and remediation records from this tab.",
              () => dispatch({ type: "RESET" }),
            )
          }
        >
          Restart
        </button>
      </header>
      <div className="rd-shell">
        <aside className="rd-rail" aria-label="Workspace navigation and agents">
          <div className="rd-rail-title">ASSESSMENT WORKSPACE</div>
          <nav aria-label="Demo workspace">
            {navigation.map(([key, num, label]) => (
              <button
                key={key}
                className={state.view === key ? "rd-active" : ""}
                aria-current={state.view === key ? "step" : undefined}
                onClick={() => nav(key)}
              >
                <span>{num}</span>
                {label}
                <b>
                  {(key === "environment" && state.environment) ||
                  (key === "agents" && state.agents.length) ||
                  (key === "deployment" && agent?.status === "Online") ||
                  (key === "report" && report?.status === "complete")
                    ? "✓"
                    : ""}
                </b>
              </button>
            ))}
          </nav>
          <div className="rd-rail-agents">
            <div className="rd-actions">
              <span className="rd-rail-title">YOUR AGENTS</span>
              <button
                aria-label="Add another agent"
                onClick={() => nav("agents")}
              >
                +
              </button>
            </div>
            {state.agents.map((a) => (
              <button
                key={a.id}
                className={`rd-rail-agent ${state.selected === a.id ? "rd-selected" : ""}`}
                onClick={() => dispatch({ type: "SELECT", id: a.id })}
              >
                <span
                  className={`rd-dot ${a.status === "Online" ? "rd-online" : ""}`}
                />
                <span>
                  {a.name}
                  <small>{a.status}</small>
                </span>
              </button>
            ))}
            {!state.agents.length && <small>No agents created yet.</small>}
          </div>
          <div className="rd-rail-bottom">
            <button
              className="rd-guided"
              aria-pressed={state.guided}
              onClick={() => dispatch({ type: "GUIDED" })}
            >
              {state.guided ? "◉ Guided exploration" : "○ Free exploration"}
            </button>
            <p>
              Every action is yours.
              <br />
              Every result is simulated.
            </p>
            <a href="/">RADVOT / The Third Force</a>
          </div>
        </aside>
        <main id="rd-main" className="rd-main" ref={title} tabIndex={-1}>
          <div className="rd-breadcrumb">
            <span>WORKSPACE</span>
            <span>/</span>
            {navigation.find((n) => n[0] === state.view)?.[2]}
            {agent && (
              <Badge>
                {agent.name} · {agent.status}
              </Badge>
            )}
          </div>
          {(state.error || storageError) && (
            <div role="alert" className="rd-error">
              {state.error ||
                "Session storage is unavailable. This tab still works, but refreshing will lose progress."}
            </div>
          )}
          {state.guided && state.view !== "environment" && (
            <div className="rd-guide">
              <Icon name="spark" />
              <span>
                {state.view === "agents"
                  ? "Choose a name you’ll use in conversation. You can add more agents at any time."
                  : state.view === "deployment"
                    ? "Try a failed enrollment, retry, then open AI once your agent is online."
                    : state.view === "assistant"
                      ? "Try your own words. You can change the proposed scope before approving."
                      : state.view === "execution"
                        ? "You can pause the run or inspect what each approved check means."
                        : "Select a finding, understand the evidence, then test a mitigation."}
              </span>
            </div>
          )}
          {state.view === "environment" && (
            <Environment state={state} dispatch={dispatch} confirm={confirm} />
          )}{" "}
          {state.view === "agents" && (
            <Agents state={state} dispatch={dispatch} confirm={confirm} />
          )}{" "}
          {state.view === "deployment" && (
            <Deployment state={state} agent={agent} dispatch={dispatch} />
          )}{" "}
          {state.view === "assistant" && (
            <Assistant state={state} agent={agent} dispatch={dispatch} />
          )}{" "}
          {state.view === "execution" && (
            <Execution state={state} report={report} dispatch={dispatch} />
          )}{" "}
          {state.view === "report" && (
            <Reports
              key={report?.id || "empty"}
              state={state}
              report={report}
              dispatch={dispatch}
            />
          )}
          <footer className="rd-workspace-footer">
            <span>LOCAL SIMULATION / NO EXTERNAL EXECUTION</span>
            <span>Your choices shape the evidence.</span>
          </footer>
        </main>
        {state.environment && (
          <aside
            className="rd-intelligence"
            aria-label="Selected target intelligence"
          >
            <span className="rd-kicker">MISSION CONTEXT</span>
            <div className="rd-context-icon">
              <Icon
                name={state.environment.mode === "cloud" ? "cloud" : "server"}
              />
            </div>
            <h2>{state.environment.name}</h2>
            <Badge>
              {state.environment.mode === "cloud"
                ? state.environment.provider
                : "On-Premises"}
            </Badge>
            <dl>
              <dt>Target profile</dt>
              <dd>{profiles[state.environment.profile].label}</dd>
              <dt>Operating system</dt>
              <dd>{profiles[state.environment.profile].os}</dd>
              <dt>Agent identity</dt>
              <dd>
                {agent?.name || "Awaiting creation"}
                <small>{agent?.status || "Not created"}</small>
              </dd>
              <dt>Example services</dt>
              <dd>{profiles[state.environment.profile].services}</dd>
              <dt>Network context</dt>
              <dd>{profiles[state.environment.profile].network}</dd>
            </dl>
            {state.proposal && (
              <>
                <h3>Planned scope</h3>
                {state.proposal.scope.map((k) => (
                  <p key={k}>✓ {procedures[k].name}</p>
                ))}
              </>
            )}
            {report && (
              <>
                <h3>Assessment status</h3>
                <p>
                  {report.status} · {report.findings.length} findings
                </p>
              </>
            )}
            <div className="rd-trust-note">
              <Icon />
              <strong>Bounded by design</strong>
              <p>
                One target. Approved procedures. Synthetic evidence. You stay in
                control.
              </p>
            </div>
          </aside>
        )}
      </div>
      {confirmation && (
        <Modal title={confirmation.title} onClose={() => setConfirmation(null)}>
          <p>{confirmation.text}</p>
          <div className="rd-button-row">
            <Button secondary autoFocus onClick={() => setConfirmation(null)}>
              Keep current session
            </Button>
            <Button
              onClick={() => {
                confirmation.action();
                setConfirmation(null);
              }}
            >
              Confirm reset / delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
