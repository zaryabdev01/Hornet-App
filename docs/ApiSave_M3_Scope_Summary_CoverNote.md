Hi Nordine,

Here's exactly what M3 covers, so it's clear before you accept the milestone. Full
breakdown attached; the short version:

M3 is "Gemini API Hardening & Key Security." It has four parts:

1. **Server-side proxy.** The Gemini key is currently compiled into the app — anyone who
   downloads it can pull the key out. M3 puts a small server in front of Gemini that holds
   the real key, and removes the key from the app bundle entirely. The app talks to the
   proxy with a shared secret, reusing the PROXY_URL/PROXY_SECRET setup already in the
   codebase from the old OpenAI integration.

2. **Native schema enforcement.** Gemini's own responseSchema is used to force the model's
   JSON output into the exact allowed values, with a safe fallback if a constrained
   response comes back malformed. The native-valid rate and the fallback rate are reported
   as two separate numbers, never merged into one.

3. **Server-configurable model.** The model identifier moves out of the app into proxy
   config, behind an allowlist of approved model strings. The proxy refuses to start on an
   unlisted model. Swapping to an approved model becomes a proxy redeploy — no app rebuild.

4. **Atomic protocol bundle.** Model + prompt version + schema version are locked together
   as one unit. The app declares which bundle it was built against on every request, and
   the proxy rejects anything that doesn't match — so a model can never run against a
   prompt or schema it wasn't validated with.

**Deliverables:** updated geminiApi.js with schema enforcement and the pinned model, calls
routed through the proxy, key removed from the bundle, updated .env.example, and the
validation report with raw model outputs from the reference-image rerun.

**Acceptance:** key absent from the built bundle (checked directly on the artifact),
schema-conformant responses confirmed on live calls, and no change in verdict behaviour
end-to-end — the hardening is invisible to the detection logic.

**Not in M3:** the photo-#10 per-trait-field experiment, the M4 protocol, and Firebase
Remote Config (unnecessary at this scale).

**From your side:** just a hosting choice for the proxy (a small Node host — Render,
Railway, Fly.io or a VPS). The Gemini key doesn't change; it just moves into the proxy's
server config.

One process note for later: once the proxy is live, proxy and app releases have to go out
together — pushing a new model to the proxy before the matching app update reaches users
will make the proxy ask those users to update first. That's intentional (fail-closed), but
worth knowing before the first live model change.

Happy to walk through any of it.

Thanks,
Zaryab
