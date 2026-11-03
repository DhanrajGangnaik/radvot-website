# The Third Force — implementation and acceptance report

## Open the experience

- Homepage: `http://127.0.0.1:5173/`
- Cinematic story: `http://127.0.0.1:5173/story`
- Existing interactive assessment workspace: `http://127.0.0.1:5173/demo`
- Retained skull experiment: `http://127.0.0.1:5173/lab/skull`

Use normal scrolling in either direction, or the ten navigation stops: eight narrative chapters, the geometric brand assembly, and the environment handoff. Pause freezes ambient animation; deliberate scrolling still moves the story. Skip opens the environment choices. Replay returns to the beginning and clears the story's demonstration decision.

## Audit of the starting working tree

The original homepage had three editorial story sections and an experimental Canvas 2D skull. It did not contain a persistent Three.js world, a scroll-controlled cinematic camera, Red/Blue infrastructure, a purple portal, a six-component Intelligence Core, or a geometric acronym transformation. It had homepage motion controls, but no cinematic navigation or complete story fallback. A functional assessment simulation already existed at `/demo`; it was preserved.

The requested root-level `src/HeroSystem.jsx` and `src/ProductDemo.jsx` did not exist. The actual components are `src/components/Hero.jsx` and `src/components/ProductDemo.jsx`. The latter is the separate homepage mission; the full operational-style simulation is `src/features/interactive-demo/`.

Read the root AGENTS instructions and project documentation. `git status --short` reported an entirely untracked enclosing checkout; branch was `main`; `git log -1 --oneline` failed because the branch has no commits. No reset, checkout, commit, push, deployment, or backend change was performed.

GitNexus query/impact calls could not resolve the website symbols and returned UNKNOWN, not a low-risk clearance. Manual references were inspected instead. Direct integration points are the App route, Hero entry, Header navigation and the new story feature. `gitnexus_detect_changes(scope: all)` was attempted and failed because `HEAD` does not exist. A SHA-256 snapshot taken before editing supplies the preservation comparison; do not interpret the GitNexus failure as a successful graph audit.

## Actual source changes

Created:

- `src/features/cinematic-story/CinematicStory.jsx` — narrative, ScrollTrigger coordination, accessible controls, fallback, interactive evidence/mitigation/retest.
- `src/features/cinematic-story/StoryWorld.jsx` — persistent procedural Three.js scene, R3F lifecycle, camera, portal shader, geometry and geometric wordmark.
- `src/features/cinematic-story/storyModel.js` — authored chapters, reversible scene envelopes, acronym activation boundaries and glyph destinations.
- `src/features/cinematic-story/StoryDemoEntry.jsx` — narrow environment handoff around the unchanged demo.
- `src/features/cinematic-story/cinematic.css` — desktop/tablet/mobile/landscape layouts and text edition.
- `tests/story.spec.js` — cinematic browser coverage and screenshots.
- `unit-tests/story.test.js` — deterministic timeline and geometric-state tests.
- `CINEMATIC-STORY.md` — this audit and delivery report.
- `artifacts/story/` — retained visual evidence and inspection index.

Modified:

- `src/main.jsx` — separate lazy `/story` and `/demo` routes; homepage story gateway; experimental hero route.
- `src/components/Hero.jsx` — geometric identity preview and story entry; existing skull preserved behind `/lab/skull`.
- `src/components/Header.jsx` — direct story navigation.
- `src/story.css` — homepage preview and story gateway styling.
- `tests/skull.spec.js` — existing skull checks target its retained experimental route.
- `package.json`, `package-lock.json` — React-compatible 3D and timeline dependencies.
- `README.md` — current entry points and commands.

Preserved byte-for-byte: `src/features/interactive-demo/*`, `src/components/ProductDemo.jsx`, `src/components/ProductDemo.css`, `src/components/ReportPreview.jsx`, `src/components/SkullGlitch.jsx`, `src/components/SkullGlitch.css`, `src/content.js`, `src/styles.css`, and the existing demo engine tests. Existing supporting capabilities, architecture, trust, FAQ and contact remain on the homepage. Build output and Playwright scratch output are generated locally.

## Functional coverage

| Stage | Implemented behavior | Visual and interaction verification | Deliberate scope / limitation |
| --- | --- | --- | --- |
| 1. Two Teams, One Mission | Instanced digital city, 24 asset nodes, separate Red/Blue paths, evidence fragments and R activation | Opening captured on desktop/tablet/mobile; navigation and reverse scrolling exercised | Abstract digital infrastructure, not an actual topology inventory |
| 2. The Disconnect | Node displacement/rotation, shortened disconnected paths, separated fragments, required questions | Intermediate fragmentation captured; reverse restores connections | Distortion is geometric, not a fullscreen glitch filter |
| 3. The Silence | Motion time freezes, network fades, camera pulls back into darkness | Dark composition captured; scrolling back restores world | Header/navigation remain visible for usability |
| 4. RADVOT’s Arrival | Violet seed, expanding GLSL portal, eight depth rings, inward fragment streams, crystalline/mechanical core, six orbital structures, full dialogue | Portal formation and emerged core captured separately; actual rendered canvas checked | Additive shader glow creates the bloom-like appearance; no expensive screen-space bloom or true volumetric scattering |
| 5. The Orchestration | Scope/approval/connection sequence, designated purple beacons, core-to-agent links, investigative/defensive pulses, A then D | Activated scene captured; boundary activation asserted | Authored approved-scope illustration; no real agent connection |
| 6. The Revelation | Infrastructure morphs into an evidence graph, selectable observations highlight corresponding assets, V then O | Evidence graph captured; interactive selection and accessibility checked | Two policy observations plus an illustrative CVE inventory example; no live intelligence |
| 7. The Human Decision | Two finding-specific recommendations, simulated change claim, explicit retest, three possible evidence outcomes, T | Selection, recommendations, all three outcomes and before/after evidence tested; outcome screenshots retained | User chooses synthetic evidence outcome; it is not a prediction or real verification |
| 8. The Third Force | Connected Red/Blue network, return portal, core recedes/shrinks into portal, lone violet node | Full network and partial departure captured; reverse verified | Orbital components remain to perform the brand transformation |
| Brand transformation | Each of six voxel clusters changes position/orientation and assembles one letter of RADVOT; full meaning/tagline appear | Partial assembly and completed geometric wordmark captured | Custom geometric lettering; not an externally approved replacement trademark |
| Demo handoff | Letter structures contract, remaining node expands the connected topology; On-Premises/Cloud choices open `/demo` | Both choices tested; existing session preservation tested; existing end-to-end demo workflows run | Route navigation is a page handoff, not a shared WebGL scene inside the demo |

## Technical architecture

React stays at 18.3.1. Added Three.js 0.170, React Three Fiber 8.18, drei 9.122 and GSAP 3.13. Fiber's official documentation pairs its v8 with React 18: [R3F introduction](https://r3f.docs.pmnd.rs/getting-started/introduction).

One GSAP ScrollTrigger maps the story section's native scroll range to `p = 0…9.99`. Every structural position derives from `p` through smooth reversible envelopes. No timed slide scheduler advances the narrative. CSS sticky keeps one stage in view without ScrollTrigger pinning or intercepted wheel events. See [ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).

R3F hosts one persistent Three.js group. `makeWorld()` constructs shared primitive geometries, an instanced city, asset nodes, dynamic line buffers, communication pulses, core shells/blades, a portal and six instanced voxel clusters. A single frame update changes matrices and buffers; there are no React state updates per animation frame. DOM chapter/activation state is quantized to 0.05 narrative units. Camera height, depth, azimuth and zoom derive from the same coordinate, including a retreat during silence and a frontal brand view.

The portal uses radial/angular GLSL distortion, bright emissive ring falloff, interior spirals and eight partially open torus rings offset through depth. Geometry and lighting supply dimensional form. Red/Blue fragments move inward toward the portal. The core combines a stretched octahedral heart, rotating torus knot, three wireframe polyhedral shells, twelve crystalline blades and six orbital voxel components. Its central light illuminates surrounding geometry.

The same six orbital clusters become the wordmark: individual cube matrices interpolate from orbit-cluster coordinates to 5×7 letter destinations; cluster centers converge into a horizontal arrangement. This is not ordinary DOM text fading over a background. Acronym activation is deterministic: R at 0.18, A at 4.18, D at 4.58, V at 5.12, O at 5.55, T at 6.35.

Tablet/mobile below 960px use a stacked composition, 64 city blocks instead of 144, 36 fragments instead of 90, 14 pulses instead of 28, lower torus segmentation and DPR 1. Desktop DPR is capped at 1.5. Main shared primitives and instancing limit allocations. Animation uses R3F's demand loop and stops on pause or a hidden document. Geometry/materials are disposed on unmount. Three.js is lazy-loaded for the story, not the homepage or demo.

## Accessibility and fallback

All story actions are semantic buttons, links, selects or details. Focus indicators, keyboard chapter navigation, a focusable scrollable narrative panel, current-chapter indication and pressed states are present. Short/narrow screens may scroll dense chapter copy within its panel; the evidence dialogue can be expanded separately on mobile. The text edition contains all eight chapters, dialogues, authorization explanation, evidence limitations, mitigation/retest explanation, acronym meaning and both demo links.

Reduced-motion preference selects the text edition automatically. Missing WebGL2, renderer errors and lost context switch to text rather than leaving a blank stage. Users can choose Read Story before the lazy 3D scene completes. Motion can be paused independently of scrolling. No flashing strobe or sound is used.

## Demo and security boundary

`StoryDemoEntry` accepts only `from=story` plus the enumerated `cloud` / `onprem` modes. For a fresh session it uses the existing demo's `initialState()` and restores a valid Linux profile. It never overwrites an existing environment, agent or assessment; existing visitors receive an explanatory message. It never starts an assessment, enrolls an agent, or grants approval. The visitor continues through the existing simulation UI.

The story has no fetch/XHR/WebSocket transport, commands, credentials, scanners or execution adapter. Browser tests assert no such requests during story navigation and interaction. Static assets are served locally. Policy observations have no invented CVE, CVSS or EPSS values. The separate illustrative CVE-2021-44228 inventory example uses CVSS v3.1 10.0, supported by [Oracle's advisory](https://www.oracle.com/security-alerts/cve-2021-44228verbose.html). EPSS is explicitly unavailable in this story fixture; [FIRST defines EPSS](https://www.first.org/epss/) as the probability of observed exploitation in the next 30 days, not severity. No current threat data is claimed.

Any future live assessment belongs in a separate authenticated operational application with server-side authorization, scoped targets, supported-procedure validation, explicit execution approval, audit records and trusted enrollment. The story does not add or assume such a backend.

## Local commands

```sh
cd /Users/dhanrajgangnaik/Github/radvot/website
npm ci
npm run dev
# Open http://127.0.0.1:5173/story

npm run build
npm run test:engine
npm test -- --workers=1
```

Dev and preview both use strict port 5173; use one server at a time. Playwright reuses an existing server, so stop a dev server before testing if production-preview verification is required. Tests require installed Google Chrome. Direct route hosting requires the usual Vite SPA fallback to `index.html`.

## Known limitations

- Verification uses headless installed Chrome with desktop, tablet and touch-mobile emulation. No physical-phone, Safari or Firefox performance certification was performed.
- The lazy 3D bundle is approximately 837 kB minified / 226 kB gzip and triggers Vite's 500 kB chunk warning. It is not downloaded by the homepage or demo. Low-end GPU frame rates have not been measured.
- Dense evidence/retest copy requires internal panel scrolling on short mobile displays. The complete text edition offers a conventional scrolling alternative.
- The visual style is procedural technical illustration. Portal glow is shader-based, not physically accurate volumetric lighting; no external models, cinematic audio, video or baked scenes are used.
- No live EPSS lookup, actual mitigation, operational backend or autonomous security execution is present.
- GitNexus could not establish a symbol graph or Git diff for this uncommitted enclosing repository. Preservation was checked using file hashes and direct reference inspection.

## Validation and visual evidence

Final production build and tests completed successfully on 2026-11-04:

```text
npm run build
✓ 640 modules transformed.
dist/assets/StoryWorld-BRIhETeV.js  837.22 kB │ gzip: 225.82 kB
(!) Some chunks are larger than 500 kB after minification.
✓ built in 1.92s

npm run test:engine
ℹ tests 14
ℹ pass 14
ℹ fail 0
ℹ duration_ms 131.18675

npm test -- --workers=1
Running 63 tests using 1 worker
63 passed (3.1m)
```

The final full browser run includes 15 new story checks (five tests across three viewport projects) and 48 existing homepage, skull, mission and demo checks. Story checks cover 13 representative/intermediate scroll positions, reverse traversal, exact activation state, pause image stability, resume, chapter navigation, selected-finding mitigation, all three retest outcomes, skip, replay, reduced motion, unavailable WebGL, keyboard controls, accessibility scans, narrow portrait/landscape overflow, both demo handoff modes, existing-session preservation and absence of story fetch/XHR/WebSocket requests. Direct navigation to chapter seven was corrected during visual review so all six components are active before its retest controls are used.

There are **57 retained screenshots** in [the visual evidence index](artifacts/story/README.md). All narrative stages, portal/core intermediate states, partial/full letter assembly and handoff were visually inspected across desktop/mobile captures; tablet and compact-layout captures were also inspected during layout correction. Screenshot generation alone was not treated as visual approval. These are review artifacts, not golden-image pixel assertions.

- [Red/Blue infrastructure](artifacts/story/desktop/01-red-blue.png)
- [Portal formation](artifacts/story/desktop/04a-portal-forming.png)
- [Emerged Intelligence Core](artifacts/story/desktop/04b-intelligence-core.png)
- [Evidence graph](artifacts/story/desktop/06-evidence-graph.png)
- [Verified retest](artifacts/story/desktop/retest-Verified-Resolved.png)
- [Geometric assembly in progress](artifacts/story/desktop/09a-geometric-assembly.png)
- [Completed RADVOT reveal](artifacts/story/desktop/09b-radvot.png)
- [Mobile portal/core](artifacts/story/mobile/04b-intelligence-core.png)
- [Mobile demo handoff](artifacts/story/mobile/10-demo-handoff.png)

The final SHA-256 comparison covered 48 pre-existing project files: eight expected files changed, none disappeared, and no existing interactive-demo or ProductDemo file changed. GitNexus's final change-detection attempt still failed on the missing Git HEAD; it is not reported as passed. No test result here implies physical-device GPU performance or compatibility outside the tested Chrome environment.
