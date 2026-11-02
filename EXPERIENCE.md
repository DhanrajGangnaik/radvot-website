# RADVOT typography and workflow refresh

## Scope

Marketing website only. No backend imports, security operations, authentication changes, enrollment changes, notification settings, commits, or deployment. Hero node selection, agent configuration, enrollment, approval, findings and retests are browser-local demonstrations.

## Typography and assets

No installable Armstrong font or applicable web embedding license was supplied. Orbitron is the explicitly chosen futuristic substitute (700 for wordmark/major display, 400–500 for section headings). Manrope is used for body, navigation and product-interface text. Both variable fonts are self-hosted and unmodified; their SIL OFL licenses are included in `public/fonts/`.

Sources:
- https://github.com/google/fonts/tree/main/ofl/orbitron
- https://github.com/google/fonts/tree/main/ofl/manrope

The design tokens in `src/experience.css` restore the requested deep violet, royal purple, lavender, burgundy, pink, and crimson palette. The large cube image is no longer rendered or requested. Existing original image assets remain preserved. The hero uses CSS perspective, SVG paths and HTML buttons; WebGL and third-party animation dependencies are unnecessary. System fonts remain a fallback if fonts fail to load.

## Interaction model

- Exactly five header links; no header CTA. One section scroll margin, stable underline, and scroll-position active detection.
- Mobile menu supports Escape, returns focus to its trigger on Escape, and closes after choosing a destination.
- Hero: four keyboard/touch selectable workflow nodes with a live text readout. Perspective responds only to a fine pointer. Animation pauses offscreen, when the page is hidden, or via Pause motion. Reduced motion disables movement while keeping all actions available.
- Product demo: Create Agent → Deploy Agent → Natural Language → Generate Reports. Each step is directly selectable. Next advances; Restart resets all demo state. The example assessment action requires explicit checkbox approval. Navigation into the report remains available as a sample preview, clearly not execution.
- Reports have selectable findings, source-linked historical score data, evidence disclosures, mitigation guidance, and independent sample retest states. Unmatched configuration findings have no fabricated CVSS or EPSS values.
- Footer email and Get in Touch use `mailto:dhanrajgangnaik47@gmail.com`. There is no contact form, delivery service, frontend credential or false submission confirmation.

## Score data and claims

`assets/epss-log4shell-2025-03-01.json` preserves the fetched FIRST response. For CVE-2021-44228 it reports EPSS 0.971120000 (97.112%) and percentile 0.998900000 (99.89th), dated 2025-03-01. This is explicitly historical, never presented as current telemetry. CVSS v3.1 is 10.0 Critical, independently referenced to NVD.

- https://api.first.org/data/v1/epss?cve=CVE-2021-44228&date=2025-03-01
- https://www.first.org/epss/using-epss
- https://nvd.nist.gov/vuln/detail/CVE-2021-44228

EPSS estimates exploitation in the wild within the next 30 days from its score date. Its percentile is a population ranking, not probability. CVSS describes severity. Asset associations, evidence, risk ordering, approvals and follow-up results are fictional. Finding a package version does not prove exploitability. The demonstration is not evidence of implemented EPSS ingestion, automated scoring, an agent creation UI or end-to-end remediation tracking; the capability matrix in `CONTENT-EVIDENCE.md` remains authoritative.

## Files

- `src/main.jsx`: integrates the new components, five-link header, footer contact.
- `src/HeroSystem.jsx`: interactive perspective workflow scene.
- `src/ProductDemo.jsx`: four-step demonstration and reporting UI.
- `src/motion.js`: pointer interpolation, header-aware active section detection, resize handling.
- `src/experience.css`: typography, tokens, responsive scene, reporting, navigation.
- `src/premium.css`: removes the superseded multicolor overrides.
- `index.html`: preloads self-hosted fonts.
- `public/fonts/`: original font binaries and licenses.
- `tests/`: updates regression checks to the current four-step workflow and hero.

## Local commands

```sh
cd /Users/dhanrajgangnaik/Github/radvot/website
npm run dev
# Or production output:
npm run build
npm run preview
# Browser regression suite:
npm test -- --workers=1
```

URL: http://127.0.0.1:5173/ . Development and preview share that port; run one at a time.

GitNexus impact was attempted for App, Walkthrough, usePageEffects and the new ReportPreview. The index has incomplete JSX call edges and does not yet contain ReportPreview. Direct inspection confirms root → App → ProductDemo → ReportPreview, and App → usePageEffects/HeroSystem. No backend callers. `detect_changes` is blocked by the enclosing repository's missing HEAD; no initial commit was created.

## Validation results

- Production build passed (React/Vite; no new runtime dependencies).
- Full regression suite: 27 passed across desktop, tablet, and touch-mobile projects.
- Responsive sweep: 1920, 1440, 1024, 768, 390, 375, and 320 pixels; no horizontal overflow or clipped hero heading.
- Verified all five navigation destinations, stable active-link geometry, scroll detection, mobile open/close/Escape, FAQ keyboard/tap controls, contact hrefs, hero selection, pointer tilt, animation pause/offscreen/reduced-motion behavior, complete demo, approval state, score distinctions, and restart.
- Axe WCAG A/AA checks passed on each workflow stage and open panels. Browser-local demonstrations issued no external requests and produced no runtime errors.
- Automated Chrome sampling measured CLS 0 and approximately 16.7 ms median frame intervals. These are local measurements, not a guarantee for all devices.
- Desktop and mobile hero, report, FAQ and full-page screenshots were captured and inspected. Final screenshots: `/private/tmp/radvot-delivery-screenshots/`; broader regression artifacts: `/private/tmp/radvot-experience-verified/` and `test-results/`.
- Limits: no actual Armstrong license/files were provided; Orbitron is the documented substitute. Physical-device/Safari testing was not performed. GitNexus diff verification cannot run without a repository HEAD.
