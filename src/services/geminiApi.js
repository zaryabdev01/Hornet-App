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
//             correspond pas exactement a son propre ACTIVE_BUNDLE — l'app et le proxy ne
//             peuvent plus deriver silencieusement l'un de l'autre. GEMINI_MODEL reste exporte
//             comme etiquette de reference ; la selection reelle du modele se fait cote proxy,
//             derivee du bundle (cf. proxy/allowlist.js).

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
const MAX_RETRIES = 2;

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return response;
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') {
      throw new Error('Délai dépassé — vérifiez votre connexion réseau');
    }
    throw e;
  }
}

async function callGeminiVisionAPI(base64Image, retryCount = 0) {
  if (!PROXY_URL) {
    throw new Error('Proxy non configuré');
  }

  const url = `${PROXY_URL}/api/analyze`;

  let response;
  try {
    response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Secret': PROXY_SECRET,
        'X-Protocol-Bundle': ENGINE.protocole,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: VISION_SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: 'user',
            parts: [
              { text: VISION_USER_PROMPT },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          response_mime_type: 'application/json',
        },
      }),
    }, TIMEOUT_MS);
  } catch (e) {
    if (retryCount < MAX_RETRIES && !e.message.includes('Proxy non configuré')) {
      await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
      return callGeminiVisionAPI(base64Image, retryCount + 1);
    }
    throw e;
  }

  if (response.status === 429) {
    if (retryCount < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, 2000 * (retryCount + 1)));
      return callGeminiVisionAPI(base64Image, retryCount + 1);
    }
    throw new Error('Trop de requêtes Gemini — réessayez dans quelques secondes');
  }

  if (response.status === 401) {
    throw new Error('Accès proxy refusé');
  }

  if (response.status === 409) {
    throw new Error('Application obsolète — une mise à jour est requise pour continuer');
  }

  if (response.status === 403) {
    throw new Error('Accès Gemini refusé (clé invalide côté serveur)');
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

  return rawText;
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
// Retourne l'observation validée (JSON V1.7) prête pour le juge
export async function getVisionObservation(base64Image) {
  const rawText = await callGeminiVisionAPI(base64Image);

  if (__DEV__) {
    console.log('[GeminiAPI V2.1] Réponse brute:', rawText.slice(0, 200));
  }

  const observation = parseObservationResponse(rawText);
  validateObservation(observation);

  if (__DEV__) {
    const q1conf = observation.Q1_thorax?.confidence;
    const q2conf = observation.Q2_abdomen?.confidence;
    const q3conf = observation.Q3_morphologie?.confidence;
    console.log(`[GeminiAPI V2.1] Q1=${observation.Q1_thorax?.reponse}(${q1conf}) Q2=${observation.Q2_abdomen?.reponse}(${q2conf}) Q3=${observation.Q3_morphologie?.reponse}(${q3conf})`);
  }

  return observation;
}
