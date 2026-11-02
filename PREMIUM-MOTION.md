# RADVOT interactive intelligence preview

Implemented 2026-11-02. The requested deep violet, royal purple, lavender white, burgundy, pink and crimson palette supersedes the earlier ice-blue page palette. Existing artwork is styled with CSS color treatment; original raster files remain unchanged.

## What is interactive

- **Attack-path graph:** six real HTML node buttons over lightweight SVG connections. Mouse, keyboard and touch selection updates an evidence inspector and highlights the selected relationship path. Status labels pair words with the legend's symbols; color is supplementary. Paths are hypothetical relationships, not confirmed exploit routes.
- **Assessment sequence:** Discover → Investigate → Validate → Strengthen. Manual stage selection, Run, Pause, Resume, Replay and Reset update the graph, evidence and dashboard. Playback advances every 2.4 seconds, stops at completion and pauses when the preview or browser tab is hidden. Global motion pause stops automatic playback. With reduced motion, Show final result displays a static outcome immediately; manual stages remain available.
- **Product dashboard:** Findings, Assessments, Agents, Attack Paths and Defense Validation tabs show different representative records, synchronized with the assessment stage. Tabs support arrow keys, Home/End, click and touch.
- **Hero:** layered aurora, perspective grid, eight sparse particles, interpolated pointer light and staggered transform entrances. The existing plain-text navigation brand has an entrance; the supplied logo's entrance remains blocked on its missing file.
- **Cards and navigation:** restrained desktop tilt/spotlight, animated border, expandable feature details, small CTA magnetic movement, press feedback, active-section navigation, mobile menu entrance and scroll progress.

## Execution boundary

Everything in `src/intelligence-data.js` is authored fictional data, including the six systems, DEMO-E01–E06 evidence, approvals, denial and remediation results. No security command, target connection, backend API, credentials, or actual telemetry is used. Demo routes do not exist. The visual graph is an explanatory prototype, not proof of implemented attack-path analysis or SIEM/EDR integration. Capability claims and limitations remain in CONTENT-EVIDENCE.md.

## Implementation and performance

`IntelligencePreview.jsx` owns the graph, sequence and dashboard. `LazyIntelligence.jsx` uses Intersection Observer and React.lazy to load its separate chunk near the viewport. Reserved layout space and explicit image dimensions avoid loading shifts. A loading message with a static skeleton appears only during actual module loading; no site-wide loading screen was added.

`motion.js` handles visibility, scroll and pointer effects. Pointer interpolation updates DOM CSS properties through requestAnimationFrame, not per-frame React state. React updates only on interactions and sequence stages. Scroll work is batched to one animation frame. Listeners, observers, timers and animation frames are cleaned up. Continuous CSS effects pause offscreen, when the page is hidden, and with global motion pause. Coarse pointer devices omit magnetic movement and tilt; mobile renders fewer particles. Reduced-motion mode removes continuous effects and transforms.

The page uses CSS and SVG with no motion, graph, or 3D library. Production output: main JavaScript about 56.46 KB gzip; lazy preview about 4.24 KB gzip; CSS about 13.15 KB gzip. A short Chromium sample on this development machine observed ~16.7 ms median and p95 requestAnimationFrame intervals and zero unexpected layout shift at 1440px, 768px and 390px. This is a local scheduling/stability sample, not a universal frame-rate or GPU-performance guarantee.

## Validation and boundaries

Run `npm run build` then `npm test -- --workers=1`. Tests cover the graph and inspector, selected connections, all four stages, automatic completion, pause/replay/reset, offscreen pause, global pause, reduced motion, five dashboard tabs and keyboard navigation, mobile touch, pointer card effects, feature disclosures, and the original six-stage walkthrough. Axe scans cover the page and expanded details; screenshots are in `test-results/`.

GitNexus upstream impact was run for App, Walkthrough, IntelligencePreview and usePageEffects. Risk was LOW; usePageEffects has App as its one direct indexed caller. Graph results were supplemented by JSX inspection. `detect_changes(scope: all)` was invoked but failed because the enclosing Git repository has no HEAD commit. File-scope inspection and browser checks provide the available verification. No operational source, credentials or APIs were modified. No deployment, commit or push was performed.

The supplied RADVOT logo is still missing; its local path was requested earlier. No generated asset is being represented as that logo. The optional terminal was omitted to keep the graph and product preview as the primary demonstration.
