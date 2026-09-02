# ApiSave — M3 branch status (`milestone-three`)

**As of 2026-09-02.** This branch carries all M3 code implemented so far. It is **not ready
to merge or build from** — the proxy has never been deployed and the app has no
direct-to-Gemini path once these changes are active. See "Not done" below.

## What is on this branch

### App-side (restored from `git stash` — "M3 Phase 1-3 proxy work")

- `src/services/geminiApi.js` — the analysis call now targets `${PROXY_URL}/api/analyze`
  instead of calling Gemini directly. Sends `X-App-Secret` (shared app secret) and
  `X-Protocol-Bundle` (the atomic `{model + prompt version + schema version}` string).
  Response handling added: `401` → proxy access denied, `409` → app out of date / bundle
  mismatch, `403` → key rejected server-side. `GEMINI_API_KEY` import removed from this file.
- `src/constants/branding.js` — `ENGINE.protocole` is now the authoritative atomic bundle
  identifier: `gemini-3.6-flash+prompt-V2.5+schema-V1.9`. `moteur` / `promptVersion` /
  `schema` corrected to the real current values (`1.11` / `V2.5` / `V1.9`).

### Proxy (`proxy/` — Express, was previously untracked, now committed)

- `server.js` — Phases 1-3: transparent forward-proxy holding `GEMINI_API_KEY` server-side;
  native `responseSchema` attempt first with an unconstrained fallback on transport failure
  *or* a malformed 200; `GET /metrics` reports native-valid rate and fallback-activation
  rate as **two separate numbers**; `X-Protocol-Bundle` request-time enforcement (409 on
  mismatch); refuse-to-start if `APP_SECRET` / `GEMINI_API_KEY` / `ACTIVE_BUNDLE` are unset
  or `ACTIVE_BUNDLE` is not allowlisted.
- `allowlist.js` — `APPROVED_BUNDLES` (currently one entry); `parseModelFromBundle()` so the
  model is derived from the bundle, never configured independently.
- `observationSchema.js` — Gemini-native `responseSchema` built from `src/core/schema.js`'s
  current rules; `isWellFormedObservation()` used to decide native-valid vs. fallback.
- `package.json`, `.env.example`, `README.md`.
- `test-proxy-e2e.cjs`, `test-proxy-full-regression.cjs`, `phase2-regression-report.json` —
  local verification scripts and the Phase 2 regression evidence (10 M2 images through the
  proxy: 9/10 native, 1/10 fallback, 0 validation failures, Photo #9 → ROUGE).

`proxy/.env` and `proxy/node_modules/` are gitignored and intentionally not committed.

## Not done — required before this can merge or ship

| Item | Status |
|------|--------|
| Proxy hosting decision (Render / Railway / Fly.io / VPS) | **Awaiting client** — asked, not yet answered |
| Proxy deployed to a reachable URL; `PROXY_URL` / `PROXY_SECRET` set in the app build config (EAS env), `APP_SECRET` / `GEMINI_API_KEY` / `ACTIVE_BUNDLE` set as the host's secrets | Not started (only run on `localhost` so far) |
| Move the Gemini key out of the app / EAS `GEMINI_API_KEY` env into the proxy host only; remove the now-dead `geminiApiKey` plumbing from `app.config.js` | Blocked until the proxy is live (that env var is currently in use for the M2 key fix) |
| Phase 4 validation deliverable — 10 M2 reference images through the deployed proxy, raw outputs, Photo #9 → ROUGE / zero unjustified VERT, Photos #1 & #10 into the permanent regression set, M3 report in the usual evidence-first format | Not started |
| Client sign-off on the 6 M3 acceptance criteria + the exact bundle-string format | Open |
| Flag the proxy/app release-sequencing trade-off to the client (a new model on the proxy 409-rejects older app versions until they update) | Open |
| `proxy/README.md` "Status" section still says "Phase 1 only" — stale, `server.js` is Phases 1-3 | Cosmetic, fix on deploy |

References: `docs/ApiSave_M3_Implementation_Plan.md`,
`docs/ApiSave_M3_Preimplementation_Clarifications.md`.
