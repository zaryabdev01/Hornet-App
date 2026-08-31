# ApiSave — Project Overview & Engagement Context

**Purpose of this file:** context for starting a fresh Claude Code conversation on this project without re-deriving the whole history. Written 2026-08-28. Keep this updated as the engagement progresses — it will go stale otherwise.

---

## Who's who

- **You (the freelance dev)** — goes by **Zaryab** in all client-facing communication. Works with **Umair** (the actual machine/session operator — git user `Umair Ruman`, `programmerumair29@gmail.com`) under an outfit referred to as **Saarz Int**.
- **Nordine** (`hnininordine@gmail.com`) — the Upwork client. His company appears to be **Intellectual Holdings Ltd** (seen in the Apple Developer/App Store Connect team name) — not yet confirmed by him as usable externally, so don't publish that name anywhere client-facing without asking first.
- **Sadaf Hussain** — appears to be a CTO/manager on Zaryab's side; has directly relayed Apple ID credentials and 2FA codes for build/credential work.
- **Abiha Saqlain** — mentioned once in an internal Slack-style handoff, role otherwise unclear.
- A **colleague with a MacBook** does local Xcode builds/archives for iOS when needed (bypasses EAS's cloud build + Apple 2FA friction).

## What the product is

**ApiSave** — a React Native/Expo mobile app (SDK 54) for public detection/reporting of the Asian hornet (*Vespa velutina*, an invasive species in France/EU). A user photographs a suspected hornet or nest; the app returns an explainable safety verdict.

**Core architecture (the one thing to never violate):** a two-stage pipeline where the AI (Gemini) only ever produces a **neutral, structured observation** — it never decides the outcome. A separate, deterministic, pure-JS **Judge** (`src/engine/judge.js`) reads that structured observation and computes the final verdict. This separation is the product's core selling point (auditable, testable without AI) and must be preserved in any future work.

**Verdict taxonomy:** `ROUGE` (confirmed target — most safety-critical), `ORANGE_PLAFOND` (probable nest), `ORANGE_PROBABLE_NON_CIBLE` (look-alike non-target species), `ORANGE_INSUFFISANCE` (insufficient data, ask for a retake — the "fails safe" verdict), `VERT` (clear).

## Engagement structure

Originally scoped as a paid read-only audit ($350), then a 5-milestone implementation plan (M1+M2 combined at $1,500 after negotiation; M3/M4/M5 priced separately, M4 explicitly deferred/repriced pending M3 results).

### M1 — DONE, accepted
Critical Judge structure-override bug fix + Gemini model pin (`gemini-3.6-flash`, exact GA string, never `-latest`). Validated 10/10 on client reference images.

### M2 — logic accepted by client; final build verification in progress
Prompt/schema/Judge fidelity restoration, European Hornet (crabro) non-target routing, Non-Target Hymenoptera (wasp/Polistes) tiered rule. Went through 4 validation rounds (3/10 → 3/10 → 6/10 → 9/10), then a further field-test round after a real Android/iOS build reached the client. Current baseline: **`judge.js` V1.11, `prompts.js` V2.5, `schema.js` V1.9** — this is the active, client-approved logic.

**The Photo 1 saga (important precedent for how this client wants changes handled):** client reported a confirmed-target photo occasionally misfiring to ROUGE due to distance/resolution. Proposed a readability-gated ROUGE rule (V1.12), got explicit approval, implemented, validated with only 1 sample per case (looked clean) — then repeated sampling (7-8 runs per case) revealed a real ~1-in-3 false-retake cost on genuine targets that the single-sample check missed. Reported this correction honestly rather than let the optimistic number stand. Ran a further bounded diagnostic (no code) to see if a narrower signal existed — found none; the variance in `lisibilite`/`confidence` behaves as call-to-call self-rating noise, not a real signal, on both the failing and passing cases. Client agreed to **revert to V1.11** and keep Photo 1 as a documented residual limitation, only reconsider if M4 shows it's a frequent real-world pattern. **Lesson baked into practice now: any single-sample "impact looks minimal" claim must be re-validated with repeated live sampling before being trusted, especially on the ROUGE path.**

**Known residual limitations (documented, not bugs to silently re-open):**
- **Photo 1** — distant/small-subject confirmed targets can misfire to ROUGE; Gemini's own confidence/readability self-rating is unreliable at this range, not fixable with current fields.
- **Photo 5** — a hairy-body non-target (scoliid) under dim/glossy lighting doesn't reliably get the `morphologie_velue_compacte` tag; the pathway itself is proven correct (a similar photo in better lighting passes reliably).
- **New, not yet raised with the client**: a wings-folded-over-abdomen pose can cause a false ROUGE on what's very likely *Vespa mandarinia* (a different, non-target giant hornet species), because the wings occlude the multi-banded abdomen pattern that would otherwise disqualify it. Root-caused (Gemini's Q2 description explicitly claims the velutina signature that the occluded view superficially resembles) but **deliberately not fixed yet** — user's call was to ship the key-fix build first and gather Nordine's TestFlight feedback before doing more Judge/prompt work.

**Most recent M2 issue — Gemini key mixup (fixed as of last session, verify before assuming closed):** client reported "Too many Gemini requests" after ~10 analyses, persisting for hours. Root-caused: the Android/iOS builds he'd been testing were still running on **the developer's own personal free-tier Gemini key** (20 requests/day hard cap), not the paid key Nordine provided — because EAS's server-side env/secrets store was never populated, and `app.config.js` resolves `GEMINI_API_KEY` from whichever machine's local `.env` was present *when the build command was run*, which never happened with the client's key in place for any shipped build. Fix: rebuild locally via the colleague's Xcode flow with a **fresh `.env`** containing the client's key, and a **clean `expo prebuild --platform ios --clean`** (the native `ios/` folder is gitignored and regenerated per-machine — a stale one won't pick up a new key). This fix was in progress (colleague executing the rebuild) as of the last session — confirm whether it's actually been verified and sent before assuming this is closed.

### M3 — fully implemented locally, NOT shipped, NOT committed
Confirmed scope (`docs/ApiSave_M3_Preimplementation_Clarifications.md`): native Gemini `responseSchema` enforcement with a safe fallback path (native-valid vs. fallback-activation reported as separate metrics, never blended), a server-side proxy holding the real Gemini key (closing a real security exposure — the key currently ships inside the app bundle), server-configurable model identifier via an allowlist, and an atomic `{model, prompt version, schema version}` protocol bundle so a model can never silently run against an unvalidated prompt/schema pairing.

**Explicitly out of M3 scope:** the photo-#10-style mandatory-per-trait-field experiment (separate, client-approval-gated), M4's revised protocol (priced after M3 results reviewed), Firebase Remote Config (explicitly rejected as disproportionate).

**Current state: fully built (Phases 1-3), tested, and working — but sitting in `git stash` (`stash@{0}`, message "M3 Phase 1-3 proxy work"), not committed to `main`.** It was deliberately set aside so the urgent Gemini-key-mixup rebuild wouldn't accidentally ship half-finished proxy code that points at `localhost` (unreachable from any other machine). To resume: `git stash pop`. Full implementation notes and verification evidence: `docs/ApiSave_M3_Implementation_Plan.md`.

**Before this can actually ship:** (1) a hosting decision for the proxy — nothing chosen yet (Render/Railway/Fly.io/a VPS); (2) clean up the now-dead `GEMINI_API_KEY`/`geminiApiKey` EAS-secret plumbing so a future build can't accidentally re-embed a raw key; (3) confirm whether Nordine's formal M3 acceptance-criteria sign-off was ever explicitly received (implementation proceeded on the user's direct instruction without an explicit confirmation visible in-session — worth checking with Nordine directly rather than assuming).

**Important operational trade-off baked into the design, not yet explicitly flagged to Nordine:** once live, proxy and app releases must be sequenced together — rolling out a new model on the proxy before the matching app update reaches users will reject those older clients (409) until they update. Fail-closed by design, but a real process change worth surfacing before it ships.

### M4 — proposed, not started
Revised stability-testing protocol (tiered repeat counts, severity-based consistency thresholds, photos #1/#9/#10 permanently tracked). Priced only after M3 results are in front of the client. Full proposal in `docs/ApiSave_M3_Preimplementation_Clarifications.md` section 3.

### M5 — not started
Production release. **EAS project ownership is currently under the developer's own personal Expo account (`@zaryabraza`)**, not Nordine's — flagged as a temporary arrangement from early in the engagement (the original project ID Nordine expected access to was inaccessible) that needs revisiting before production. No CLI-based transfer exists in this eas-cli version; it's a web-dashboard action requiring Nordine to have his own Expo account.

---

## Key files

- `src/engine/judge.js` — the deterministic Judge. Currently V1.11 (the M2 baseline; V1.12's readability-gated ROUGE was tried and reverted — full reasoning in the version-history comment block).
- `src/core/prompts.js` — Gemini system/user prompts. Currently V2.5.
- `src/core/schema.js` — observation JSON validation rules. Currently V1.9.
- `src/services/geminiApi.js` — direct-to-Gemini call (current shipped state — the M3 proxy version is stashed, not active).
- `src/constants/branding.js` — `ENGINE.protocole` etc. Currently at the pre-M3 values; the M3 version (atomic bundle string) is in the stash.
- `proxy/` — the M3 server-side proxy (Express). Exists on disk but **is stashed in git, not committed**. Fully documented in its own `README.md`.
- `scripts/run-reference-set.cjs` — the main live-API regression harness: `node scripts/run-reference-set.cjs <images_dir_name>`. Reads `<dir>/expected_outcomes.json`, calls live Gemini, runs the current Judge, writes `report.json`/`report.md`. This is the standard tool for any "does this still work" question.
- `scripts/m1-sanity-check.cjs`, `scripts/m2-sanity-check.cjs` — synthetic (no API calls) regression tests for the Judge. Fast, free, run these first before any live-API testing.
- `test_images/` (M1 structure/nest set), `test_images_2/` (M2 insect set, 10 images), `test_images_3/` (client's field-test photos, 6 images), `test_images_4/` (ad-hoc colleague test photos, likely *V. mandarinia* not velutina — see residual limitations above) — all have `expected_outcomes.json`.
- `docs/` — every client deliverable so far, in matched `.md`/`.docx` pairs (pandoc-converted). This is a complete paper trail of the engagement; worth skimming filenames before assuming something hasn't been addressed yet.

## Working conventions established over this engagement

- **Never claim something works from a single sample.** The Photo 1 saga is the cautionary example — repeat live-API sampling (5+ runs) before trusting an "impact looks minimal" read, especially anything touching the ROUGE path.
- **Never touch ROUGE-path logic without explicit client sign-off first**, and always validate with real regression evidence (both the target case and the existing confirmed-ROUGE regression cases) before and after.
- **Diagnose before proposing, propose before implementing, validate after implementing** — this client explicitly wants the decision trace (raw Gemini output → Judge branch → reasoning) for anything touching detection logic, not just a verdict count.
- **All client deliverables follow the same pattern:** a `.md` written first, converted to `.docx` via `pandoc <file>.md -o <file>.docx --standalone`, plus a short plain-text cover message (not converted) ready to paste into Upwork/chat.
- **Never send an unverified build to the client.** Test it yourself (or have whoever built it test it) first.
- **Gemini API costs/quota are real constraints.** The free tier caps at 20 requests/day project-wide — this has caused real incidents (see the key-mixup bug above). Always confirm which key (and which tier) is actually in play before doing heavy live-API testing.
- **`.env` is gitignored and never travels with git clone/pull.** Anyone building on a new machine needs their own local `.env` created manually — this exact gap caused the key-mixup bug.
- Client is highly technical, detail-oriented, and explicitly value honesty over a polished-looking number — corrections to earlier claims have been well received when delivered plainly with evidence, not softened.
