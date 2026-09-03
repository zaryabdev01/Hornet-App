// ApiSave — M3 proxy
//
// Phase 1 (done): transparent forward-proxy holding GEMINI_API_KEY server-side, so it never
// ships in the mobile bundle. Mirrors the request/response shape already used by
// src/services/geminiApi.js and the X-App-Secret convention from the retired OpenAI proxy
// (src/services/visionApi.js).
//
// Phase 2 (this revision): native responseSchema enforcement with a safe fallback path.
// Acceptance criteria (per docs/ApiSave_M3_Preimplementation_Clarifications.md, confirmed):
//   - Exact enum values enforced through Gemini's native responseSchema.
//   - Every analysis produces a usable verdict, with a safe fallback if native validation fails.
//   - Native-valid rate and fallback-activation rate reported as two SEPARATE metrics, never
//     blended into one "success rate" — see GET /metrics.
//
// Phase 3 (this revision): model allowlist + atomic {model, prompt, schema} bundle versioning.
// ACTIVE_BUNDLE replaces the standalone GEMINI_MODEL env var as the single source of truth —
// the model is now parsed out of the bundle string, not configured independently, so the model
// can never be changed without also declaring which prompt/schema version it was validated
// against. See proxy/allowlist.js and src/constants/branding.js (ENGINE.protocole).

require('dotenv').config();
const express = require('express');
const { OBSERVATION_RESPONSE_SCHEMA, isWellFormedObservation } = require('./observationSchema');
const { APPROVED_BUNDLES, parseModelFromBundle } = require('./allowlist');

const PORT = process.env.PORT || 8787;
const APP_SECRET = process.env.APP_SECRET;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ACTIVE_BUNDLE = process.env.ACTIVE_BUNDLE;
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const UPSTREAM_TIMEOUT_MS = 30000;

if (!APP_SECRET) {
  console.error('FATAL: APP_SECRET is not set. Refusing to start — see proxy/.env.example.');
  process.exit(1);
}
if (!GEMINI_API_KEY) {
  console.error('FATAL: GEMINI_API_KEY is not set. Refusing to start — see proxy/.env.example.');
  process.exit(1);
}
if (!ACTIVE_BUNDLE) {
  console.error('FATAL: ACTIVE_BUNDLE is not set. Refusing to start — see proxy/.env.example.');
  process.exit(1);
}
if (!APPROVED_BUNDLES.includes(ACTIVE_BUNDLE)) {
  console.error(`FATAL: ACTIVE_BUNDLE "${ACTIVE_BUNDLE}" is not in the approved allowlist (proxy/allowlist.js).`);
  console.error(`Approved bundles: ${APPROVED_BUNDLES.join(', ')}`);
  console.error('A misconfigured deploy must fail visibly, not silently run on an unvalidated model/prompt/schema combination.');
  process.exit(1);
}

// Single source of truth for which model gets called — derived from the bundle, never
// configured independently, so the model can't drift out of sync with the prompt/schema
// version it was validated against.
const GEMINI_MODEL = parseModelFromBundle(ACTIVE_BUNDLE);

const app = express();
app.use(express.json({ limit: '15mb' })); // base64-encoded photos push well past the 100kb default

// In-memory counters. Deliberately simple for a lightweight single-instance service — see
// docs/ApiSave_M3_Preimplementation_Clarifications.md's reasoning against adding infrastructure
// (like Firebase Remote Config) disproportionate to ApiSave's current scale. If usage grows
// enough to need these to survive a restart or aggregate across instances, that's a real future
// need, not a guess to build ahead of time now.
const metrics = { nativeValidCount: 0, fallbackActivatedCount: 0, upstreamErrorCount: 0, bundleMismatchCount: 0 };

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', active_bundle: ACTIVE_BUNDLE, model: GEMINI_MODEL });
});

// Native-valid rate and fallback-activation rate as two SEPARATE numbers, per the confirmed
// M3 acceptance criteria — never blended into one "success rate".
app.get('/metrics', (_req, res) => {
  const total = metrics.nativeValidCount + metrics.fallbackActivatedCount;
  res.json({
    native_valid_count: metrics.nativeValidCount,
    fallback_activated_count: metrics.fallbackActivatedCount,
    upstream_error_count: metrics.upstreamErrorCount,
    native_valid_rate: total > 0 ? metrics.nativeValidCount / total : null,
    fallback_activation_rate: total > 0 ? metrics.fallbackActivatedCount / total : null,
    bundle_mismatch_count: metrics.bundleMismatchCount,
    active_bundle: ACTIVE_BUNDLE,
  });
});

async function callGemini({ system_instruction, contents, generationConfig }, timeoutMs) {
  const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system_instruction, contents, generationConfig }),
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

app.post('/api/analyze', async (req, res) => {
  const providedSecret = req.get('X-App-Secret');
  if (!providedSecret || providedSecret !== APP_SECRET) {
    return res.status(401).json({ error: { message: 'Accès proxy refusé' } });
  }

  // Atomic bundle enforcement: the app declares which {model, prompt, schema} combination it
  // was built against. A mismatch against this proxy's active bundle is rejected outright
  // (fail closed) rather than served — running an app's prompt/schema against a model it was
  // never validated with is exactly the silent-drift risk this mechanism exists to prevent.
  // Operational consequence, deliberately: rolling out a new model on the proxy before the
  // matching app update has reached users will reject those older clients until they update —
  // that's the intended trade-off (safety over silent compatibility), not an oversight.
  const clientBundle = req.get('X-Protocol-Bundle');
  if (clientBundle !== ACTIVE_BUNDLE) {
    metrics.bundleMismatchCount++;
    return res.status(409).json({
      error: {
        message: 'Bundle protocole incompatible avec ce proxy — mise à jour de l\'application requise',
        active_bundle: ACTIVE_BUNDLE,
        client_bundle: clientBundle || null,
      },
    });
  }

  const { system_instruction, contents, generationConfig } = req.body || {};
  if (!contents) {
    return res.status(400).json({ error: { message: 'Requête invalide — champ "contents" manquant' } });
  }

  // Primary attempt: native responseSchema enforcement — Gemini itself can only emit legal
  // enum values, eliminating the malformed-response class of failure at the source.
  //
  // "Native validation failed" covers BOTH a transport-level failure of this attempt (timeout,
  // connection error, non-2xx upstream status) AND a 200 response whose body isn't a
  // well-formed observation — either one falls through to the unconstrained fallback attempt
  // below. An earlier version of this handler only treated the second case as fallback-worthy
  // and returned a hard error on the first, which meant a single flaky network blip on the
  // native attempt produced a failed analysis instead of a fallback-served one — caught by the
  // Phase 2 regression run against test_images_2 (ref_image_07.jpg), not assumed correct on read.
  const schemaGenerationConfig = { ...generationConfig, response_schema: OBSERVATION_RESPONSE_SCHEMA };
  let nativeSucceeded = false;
  let upstreamBody;

  try {
    const upstreamResponse = await callGemini({ system_instruction, contents, generationConfig: schemaGenerationConfig }, UPSTREAM_TIMEOUT_MS);
    if (upstreamResponse.ok) {
      upstreamBody = await upstreamResponse.text();
      let rawText;
      try {
        rawText = JSON.parse(upstreamBody)?.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch {
        rawText = undefined;
      }
      nativeSucceeded = !!rawText && isWellFormedObservation(rawText);
      if (nativeSucceeded) {
        metrics.nativeValidCount++;
        res.status(upstreamResponse.status);
        res.set('Content-Type', 'application/json');
        return res.send(upstreamBody);
      }
    }
  } catch (e) {
    console.error('[proxy] native attempt failed at transport level:', e.name === 'AbortError' ? 'timeout' : e.message);
  }

  // Fallback: unconstrained call, same shape as the original pre-M3 request. The mobile app's
  // own parseObservationResponse()/extractAndParseJSON already handles this response shape —
  // no change needed on the app side for this path.
  console.warn('[proxy] native schema attempt did not yield a well-formed observation — falling back to unconstrained call');
  let fallbackResponse;
  try {
    fallbackResponse = await callGemini({ system_instruction, contents, generationConfig }, UPSTREAM_TIMEOUT_MS);
  } catch (e) {
    metrics.upstreamErrorCount++;
    if (e.name === 'AbortError') {
      return res.status(504).json({ error: { message: 'Délai dépassé côté proxy (Gemini, fallback)' } });
    }
    console.error('[proxy] upstream fetch failed (fallback attempt):', e.message);
    return res.status(502).json({ error: { message: 'Échec de connexion au service Gemini' } });
  }

  metrics.fallbackActivatedCount++;
  const fallbackBody = await fallbackResponse.text();
  res.status(fallbackResponse.status);
  res.set('Content-Type', 'application/json');
  res.send(fallbackBody);
});

app.listen(PORT, () => {
  console.log(`ApiSave proxy listening on port ${PORT} (model: ${GEMINI_MODEL})`);
});
