# Motion and performance

Current implementation: `src/components/Hero.jsx`, `Header.jsx`, `src/main.jsx`, and `src/styles.css`.

- Hero: CSS radial aurora, perspective grid, seven sparse particles (fewer on mobile), SVG orbital paths and a compact HTML telemetry panel. No raster hero, WebGL, graph library or heavy animation dependency.
- Pointer light: fine-pointer devices only; interpolated CSS variables in requestAnimationFrame. React does not rerender every frame. The loop stops once interpolation settles.
- Hero continuous effects pause outside the viewport, when the document is hidden, or through Pause motion. Event listeners, observers and frames are cleaned up.
- Scroll reveals use Intersection Observer and small transform transitions. Essential text is never hidden while waiting for animation.
- Buttons/cards use restrained elevation; mobile omits telemetry tilt and pointer effects.
- Reduced motion disables animation, transitions and smooth scrolling. All forms, navigation, disclosures, report sorting and demonstration actions remain available.
- No artificial loading screen, countdown, remote telemetry, fabricated successful submission or global cursor override.

See VALIDATION.md for measured checks. These local Chrome checks are not a guarantee of frame rate on every device.
