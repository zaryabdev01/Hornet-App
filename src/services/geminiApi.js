// Service d'appel à l'API Google Gemini Vision
// Migration OpenAI GPT-4o → Gemini 2.0 Flash
// V2.1 : compatible BEEALERT CORE V13.5+ MES-1 / prompt V2.1
// V2.2 (M1) : modèle cible aligné sur les tests de référence — gemini-3.6-flash (GA, stable,
//             non "-latest") — confirmé via la documentation officielle Google AI le 2026-08.
// V2.3 (M3, Phase 1) : appel direct à Gemini remplacé par le proxy serveur (cf. proxy/) —
//             la clé Gemini reelle ne quitte plus jamais le serveur. Meme convention
//             PROXY_URL/PROXY_SECRET/X-App-Secret que l'ancien proxy OpenAI (visionApi.js).
// V2.4 (M3, Phase 3) : envoie desormais ENGINE.protocole en tant qu'en-tete X-Protocol-Bundle
//             sur chaque requete. Le proxy rejette (409) toute requete dont le bundle ne
//             correspond pas exactement a son propre ACTIVE_BUNDLE.
// V2.6 (post-M2, Item 2 — 503 handling + latency, client observation 2026-09-02 ;
//             fusionné avec la version proxy V2.4) :
//   - Politique de retry unifiée : 429 + 500/502/503/504 + erreurs réseau sont désormais
//     toutes retentées, avec backoff exponentiel + jitter complet et respect de l'en-tête
//     Retry-After (auparavant : 503 non retenté du tout ; 429 et réseau en backoff linéaire
//     sans jitter). Budget de retry plafonné (RETRY_BUDGET_MS). Le 409 (bundle obsolète) et
//     le 401/403 (accès) ne sont JAMAIS retentés.
//   - Instrumentation par étape : chaque appel logge un récapitulatif [ApiSave][timing]
//     (fetch par tentative, attente de backoff, parsing, validation, taille de requête) et
//     l'expose via getLastAnalysisTimings() — la mesure par étape demandée par le client.
//   - Le downscaling de l'image se fait en amont (HomeScreen / useOfflineSync) via imagePrep.js.

import { PROXY_URL, PROXY_SECRET } from '../config/env';
import { VISION_SYSTEM_PROMPT, VISION_USER_PROMPT } from '../core/prompts';
import { validateObservation } from '../core/schema';
import { extractAndParseJSON } from '../utils/jsonParser';
import { ENGINE } from '../constants/branding';

// Identifiant stable GA (pas d'alias "-latest") — cf. docs Gemini API, section "Versions".
// Etiquette de reference uniquement ; la valeur qui compte reellement est ENGINE.protocole
// (src/constants/branding.js), verifiee par le proxy a chaque requete.
export const GEMINI_MODEL = 'gemini-3.6-flash';
const TIMEOUT_MS = 35000;
const MAX_RETRIES = 3;               // tentatives supplémentaires après le 1er essai
const RETRY_BASE_MS = 800;           // base du backoff exponentiel
const RETRY_MAX_DELAY_MS = 8000;     // plafond d'un délai de retry individuel
const RETRY_BUDGET_MS = 30000;       // temps total maximal passé à attendre entre tentatives
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

let lastTimings = null;
// Récapitulatif de timing du dernier appel getVisionObservation() — utile pour un panneau
// debug ou un log terminal. Non destiné à l'UI finale.
export function getLastAnalysisTimings() {
  return lastTimings;
}

const now = () =>
  (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

// Full jitter : délai aléatoire dans [0, min(cap, base * 2^attempt)], borné par Retry-After.
function backoffDelay(attempt, retryAfterMs) {
  const exp = Math.min(RETRY_MAX_DELAY_MS, RETRY_BASE_MS * 2 ** attempt);
  const jittered = Math.random() * exp;
  if (retryAfterMs && retryAfterMs > 0) {
    return Math.min(Math.max(jittered, retryAfterMs), RETRY_MAX_DELAY_MS * 2);
  }
  return jittered;
}

function parseRetryAfter(header) {
  if (!header) return 0;
  const secs = Number(header);
  if (Number.isFinite(secs)) return secs * 1000;
  const dateMs = Date.parse(header);
  return Number.isFinite(dateMs) ? Math.max(0, dateMs - Date.now()) : 0;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Renvoie { rawText, timing }. timing = { attempts: [{n, ms, status|error}], waitMs, bytesSent }.
async function callGeminiVisionAPI(base64Image) {
  if (!PROXY_URL) {
    throw new Error('Proxy non configuré');
  }

  const url = `${PROXY_URL}/api/analyze`;
  const body = JSON.stringify({
    system_instruction: { parts: [{ text: VISION_SYSTEM_PROMPT }] },
    contents: [
      {
        role: 'user',
        parts: [
          { text: VISION_USER_PROMPT },
          { inline_data: { mime_type: 'image/jpeg', data: base64Image } },
        ],
      },
    ],
    generationConfig: { temperature: 0, response_mime_type: 'application/json' },
  });
  const headers = {
    'Content-Type': 'application/json',
    'X-App-Secret': PROXY_SECRET,
    'X-Protocol-Bundle': ENGINE.protocole,
  };

  const timing = { attempts: [], waitMs: 0, bytesSent: body.length };
  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const started = now();
    let response;
    try {
      response = await fetchWithTimeout(url, { method: 'POST', headers, body }, TIMEOUT_MS);
    } catch (e) {
      const ms = now() - started;
      const isAbort = e.name === 'AbortError';
      timing.attempts.push({ n: attempt + 1, ms, error: isAbort ? 'timeout' : (e.message || 'network') });
      lastError = isAbort
        ? new Error('Délai dépassé — vérifiez votre connexion réseau')
        : e;
      if (attempt < MAX_RETRIES && timing.waitMs < RETRY_BUDGET_MS) {
        const d = backoffDelay(attempt, 0);
        timing.waitMs += d;
        await new Promise((r) => setTimeout(r, d));
        continue;
      }
      throw lastError;
    }

    const ms = now() - started;
    timing.attempts.push({ n: attempt + 1, ms, status: response.status });

    // Jamais retentés — conditions permanentes.
    if (response.status === 401) {
      throw new Error('Accès proxy refusé');
    }
    if (response.status === 409) {
      throw new Error('Application obsolète — une mise à jour est requise pour continuer');
    }
    if (response.status === 403) {
      throw new Error('Accès Gemini refusé (clé invalide côté serveur)');
    }

    if (RETRYABLE_STATUS.has(response.status)) {
      lastError = new Error(
        response.status === 429
          ? 'Trop de requêtes Gemini — réessayez dans quelques secondes'
          : 'Service momentanément indisponible — réessayez dans quelques instants',
      );
      if (attempt < MAX_RETRIES && timing.waitMs < RETRY_BUDGET_MS) {
        const d = backoffDelay(attempt, parseRetryAfter(response.headers?.get?.('retry-after')));
        timing.waitMs += d;
        await new Promise((r) => setTimeout(r, d));
        continue;
      }
      throw lastError;
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData?.error?.message || `Erreur serveur ${response.status}`;
      throw new Error(`Gemini: ${errMsg}`);
    }

    const data = await response.json();

    const finishReason = data?.candidates?.[0]?.finishReason;
    if (finishReason === 'SAFETY') {
      throw new Error('Image refusée par le filtre de sécurité Gemini');
    }
    if (finishReason === 'RECITATION') {
      throw new Error('Réponse bloquée par Gemini (filtre récitation)');
    }
    if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
      throw new Error(`Gemini: fin inattendue (${finishReason})`);
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Réponse Gemini vide — aucun contenu reçu');
    }

    return { rawText, timing };
  }

  throw lastError || new Error('Échec de l\'appel Gemini');
}

function parseObservationResponse(rawText) {
  try {
    return JSON.parse(rawText);
  } catch {
    if (__DEV__) {
      console.warn('[GeminiAPI] JSON.parse direct échoué, fallback extractAndParseJSON');
    }
    return extractAndParseJSON(rawText);
  }
}

// Point d'entrée principal — remplace getVisionObservation de visionApi.js
// Retourne l'observation validée prête pour le juge.
export async function getVisionObservation(base64Image) {
  const tStart = now();

  const { rawText, timing } = await callGeminiVisionAPI(base64Image);

  const tAfterApi = now();
  const observation = parseObservationResponse(rawText);
  const tAfterParse = now();
  validateObservation(observation);
  const tEnd = now();

  const apiMs = timing.attempts.reduce((s, a) => s + a.ms, 0);
  lastTimings = {
    total_ms: Math.round(tEnd - tStart),
    api_ms: Math.round(apiMs + timing.waitMs),          // fetch(s) + attente de backoff
    api_fetch_ms: Math.round(apiMs),                    // upload + inférence + download cumulés
    retry_wait_ms: Math.round(timing.waitMs),
    parse_ms: Math.round(tAfterParse - tAfterApi),
    validate_ms: Math.round(tEnd - tAfterParse),
    attempts: timing.attempts,
    request_kb: Math.round(timing.bytesSent / 1024),
  };
  // Toujours logué (pas seulement en __DEV__) : c'est la mesure par étape demandée, elle
  // doit être lisible sur un build release via adb logcat / la console Xcode.
  console.log('[ApiSave][timing]', JSON.stringify(lastTimings));

  if (__DEV__) {
    const q1 = observation.Q1_thorax, q2 = observation.Q2_abdomen, q3 = observation.Q3_morphologie;
    console.log(`[GeminiAPI] Q1=${q1?.reponse}(${q1?.confidence}) Q2=${q2?.reponse}(${q2?.confidence}) Q3=${q3?.reponse}(${q3?.confidence})`);
  }

  return observation;
}
