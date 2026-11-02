# RADVOT content evidence

Reviewed 2026-11-01. Source: local sibling `../../PurpleClaw`, HEAD `56abab0658e7996d1161fb6edf905e6998e3caca`. Public repository link comes from that checkout's README: https://github.com/DhanrajGangnaik/PurpleClaw. Source review is not operational validation; backend tests and security procedures were not run for this marketing task.

## Claim matrix

Paths below are relative to the PurpleClaw source root. `security/` is shorthand for `purpleclaw/security/`; bare `agent_store.py` also lives in `purpleclaw/security/`.

| Website claim | Classification | Evidence and limits |
| --- | --- | --- |
| Linux agent installation, enrollment, heartbeat | Implemented | `agent/purpleclaw_agent.py`: systemd installer, `register`, `poll`; `purpleclaw/security/api/routes_agents.py`: download, register and poll routes; `agent_store.py`: `register_agent`, `touch_agent`. Registration creates an agent record. No general agent-creation UI or universal OS support established. |
| Friendly-name agent targeting | Planned | `security/tools/remote.py::_resolve` calls `agent_store.py::get_agent`, which accepts UUID or IP, not hostname. The walkthrough's named agent is a fictional display label only. |
| Scope and assessment approval | Implemented, bounded | `security/llm/execution.py::ExecutionEngine._run_step` checks CIDRs for network/http/web_enum/vuln_scan categories and skips approval_required/blocked/report_only steps. `security/llm/agent.py::chat`, `stream_chat`, `_finalize_plan_for_confirmation` store chat plans pending confirmation. `security/llm/target_resolution.py` refuses implicit widening of target type. `tests/test_execution_engine.py` and `tests/test_agent_routing.py` contain corresponding tests; not executed in this task. Do not generalize these checks to every category or API. |
| Evidence-backed findings | Implemented | `security/findings/evidence.py::Evidence` records source, method, class, asset, observation, timestamp, reliability and independence group. Deduplication avoids counting identical observations twice. `security/reports/tool_execution_report.py` and `security/core/audit.py` support reports and logs. No immutable storage or guaranteed report correctness claimed. |
| Detection checks and incident exercises | Experimental as a combined capability | `security/detectors/port_change.py`, `service_anomaly.py` and `security/agent/orchestrator.py::DefensiveOrchestrator.run_target_check` implement port and service policy checks plus incident reports. Full incident exercises and SIEM/EDR validation were not established. |
| Remediation and retesting | Experimental as a complete workflow | `security/tools/remote.py` implements apt_upgrade, service_restart, service_disable, ufw_rule and verify_patch. Package/UFW operations default to dry-run. Verification covers package_version/service_status/port_closed. No persisted mandatory prior approval token is demonstrated by these wrappers. Full remediation lifecycle tracking is not established. |
| Agent identity | Limited implemented controls | Agent routes depend on API-key authentication. Remote commands resolve a registered ID/IP. Do not claim per-agent cryptographic identity or attestation: route authentication uses a shared API key, and result handling does not demonstrate per-agent command ownership enforcement. |
| Explicit uncertainty | Implemented foundations | Evidence reliability and independence in `findings/evidence.py`; applicability gaps in `llm/applicability.py` and confirmation flow; research observations have confidence ceilings per README and research models. The website's four status labels are explanatory labels, not a claim of exact backend enum parity. |
| Deployment | Documented self-hosted options | `README.md` Quick start and Bare-metal setup, `Dockerfile.api`, `docker-compose.api.yml`. Linux systemd and apt/systemctl/UFW underpin agent/remediation. No deployment was executed or environment certified. |
| Cloud/identity connectors; broader hybrid coverage | Planned direction | User brief supplies the product direction. No validated dedicated connectors established in reviewed source. Not a delivery commitment or release date. |
| Brand name, expansion, tagline, PurpleClaw rename | User-supplied | Current brief. No operational identifiers changed. |

## Approval nuance

Authorization is a platform responsibility. The site describes implemented code controls precisely, not as an LLM guarantee. Chat confirmation and engine skip states are evidenced; a global mutation approval gate is not. README statements about universal confirmation must not override narrower source evidence. The illustrative approval record does not authorize actual operations.

## Current demonstration

The current mounted demo is `src/ProductDemo.jsx`: Create Agent → Deploy Agent → Natural Language → Generate Reports. `src/HeroSystem.jsx` is a conceptual workflow overview. These do not claim operational support beyond the matrix above. Historical CVSS/EPSS source provenance and all sample-data limits are documented in [EXPERIENCE.md](EXPERIENCE.md). `content.js` stage data and `intelligence-data.js` remain unused historical source modules. The missing-logo disclosure is no longer in the public footer.

## Earlier demonstration data (not currently mounted)

`src/content.js` contains all walkthrough data. `sentinel-linux-01`, `demo-agent-024`, `192.0.2.24`, approval IDs, timestamps, E-01–E-04 and retest results are fictional. The address is from a documentation range. There are no fetches, sockets, operational API integrations, form submissions, or security command calls. Navigation to the real repository is explicit user action. Evidence details are local disclosures.

The 2026-11-02 interactive preview adds `src/intelligence-data.js`: a six-system fictional graph, four assessment phases, DEMO-E01–E06 records and five product-preview categories. Potential path highlighting is a hypothetical relationship visualization, not evidence that attack-path discovery or exploitation is implemented. Sample denial and retest records are authored examples, not real control validation. The original capability matrix remains authoritative for product claims. Only local static assets and the code-split preview module are loaded by the site.

## Brand asset blocker

The workspace was empty and no logo attachment was available. Its local path was explicitly requested. The latest user request authorized supporting images, animation, and a different palette. Two conceptual illustrations were generated; they are not brand marks or evidence of operational capabilities. The footer discloses the missing logo. Final supplied-logo integration remains incomplete. Once supplied: inspect it, preserve the untouched original separately, create optimized raster derivatives, set width/height from its true aspect ratio, add responsive source sizes and meaningful alt text, and blend its background into the hero. Do not trace or mislabel it as vector. No logo-derived social image is claimed. Navigation is readable plain text; the favicon is the expressly allowed simple R fallback. See ARTWORK.md for exact image prompts and saved paths.

## Scope and tooling

The initial marketing workspace had no frontend. Read-only inspection found React 18 + Vite 6 in the sibling operational frontend; this separate site follows those versions without importing operational code. All website changes are under `radvot/website/`. For the visual refresh, a local GitNexus index was created and CLI upstream impact was run for App and Walkthrough before editing: LOW risk, zero indexed upstream dependents or processes. Manual JSX inspection confirms App renders Walkthrough and the root renders App; the graph does not capture those JSX edges. The detect_changes backend was invoked with scope all, but failed because the enclosing repository has no HEAD commit. Changed-file inspection and browser checks therefore provide the available scope verification. No commit, push, deployment, or backend security command was performed.
