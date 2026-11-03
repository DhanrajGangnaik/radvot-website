# RADVOT capability-claim evidence

Reviewed 2026-11-03 against the local operational source, revision `56abab0658e7996d1161fb6edf905e6998e3caca`. Source inspection is not operational validation; no backend tests or security operations were run for this website task. Paths below are relative to the operational security package unless explicitly described otherwise. They are developer references, not public page copy.

| Capability | Classification | Evidence and limits |
| --- | --- | --- |
| Agent installation, enrollment, heartbeat | Implemented foundations | Agent installer script: systemd installation, `register`, `poll`. `api/routes_agents.py`: download, register and poll endpoints. `agent_store.py`: `register_agent`, `touch_agent`. General profile-creation UI is product direction; installation is not performed by this website. |
| Agent targeting | Implemented by ID/IP; friendly-name targeting planned | `tools/remote.py::_resolve` uses `agent_store.py::get_agent`, which resolves UUID/IP rather than hostname. `sentinel-linux-01` is a fictional display name; execution scope in the demo references `demo-agent-024`. |
| NLP assessment workflows | Implemented foundations | `llm/agent.py::chat`, `stream_chat`, `_finalize_plan_for_confirmation` store proposed plans pending confirmation. The website uses a fixed authored plan; textarea input is not interpreted. |
| Scope/approval safeguards | Implemented, bounded | `llm/execution.py::ExecutionEngine._run_step` checks scoped targets in supported active categories and skips approval-required/blocked/report-only states. `llm/target_resolution.py` prevents implicit target-type widening. No universal mutation approval gate is established. |
| Agent identity | Limited controls | Agent routes authenticate through an API key; remote tools resolve registered ID/IP. No claim of cryptographic attestation or per-agent command ownership enforcement. |
| Evidence and reports | Implemented foundations | `findings/evidence.py::Evidence` retains source, method, asset, observation, timestamp and reliability. `reports/tool_execution_report.py` and `core/audit.py` provide reports/audit records. No immutable-provenance or perfect-report claims. |
| CVSS | Supported ingestion | `tools/vuln_scan.py` parses scanner `classification.cvss-score` as `cvss_score`; scanner findings also retain severity, remediation and references. This does not establish a general CVSS calculator. Every number in the public preview is explicitly synthetic; no real CVE is asserted. |
| PVSS | Planned / undefined | No PVSS definition, formula, scale, ingestion or scoring implementation found in reviewed code/documentation. User clarification requested. Display stays “Not evaluated”; no invented expansion or numeric score. |
| Severity, priority and mitigation | Implemented foundations; preview priority authored | `core/scoring.py` assigns a 0–4 severity score, not PVSS. `core/triage.py` separates confirmed, needs-verification and suppressed outcomes using deterministic logic and corroboration. Scanner output supplies remediation. Preview P1–P3 is an authored example, not a production contextual score. |
| Follow-up validation | Partial / experimental as a full lifecycle | `tools/remote.py` includes package-version, service-status and port-closed verification plus mutation wrappers. Package/UFW operations default to dry-run. End-to-end persisted remediation tracking and universal prior approval enforcement are not established. |
| Detection controls | Limited checks | `detectors/port_change.py`, `detectors/service_anomaly.py` and `agent/orchestrator.py` provide selected port/service policy checks. Broad SIEM/EDR or complete incident-exercise coverage is not claimed. |
| Deployment | Documented self-hosted | Operational README, `Dockerfile.api`, `docker-compose.api.yml`; Linux systemd/apt/service tooling. No new deployment tested. |
| Cloud, identity, broader hybrid coverage | Product direction | User brief; dedicated connectors and universal OS/platform support not validated. |

## Demonstration boundaries

The four-stage journey is **Create Agent → Deploy on System → Assess via NLP → Review Reports**. Profiles, identifiers, heartbeat, approval, findings, evidence and retests are authored browser-local state. No downloads, installation, model calls, target connections or operational API requests occur.

`src/content.js` contains synthetic observations RV-101–RV-103 and E-01–E-03 for `staging-web-01`. CVSS 7.5, 8.1 and 3.1 demonstrate the layout and sorting only. There are no fabricated CVEs, real vendor advisories or claimed calculated vectors. Priority 1 deliberately precedes a higher CVSS example to explain that severity and contextual priority differ. The retest only describes an authored local-state observation; wider enforcement remains untested.

Brand category, tagline and expansion come directly from the user. The public page contains no rename history. Existing email/LinkedIn destinations are retained from the prior website. No new repository or production-domain links are invented.
