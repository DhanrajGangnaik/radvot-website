# RADVOT — The Third Force

A React 18 + Vite 6 website with two primary experiences:

- `/`: The Third Force, the existing procedural 3D cinematic experience. Native scrolling drives all eight chapters, the RADVOT reveal and the environment handoff.
- `/demo`: the interactive security assessment simulation. Agent identity, deployment, approval, findings, mitigation, retest and exports remain browser-local.

The old marketing homepage, embedded mission, experimental skull route and supporting marketing sections have been retired. Old `/story` bookmarks normalize to `/` using history replacement, without adding an extra Back step. Other non-demo paths also normalize to the cinematic homepage. The demo accepts a trailing slash.

## Local development

```sh
npm ci
npm run dev
```

Open **http://localhost:5173/**. Development binds to `0.0.0.0:5173` and Vite prints the LAN URL for trusted local testing. Preview stays loopback-only.

```sh
npm run build
npm run preview
npm run test:engine
npm test
```

Development and preview default to port 5173; run one at a time. Playwright uses installed Google Chrome and production preview on port 4173. Tests cover desktop, tablet and mobile, complete cinematic scrolling in both directions, route history/refresh, accessible fallbacks, environment handoff and full demo workflows.

## Structure

- `src/main.jsx`: lazy routing to the cinematic homepage or demo handoff adapter.
- `src/styles.css`: shared fonts, typography, native controls and accessibility.
- `src/experience-transitions.css`: native page transition enhancement and loading screens.
- `src/features/cinematic-story/`: the existing scene, camera, timeline, narrative and mode handoff.
- `src/features/interactive-demo/`: the existing colorful workspace, reducer, intent engine, curated findings and simulation adapter.
- `public/fonts/`: self-hosted Manrope and Space Grotesk WOFF2 fonts with licenses.

Reduced-motion preferences and unavailable WebGL automatically show the complete text edition. The cinematic final screen retains Cloud and On-Premises choices, the launch button, Email and LinkedIn. Mode handoff initializes only a new demo session; it never overwrites existing agents or assessments. The demo's RADVOT / The Third Force links return to `/`.

## Production routing

The build output is `dist/`. A static host must serve `index.html` for direct visits to `/demo` (and legacy `/story`) as a standard SPA fallback. Vite development and preview already support this, including refresh. No hosting configuration or deployment has been changed.

## Execution boundary

The operational security platform is independent. This site has no model keys, authentication, enrollment, scanning or exploitation integration. All assessments are explicitly labeled simulations. See [INTERACTIVE-DEMO.md](INTERACTIVE-DEMO.md) for the retained state architecture and future authenticated integration requirements.

Previous implementation records in the other Markdown documents are historical; this README describes the current routing and active source tree. Supplied `logo.jpg` and original concept artwork are retained as source references, not shipped as unused runtime assets.
