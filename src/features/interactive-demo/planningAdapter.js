import { planRequest, validatePlan } from "./engine.js";
// Public adapter is deliberately local-only. This module has no transport or secrets.
export const demoPlanningAdapter = Object.freeze({
  mode: "simulation",
  plan: planRequest,
  validate: validatePlan,
});
/** Future server adapter contract: plan(prompt, authorizedContext) -> structured proposal.
 * It must run in a separately authenticated application, never expose provider keys,
 * and validate target identity, capabilities, scope, authorization and approval server-side.
 * Planning cannot execute procedures. No endpoint is assumed by this website.
 */
export function operationalAdapter() {
  throw new Error("Live integration is unavailable in the public demo.");
}
