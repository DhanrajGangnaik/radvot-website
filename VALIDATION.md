# RADVOT validation — 2026-11-03

## Results

- Production build: passed, Vite 6.4.5. JavaScript 178.68 KB / 55.96 KB gzip; CSS 41.37 KB / 9.80 KB gzip. Active WOFF2 font files total approximately 47 KB. No added runtime libraries.
- Browser suite: **24 passed** in 36.8 seconds using installed Google Chrome and one Playwright worker. A final targeted touch-menu test also passed, including axe on the settled open menu and a refreshed screenshot.
- Main viewports: desktop 1440×1000, tablet 768×1024, touch-mobile 390×844. Additional layout sweep: 1920, 1280, 1024, 768, 640, 375 and 320px wide.
- No horizontal overflow in tested widths or demo/report states; hero heading remains within its container.
- Navigation: equal-height desktop controls, no geometry shift on selection, correct header offsets and active state, animated anchor navigation, mobile open/close/Escape, focus return, outside dismissal, inert closed menu, resize transitions and touch controls.
- Demo: all four stages, direct selection/prerequisite guidance, empty-input validation, enrollment state, explicit approval gate, stage heading focus, report completion, complete reset and post-reset gating.
- Report: priority/CVSS sorting, all three filters, selected evidence and mitigation, disclosure control, unevaluated PVSS field.
- Keyboard: skip link, disclosure controls, demo approval and completion, visible focus styling. Axe WCAG 2 A/AA and 2.1 AA checks found zero violations in initial, expanded/planned and completed states across all three projects. Automated results are not a complete accessibility certification.
- Motion: pointer light, button hover, global pause/resume, offscreen pause, reduced-motion static presentation and unchanged demo functionality.
- Runtime: no page errors, broken static resources or unexpected external requests during monitored loading/preview interaction. Fonts resolve locally. No hero raster/unused TTF requests.
- Local performance sample: CLS **0.0000** in all three projects. Median requestAnimationFrame interval **16.7 ms**; p95 **16.7–16.8 ms**. These brief Chrome scheduling measurements do not certify performance on every device.
- HTTP check: http://127.0.0.1:5173/ returned 200. The existing local preview remains available.
- `git diff --check`: passed.

## Screenshots

Generated artifacts are ignored by Git, under `test-results/`. Desktop, tablet and mobile hero, full-page, completed-demo and report captures were produced. Desktop/mobile reports, hero compositions and overall section layout were visually inspected. Section-only screenshots hide the sticky header and skip link for a clean capture; the site itself is unchanged by that capture option.

Delivery copies:
- `test-results/delivery/desktop-hero.png`
- `test-results/delivery/mobile-hero.png`
- `test-results/delivery/desktop-full.png`
- `test-results/delivery/mobile-full.png`
- `test-results/delivery/desktop-demo.png`
- `test-results/delivery/mobile-report.png`
- `test-results/delivery/mobile-menu.png`

## Code scope

GitNexus upstream impact was run for changed/removed existing components and hooks before editing. Reported risk was LOW; no HIGH/CRITICAL warnings. JSX imports/rendering were also inspected because the graph does not capture every component edge. The old page, graph, duplicate demo and motion modules have been replaced by four isolated marketing components.

`detect_changes(scope: all)` succeeded and reported LOW risk, with no affected indexed processes. New/untracked components and removed files were additionally reviewed with Git status and direct source inspection; the detector's tracked diff is not exhaustive coverage of untracked files. All changes are within this marketing website. No backend, credentials, operational agent state, installation behavior or model artifacts were changed. No deployment, commit or push was performed.

## Remaining limits

- PVSS methodology/scale is not established. The preview correctly displays “Not evaluated”; numeric CVSS and priority examples are explicitly synthetic.
- Supplied logo artwork is unavailable. Plain text navigation and the simple R favicon remain honest fallbacks; the effect-driven hero does not depend on a logo image.
- Safari, Firefox and physical-device testing were not performed. Touch behavior was tested using Chrome mobile emulation.
- No operational product behavior was executed or certified. Capability classification is based on source inspection documented in CONTENT-EVIDENCE.md.

## Reproduce

```sh
cd /Users/dhanrajgangnaik/Github/radvot/website
npm run build
npm test -- --workers=1
npm run preview
```

Do not start a second server if port 5173 already hosts the preview. `npm run dev` is the alternative development command on the same port.
