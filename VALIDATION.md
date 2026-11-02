# Local validation — 2026-11-01

## Premium interactive update — 2026-11-02

The new production build passes. The 21-test Chrome suite passes with one worker at desktop 1440×1000, tablet 768×1024, and mobile 390×844. Tests cover node hover/focus/click/tap, inspector content, highlighted connections, four assessment stages, automatic completion, pause/replay/reset, offscreen pause, global motion pause, dashboard tabs and arrow/Home/End keys, reduced motion, feature expansion, existing walkthrough/navigation/FAQ behavior, and axe checks. No runtime errors, external requests during demo interactions, or horizontal overflow were observed.

Loading/layout samples recorded CLS 0 at all three sizes; sampled median animation-frame intervals were ~16.7 ms. These are local Chromium observations, not device-wide performance guarantees. The interactive module is fetched once as a separate lazy chunk, about 4.24 KB gzip; main JavaScript is about 56.46 KB gzip. No animation/graph/3D dependencies were added.

Updated screenshots: `test-results/desktop-premium-full.png`, `tablet-premium-full.png`, `mobile-premium-full.png`, plus corresponding `*-intelligence.png` and `*-premium-hero.png` captures. The screenshot process waits for lazy images and removes fixed overlays from section-only captures. Desktop and mobile captures were visually reviewed.

The supplied logo is still unavailable, so an entrance for that specific asset remains blocked. Existing plain-text branding has a restrained entrance. GitNexus impact is LOW for modified components; the change detector was invoked but cannot diff without a HEAD commit. No operational code was changed or deployed. See PREMIUM-MOTION.md for implementation details.

## Earlier visual refresh

- `npm run build`: passed after the visual refresh with Vite 6.4.5. Output: HTML 1.36 kB, CSS 37.56 kB, JavaScript 169.56 kB; compressed CSS 8.80 kB and JS 54.08 kB.
- `npm test -- --workers=2`: 12/12 Playwright tests passed in installed Google Chrome in 21.2 seconds. Desktop 1440×1000, tablet 768×1024, mobile 390×844; extra overflow check at 320px.
- All six stage buttons, sequential Next, terminal disabled state, Restart, and all evidence disclosures exercised.
- Navigation anchors, mobile open/close/Escape, capability filters, and keyboard FAQ open/close exercised.
- No browser runtime errors or external requests during walkthrough testing.
- Zero axe violations for WCAG 2 A/AA and 2.1 AA tags across all six stages at all three sizes, plus open mobile navigation. This automated result is not a complete accessibility certification.
- Reduced-motion scroll behavior, disabled animations, Pause/Resume motion, and favicon response verified. Two responsive images load with explicit dimensions. Expandable capabilities and trust controls tested with keyboard input and axe while open. Entrance opacity fades were removed to keep text contrast stable during motion.
- Desktop, tablet, and mobile hero and full-page screenshots inspected in `test-results/`. These are ignored generated QA artifacts. No horizontal overflow in tested states.
- Only the isolated `website/` directory was created. Operational source was read for claims; no backend tests, security tools, credentials, or target connections were used.
- GitNexus CLI upstream impact was run before changing App and Walkthrough: LOW risk, zero indexed upstream callers/processes. JSX edges were reviewed manually. The detect_changes backend was called but could not compute a diff because the enclosing repository has no HEAD commit. Changed files were inspected; nothing was committed or deployed.

The production preview is served by `npm run preview` on http://127.0.0.1:5173 while the retained process remains running. Restart commands are in README.md.

## Outstanding

The actual RADVOT logo was unavailable. Its local path has been requested. Logo inspection, original preservation, optimized logo derivatives and logo-specific social metadata remain blocked on that file. The footer identifies this missing asset. A simple R favicon is used as permitted. The newly generated supporting illustrations are explicitly conceptual, stored with originals and optimized derivatives, and do not substitute for the logo. See ARTWORK.md.
