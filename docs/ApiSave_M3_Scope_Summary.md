---
title: "ApiSave — M3 Scope: Gemini API Hardening & Key Security"
subtitle: "Exactly what is included, what is excluded, and how it will be verified"
date: "2026-09-03"
---

# What M3 is for

Today the Gemini API key is compiled into the mobile application. Anyone who downloads
the app can extract it from the bundle and use it. M3 closes that exposure and hardens
the whole path between the app and Gemini so that the model can only ever run in a
combination that has been validated.

M3 is infrastructure and safety work. It does **not** change what the app decides or how
it reads a photo — that behaviour stays identical, and proving it stays identical is one
of the acceptance criteria.

---

# What M3 delivers

## 1. Server-side proxy — the key leaves the app

- A small server component holds the real Gemini key. The app sends the photo to the
  proxy; the proxy calls Gemini and returns the result.
- `GEMINI_API_KEY` is **removed from the app bundle entirely** — it no longer ships to any
  device.
- The app authenticates to the proxy with a shared app-secret (`X-App-Secret`), reusing
  the exact `PROXY_URL` / `PROXY_SECRET` convention already present in the codebase from
  the retired OpenAI integration, rather than inventing a new mechanism.
- `.env.example` is updated; the proxy is deployed to a small Node host.

## 2. Native structured-output enforcement

- Gemini's own `responseSchema` is used to constrain the model's JSON output to the exact
  allowed field values, built directly from `src/core/schema.js`.
- A safe fallback path: if a schema-constrained response comes back malformed, or the
  constrained call fails for any reason, the proxy falls back to an unconstrained call so
  the user still gets a usable verdict instead of an error.
- The **native-valid rate** and the **fallback-activation rate** are reported as two
  separate numbers, never blended into a single "success rate" — a fallback counts as a
  usable result but explicitly does not count as a native-valid model output.

## 3. Server-configurable model identifier

- The Gemini model string moves out of the app and into the proxy's configuration, gated
  by a hard-coded allowlist of approved exact model strings.
- The proxy refuses to start if it is configured with a model that is not on the
  allowlist — a misconfigured deployment fails loudly instead of silently running on an
  unvalidated model.
- Activating an approved replacement model becomes a proxy redeploy, with no new app build
  and no store resubmission.

## 4. Atomic protocol bundle

- The model identifier, the prompt version and the schema version are treated as **one
  unit** — a bundle that is versioned and activated together.
- The app declares the bundle it was built against on every request. The proxy rejects any
  request whose declared bundle does not exactly match the bundle it is currently serving
  (HTTP 409, "update required").
- This makes it structurally impossible for a model to run against a prompt or schema
  version it was never validated with — the risk that a server-configurable model would
  otherwise introduce.

---

# Deliverables

- `src/services/geminiApi.js` — native schema enforcement, the pinned model, and the call
  routed through the proxy.
- The proxy component, with its own `README` and `.env.example`.
- `GEMINI_API_KEY` removed from the client bundle.
- The M3 validation report (see acceptance criteria below), including the raw model outputs
  from the reference-image rerun.

---

# Acceptance criteria

1. The Gemini key is **not present in the built app bundle** — verified by inspecting the
   compiled artifact directly.
2. Schema-conformant responses confirmed on live test calls.
3. The 10 reference images are rerun through the proxy with raw model outputs included; the
   native-valid rate and the fallback-activation rate are reported **side by side**, never
   as one figure.
4. Photo #9 returns ROUGE; there are zero unjustified VERT verdicts.
5. Photos #1 and #10 are carried as permanent tracked regression cases into every future
   validation round.
6. **No change in observed verdict behaviour end-to-end**, measured against the current
   production baseline — the hardening is transparent to the detection logic.

---

# Explicitly not in M3

- The mandatory-per-trait-field experiment for the photo-#10 recall issue — a separate,
  approval-gated piece.
- The revised M4 stability-testing protocol.
- Firebase Remote Config — assessed as disproportionate to the app's current scale; the
  proxy's own environment configuration covers the same need with one less dependency.

---

# What is needed from you

- A hosting decision for the proxy: a small Node host (Render, Railway, Fly.io, or a
  plain VPS). Cost is minimal.
- Nothing new on the Gemini key — the existing key simply moves from the app into the
  proxy's server-side configuration.

---

# One operational note

Once the proxy is live, a proxy deployment and an app release must be sequenced together.
Rolling out a new model on the proxy before the matching app update has reached users will
cause the proxy to reject those older installs (with an "update required" message) until
they update. This is deliberate — fail-closed rather than silently run an untested pairing
— but it is a process change worth being aware of before the first live model change.
