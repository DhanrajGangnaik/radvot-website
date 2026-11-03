# Interactive assessment workspace

Open `/demo` after running `npm run dev` from `website/`. The homepage navigation and primary product CTAs link to this route. The original homepage, skull hero, and short security mission remain available. The demo is lazy-loaded; no router or additional runtime dependencies were added.

## Boundaries

**Interactive Simulation — No real systems are assessed.** All deployment, enrollment, heartbeat, execution, evidence, mitigation and verification events are local authored simulations. No fetch, WebSocket, shell, cloud SDK, provider key, credential, enrollment token, backend endpoint or scanning client is used by the demo. Reference links are ordinary user-initiated external navigation. Export uses a local Blob and the browser print dialog.

Provider selection supplies context; it does not connect an account. Terminal content is non-executable guidance. The assistant is explicitly a deterministic simulated assistant, not a connected LLM. Results are synthetic and do not establish security of any actual system.

## Architecture

- `src/features/interactive-demo/data.js`: environment profiles, allowlisted procedures, deployment/execution phases, curated findings, specific evidence and mitigation steps.
- `engine.js`: name validation, target resolution, intent extraction, proposal validation, scenario selection, remediation guidance, contextual exports, reducer and session restoration.
- `DemoApp.jsx`: route workspace, environment configuration, agent management, deployment topology, conversation, editable proposal, execution timeline, report filters, accessible native detail/confirmation dialogs, mitigation/retest and print view.
- `demo.css`: scoped design system, responsive layouts, topology animation, reduced motion and print rendering.
- `planningAdapter.js`: local adapter contract and an unavailable operational adapter that fails closed. No fictional production endpoint is defined.

## State and identity

A central reducer owns environment, agents, selection, conversation, proposal, assessment history and view. Agent IDs are UUIDs generated at creation. Names permit 2–32 ASCII letters, numbers, underscores and hyphens, must begin with a letter, and are unique ignoring case. Display names and descriptions have separate length limits. React renders user text without HTML injection.

Assessment IDs, timestamps, target identity, environment, objective and scope are captured at proposal/approval. Renaming never rewrites historical report identity. Unsafe rename during active work is rejected. Deletion removes that agent’s reports; environment changes and reset require explicit confirmation. Switching agents never changes a report’s recorded target.

Session state lives in this tab’s `sessionStorage`. No server receives it. Storage failures retain an in-memory experience. Restoration validates the basic schema, pauses active assessments, marks interrupted deployments failed, and makes interrupted retests inconclusive. This storage is a convenience, not an authentication or integrity boundary: visitors can edit their own synthetic state with browser tools.

Timers advance meaningful reducer events. Target/run IDs reject stale timer events after deletion/reset. Leaving a view does not lose work. Deployment, execution and retest can continue while navigating. Topology animation pauses outside the viewport or when the document is hidden. Reduced motion removes visual motion without changing the outcome or skipping approval.

## Intent handling and planning

The parser recognizes whole, case-insensitive created agent names; partial names do not match. Explicit unknown names are rejected with available targets, including polite requests, quoted names and “check whether” phrasing. Multiple named targets or an ambiguous “my agent” request asks for selection. Contextual follow-ups use the selected agent; offline targets cannot produce or approve an executable plan. Unsupported procedure requests such as Windows registry checks, Kubernetes cluster assessments and source-code audits are rejected without generating a fallback plan.

Configuration, service/exposure, software/package and cloud-policy requests select supported procedures. General assessments cover available procedures. Critical-first requests retain the approved scope and present results by severity. Explanation, priority, likelihood and retest intents use completed assessment context. Unknown conversational input provides supported examples. External addresses, URLs, exploit and command requests are rejected. This is a bounded parser, not arbitrary language understanding.

Every approval validates current target ID/name/environment, online state, procedure allowlist, nonempty unique scope, supported scenario and proposal state. Execution requires the approved report state; arbitrary procedure names cannot enter the execution pipeline. Only one assessment may run or remain paused at a time.

## Fixtures and metrics

Selection is the intersection of target role, deployment mode and approved procedures. Database authentication and listener issues differ from API diagnostics, workstation session locking, privileged containers, and cloud ingress/permissions. The hardened scenario retains only applicable low/informational observations. Results are generated once at completion and remain stable. Prior verified remediation affects later assessments for the same agent, without mutating historical assessments.

CVSS v3.1 categories use FIRST’s thresholds: 0 None (displayed as an informational observation), 0.1–3.9 Low, 4.0–6.9 Medium, 7.0–8.9 High, 9.0–10 Critical. Configuration scores are clearly illustrative analyst ratings; vectors are supplied only where explicitly authored. The Log4j example uses Apache’s published CVE-2021-44228 base score/vector against a fictional package manifest. Package presence is not proof of runtime exploitation.

EPSS is separate: probability of exploitation in the wild over the next 30 days, with percentile and data date. The Log4j fixture’s 42%/90th percentile dated 2026-01-01 is **invented demonstration data**, not an actual FIRST snapshot. Non-CVE observations show Not applicable. No values are presented as current live intelligence.

Authoritative reference definitions:
- https://www.first.org/cvss/v3.1/specification-document
- https://www.first.org/epss/faq
- https://logging.apache.org/security.html#CVE-2021-44228

## Mitigation and verification

Each finding carries its own remediation, operational concerns and verification evidence. The assistant combines those with OS, deployment mode and asset context. Follow-ups about alternatives, plain-language impact, priority and verification use the selected finding rather than a generic response.

Generating a strategy enables a remediation claim. A claim changes only remediation state. A subsequent retest transitions through Pending to Verified Resolved, Still present or Inconclusive according to the explicitly selected synthetic evidence scenario. Offline verification is inconclusive. Before/after snapshots and retest timestamps stay with the report. Only Verified Resolved removes a risk from the unresolved chart and updates the agent’s simulated remediation memory.

## Reports

Filters cover severity, asset, verification and search; sorting supports CVSS and illustrative EPSS (unknown values last). Reports retain all findings regardless of filters. Historical comparisons show scope, scenario and open risk counts so differing scopes are not silently compared as equivalent.

JSON includes actual report context, complete findings, provenance, selected strategies and retest histories. Print / Save PDF uses the browser print dialog; select “Save as PDF” there. The print layout is independent of table filters and includes all report evidence. It is prominently labeled Illustrative Demo Report, with no claim of real security assurance. There is no PDF library or one-click binary PDF generator.

## Local commands

```sh
cd website
npm run dev
npm run test:engine
npm run build
npm test
```

Playwright uses installed Google Chrome, tests desktop/tablet/mobile, and starts the production preview on port 5173. Screenshots are written to `test-results/`. Tests include accessible labels/dialog focus, axe checks, 320px overflow, reduced motion, no fetch/XHR/WebSocket activity, both full deployment modes, failures/retry, target errors, exports and retesting, plus existing homepage regressions.

## Validation recorded 2026-11-04

- Production build passed.
- All 12 simulation-engine tests passed.
- All 48 Playwright tests passed across desktop, tablet and mobile, including the existing homepage suite.
- Environment, report, mitigation and cloud-deployment screenshots were inspected.
- GitNexus impact calls could not resolve the new website symbols in the existing index. Its final `detect_changes` call failed because the parent Git repository has no `HEAD`. These are unavailable graph checks, not a clean scope result. Direct inspection kept implementation changes within `website/`; no operational backend, commit, push or deployment was performed.

## Future integration

A real integration belongs in a separately authenticated application or an explicitly gated server adapter. Required capabilities include documented backend contracts, server-side sessions and authorization, scoped target ownership, signed agent releases, trusted TLS enrollment, short-lived enrollment authorization, capability validation, explicit execution approvals, audit records, cancellation, evidence provenance and authenticated report retrieval. Model credentials stay server-side. Any LLM response must satisfy a structured schema and supported capability/identity/scope checks. Planning must never execute arbitrary generated commands. The public local adapter must remain the default and must not accept a query-string switch to live execution.

Production hosting would need an SPA fallback for `/demo`; no hosting or deployment configuration was changed.

## Limitations

The simulation covers curated Linux profiles, not arbitrary platforms. The intent parser intentionally supports a finite vocabulary; cloud evidence is provider-neutral. No live model, cloud account, CVE feed, agent enrollment or security engine is connected. Within-session agent history persists only in the current browser tab. Mitigation follow-up messages are ephemeral UI state; the generated strategy, remediation claim and retest record are persisted/exported. Environment replacement clears the previous scenario after confirmation rather than maintaining multiple environments concurrently.
