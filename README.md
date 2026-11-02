# RADVOT marketing website

Current implementation and validation notes: [EXPERIENCE.md](EXPERIENCE.md). The current page uses a CSS/SVG workflow hero, Orbitron/Manrope typography, a four-step agent-to-report preview, and the official mailto contact. Older visual notes below describe prior iterations.

Local-only React 18 + Vite 6 site. Operational PurpleClaw code is not imported or modified. There is no backend integration or tracking. Runtime dependencies are React and React DOM; styling uses local CSS and system fonts.

```bash
cd /Users/dhanrajgangnaik/Github/radvot/website
npm ci
npm run dev
```

Open http://127.0.0.1:5173 (also accessible at http://localhost:5173 on this computer).

Production build and preview:

```bash
npm run build
npm run preview
```

Both development and preview use port 5173 with strict port selection; stop one before starting the other. Built files are in `dist/`.

Browser validation (requires installed Google Chrome):

```bash
npm run build
npm test
```

Playwright starts a preview server automatically if port 5173 is not already serving. It exercises desktop/tablet/mobile navigation, six stages, evidence details, restart/next, capability filters, keyboard FAQs, local-only requests, reduced motion, horizontal overflow, and axe accessibility scans. Screenshots go to `test-results/`.

Content and claim sources: [CONTENT-EVIDENCE.md](CONTENT-EVIDENCE.md). Walkthrough data: `src/content.js`. Layout and interactions: `src/main.jsx`. Responsive styling: `src/styles.css`.

The visual refresh uses midnight navy and ice blue, optimized supporting illustrations, CSS motion with a pause control, and collapsible capability/trust details. [ARTWORK.md](ARTWORK.md) records exact generation prompts and asset paths. New styles are in `src/visual-refresh.css`; animated diagrams are in `src/visuals.jsx`.

**2026-11-02 update:** the page now uses the requested violet/pink/crimson palette and includes a functional attack-path graph, four-stage assessment sequence, five-category dashboard, hero lighting, pointer/scroll effects, and expanded motion controls. See [PREMIUM-MOTION.md](PREMIUM-MOTION.md) for behavior, performance and validation details. Run the full browser suite with `npm test -- --workers=1`.

**Incomplete brand integration:** the supplied logo was not attached or found in the workspace. Its local path has been requested. The site states this in the footer; the new conceptual illustrations are not replacement logos. The plain R favicon is a documented fallback. Original logo preservation, optimization and logo-specific metadata require the real asset and remain outstanding. No production URL or domain has been invented.
