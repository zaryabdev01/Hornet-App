// M3 Phase 3 — approved {model, prompt version, schema version} bundles.
//
// Adding a bundle here requires a code change and a deploy — never automatic — which
// preserves the same discipline as the M1 model pin: exact stable identifiers only, activated
// only after reference/regression tests pass on that exact combination.
//
// The currently active bundle is chosen by the ACTIVE_BUNDLE env var (proxy/.env) and MUST be
// an exact match for one of the strings below, checked twice:
//   1. At startup — the proxy refuses to boot on an unlisted bundle (a misconfigured deploy
//      should fail loudly, not silently run on an unvalidated combination).
//   2. At request time — the mobile app declares the bundle it was built against via the
//      X-Protocol-Bundle header (src/constants/branding.js, ENGINE.protocole); a mismatch
//      against the proxy's active bundle is rejected rather than silently served, so an app
//      release and a proxy deploy can never drift into an untested pairing of each other.
//
// Rollback: revert ACTIVE_BUNDLE to a previous entry still listed here — no code change needed,
// since the prior bundle was already approved and already passed its own regression run.
const APPROVED_BUNDLES = [
  'gemini-3.6-flash+prompt-V2.5+schema-V1.9',
];

function parseModelFromBundle(bundle) {
  return bundle.split('+')[0];
}

module.exports = { APPROVED_BUNDLES, parseModelFromBundle };
