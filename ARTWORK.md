# Assets and typography

The Third Force uses procedural Three.js geometry. Its Red/Blue networks, portal and six-part Intelligence Core are unchanged by the routing cleanup. The demo retains its existing CSS/SVG infrastructure illustrations.

The supplied `logo.jpg` and historical concepts in `assets/originals/` remain preserved as source references. They are not imported by the retained experiences or emitted into the production build. The old skull component and unused public TTF font copies were removed.

Both experiences retain self-hosted Space Grotesk headings and Manrope body typography, with font-display swap and preloading:

- `public/fonts/space-grotesk-latin.woff2` and `SpaceGrotesk-OFL.txt`
- `public/fonts/manrope-latin.woff2` and `Manrope-OFL.txt`

The existing `public/favicon.svg` remains. No external font service is contacted at runtime.
