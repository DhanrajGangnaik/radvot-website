# RADVOT refinement — implementation record

## Issues found

- Four generations of styling overrode one another, making spacing and breakpoints difficult to maintain.
- Historical image/graph implementations and competing workflow models remained in the source tree.
- Navigation needed a single header-aware anchor offset, stable geometry and deliberate mobile focus behavior.
- Existing typography and small interface labels weakened readability and hierarchy.
- Workflow navigation could bypass the conceptual create/enroll/approve journey; scoring fields needed clear provenance.
- Documentation described several mutually inconsistent versions of the site.

## Implemented plan

1. Inspect the frontend, operational claim evidence and upstream symbol impact.
2. Replace the hero with original CSS/SVG atmosphere and an explicitly illustrative telemetry panel.
3. Consolidate styles, establish Space Grotesk/Manrope typography, and rebuild responsive navigation.
4. Implement one four-stage guided journey with local creation, enrollment, objective review and explicit approval.
5. Separate an exploratory report interface with working sort, filters, selected finding details and mitigation.
6. Validate responsive layouts, keyboard/touch controls, motion, local-only behavior, build and accessibility.

## Visual and interaction design

The requested violet, royal purple, lavender-white, burgundy, pink and crimson palette is applied through restrained gradients, inset borders, elevated panels and soft orbital lines. No large hero image is rendered or shipped. A limited ambient aurora, sparse particles, signal motion and pointer-responsive light provide movement without an abstract attack map.

Headings use self-hosted Space Grotesk; readable body and controls use Manrope. Fonts are preloaded, with fallbacks. No animation library or runtime dependency was added. Source is formatted and separated into Header, Hero, ProductDemo and ReportPreview components.

Desktop navigation uses equal-height controls and an absolutely positioned active underline. One target scroll margin accounts for the sticky header; active detection uses measured header height. On mobile the menu is an independent fixed panel with touch targets, Escape/focus return, outside dismissal, and inert closed content.

The demo preserves real conceptual prerequisites: create a profile before enrollment; enroll before preparing an assessment; approve the sample scope before producing its report. Direct stage selection exposes clear prerequisite guidance. Restart clears every state. Input text remains local and does not pretend to invoke an NLP model.

Reports offer priority/CVSS sorting, status filters, selectable findings, explanations of priority, synthetic evidence, mitigation and follow-up. CVSS values and priority order are authored examples; PVSS remains unevaluated. The public interface contains no legacy-brand narrative.

## Scope

Only the public marketing website is changed. No backend APIs, identifiers, credentials, agents, operational data, model artifacts or installation behavior are modified. Existing real email and LinkedIn destinations are preserved. No deployment, commit or push was performed.
