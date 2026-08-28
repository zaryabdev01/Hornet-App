# ApiSave — M3 Implementation Plan

**Status:** Planning reference. Confirmed scope per client-approved `ApiSave_M3_Preimplementation_Clarifications.md`.
**Gate:** That document states M3 work should not start until the client confirms acceptance criteria (point 1) and the architecture/atomic-bundle question (point 4). Implementation proceeding per instruction — confirm this gate has actually been cleared with Nordine if it hasn't been already.

---

## Confirmed scope

**Core deliverable:** move the Gemini call behind a server-side proxy, bundling three things:

1. **Native structured-output enforcement** — Gemini's `responseSchema` constrains every field to legal enum values; safe fallback path if native validation fails; native-valid rate and fallback-activation rate reported as two separate metrics, never blended.
2. **Server-side configurable model identifier** — model string moves out of `src/services/geminiApi.js` (mobile bundle) into proxy-side config: env var + hardcoded allowlist of approved exact model strings, refuse-to-start on anything unlisted. Rollback = revert env var, no app rebuild.
3. **Atomic protocol bundle** — {model identifier, prompt version, schema version} versioned and activated together as one unit (extending `ENGINE.protocole` in `src/constants/branding.js`), so a model can never silently run against an unvalidated prompt/schema combination.

**Fixed acceptance bar:**
- All 10 unchanged M2 reference images rerun through the new path, raw outputs included in the deliverable
- Photo #9 → ROUGE, zero unjustified VERT anywhere
- Photos #1 and #10 become permanent tracked cases in every future validation round

**Explicitly NOT part of M3:**
- Photo #10 mandatory-per-trait-field experiment — separate 1.5–2.5 day piece, only between M3 and M4, only with explicit go-ahead
- M4's revised stability protocol — priced after M3 results are in front of the client
- Firebase Remote Config — explicitly rejected as disproportionate to this app's scale

---

## Phases

### Phase 1 — Proxy skeleton — DONE (2026-08-25)
- Built `proxy/` (Express, `server.js`) — a minimal transparent forward-proxy holding `GEMINI_API_KEY` server-side, mirroring the exact `PROXY_URL`/`PROXY_SECRET`/`X-App-Secret` convention the codebase already established for the retired OpenAI proxy (`src/services/visionApi.js`), rather than inventing a new auth shape.
- `src/services/geminiApi.js` now calls `${PROXY_URL}/api/analyze` instead of Gemini directly — request/response shape is unchanged, so `useOfflineSync.js` and `HomeScreen.js` (the only two callers, both using the public `getVisionObservation()`) needed no changes.
- Verified locally: 401 on wrong/missing secret (2 cases), and a real end-to-end Gemini call through the proxy returning a valid, schema-passing observation (`proxy/test-proxy-e2e.cjs`).
- M1/M2 sanity-check scripts re-run clean — untouched, since they call Gemini directly for regression testing and don't go through `geminiApi.js`.
- **Not yet done:** actual deployment (proxy only tested on localhost so far), and removing the now-unused `GEMINI_API_KEY`/`geminiApiKey` EAS secret plumbing so a future build can't accidentally re-embed the raw key.

### Phase 2 — Structured output enforcement — DONE (2026-08-25)
- `proxy/observationSchema.js`: Gemini-native `responseSchema` built directly from `src/core/schema.js`'s current rules (not the stale OpenAI-era schema in the retired `visionApi.js`). Deliberately stricter than `schema.js` in one place — `confidence` and the structure sub-fields are marked `required` here even though `schema.js` treats them as optional for backward-compat with old stored data, because `prompts.js` already always asks the model to fill every field regardless of mode.
- Verified against the live API before building the full schema: Gemini's REST endpoint accepts both `"OBJECT"`/`"STRING"` and lowercase casing for `Schema.type` — uppercase used as the documented canonical form. (Google's own docs gave inconsistent casing across two separate fetches during this work — resolved by testing directly against the live API rather than trusting either doc page.)
- `proxy/server.js`: native schema-constrained attempt first; falls through to an unconstrained fallback call on **either** a transport-level failure (timeout/connection error) **or** a 200 response that isn't a well-formed observation. First implementation only treated the second case as fallback-worthy — caught and fixed via the regression run itself (`ref_image_07.jpg` hit a native-attempt timeout and got a hard error instead of a fallback-served result; fixed, then a later run of `ref_image_03.jpg` hit the same timeout class and correctly fell back to a fully valid result, confirmed via server logs).
- `GET /metrics` — native-valid count/rate and fallback-activation count/rate reported as separate numbers, per the confirmed acceptance criteria (never blended into one success rate).
- **Full M2 reference-set regression run through the proxy (all 10 images, live):** 9/10 native, 1/10 fallback, **zero validation failures**, Photo #9 → ROUGE as required. The two non-matching verdicts (`ref_image_01`, `ref_image_03` verdict mismatches vs. expected) are the same pre-existing Gemini call-to-call variance documented in every prior round of this engagement — not new, not caused by Phase 2. Raw outputs: `proxy/phase2-regression-report.json`.

### Phase 3 — Model configuration + atomic bundling — DONE (2026-08-25)
- `proxy/allowlist.js`: `APPROVED_BUNDLES` array of exact `{model}+prompt-{version}+schema-{version}` strings. Adding one requires a code change + deploy — never automatic, matching the M1 pin discipline.
- `ACTIVE_BUNDLE` env var replaces the standalone `GEMINI_MODEL` — the model is now parsed *out of* the bundle string, not configured independently, so it structurally cannot drift out of sync with the prompt/schema version it was declared alongside.
- Startup: proxy refuses to boot if `ACTIVE_BUNDLE` isn't in the allowlist — verified directly (ran the server with an unlisted bundle, confirmed `process.exit(1)` with a clear error, not just written and assumed).
- Request-time enforcement (the actual "no untested pairing" guarantee, not just a startup check): `src/constants/branding.js`'s `ENGINE.protocole` is sent as `X-Protocol-Bundle` on every request; the proxy rejects (409) any request whose declared bundle doesn't exactly match its own `ACTIVE_BUNDLE` — verified with a deliberately mismatched bundle, correctly rejected with a clear error body.
- Rollback: revert `ACTIVE_BUNDLE` to a prior allowlisted entry, no code change.
- **Operational trade-off, deliberate, not an oversight:** rolling out a new model on the proxy before the matching app update reaches users will reject those older clients (409) until they update. This is the intended fail-closed behavior — running an app's prompt/schema against an unvalidated model is exactly the risk this mechanism exists to prevent — but it means **proxy and app releases need to be sequenced**, not independent. Worth flagging to Nordine explicitly before this ships, since it's a real process change, not just code.
- `src/constants/branding.js`'s stale `promptVersion`/`schema` values (were `V2.1`/`V1.7`, several rounds out of date) corrected to the actual current `V2.5`/`V1.9` as part of this work — caught because they needed to be accurate for the bundle string itself, not cosmetic.

### Final combined verification (Phases 1+2+3 together)
Full M2 reference-set (10 images) rerun live through the complete stack: 10/10 native-valid, 0 fallback needed this run, 0 validation failures, Photo #9 → ROUGE. 9/10 verdicts matched expected outcomes exactly; the one mismatch (`ref_image_01`) is the same pre-existing Gemini call-to-call variance documented repeatedly throughout this engagement, not a regression from this work.

### Phase 4 — Validation
- Rerun all 10 M2 reference images live through the new proxy path, capture raw outputs
- Confirm photo #9 → ROUGE, zero unjustified VERT
- Confirm photos #1 and #10 wired into the permanent regression set
- Produce the M3 deliverable report in the same evidence-first format as every prior round

---

## How this improves current results — including the honest limits

- **Eliminates a whole class of malformed-response risk.** Every test script in this project currently carries a manual `JSON.parse` + regex-fallback safety net. Native `responseSchema` makes an illegal enum value structurally impossible to emit.
- **Does NOT fix photo #10.** This is a precision fix; photo #10 is a recall failure (the model choosing not to write an optional tag) — a different failure shape, explicitly deferred to its own separately-scoped experiment.
- **Removes a real security exposure** — the Gemini key currently ships inside the app bundle.
- **Turns future model changes into a config change, not a build/resubmission cycle.**
- **Closes a silent-drift risk**: a model version changing in isolation from the prompt/schema it was validated against becomes structurally impossible once bundled atomically.
