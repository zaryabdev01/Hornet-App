export const BRAND = {
  name: 'API SAVE',
  tagline: 'Repérez · Signalez · Protégez',
  version: '1.0',
};

export const ENGINE = {
  name: 'BEEALERT CORE V13.5+ MES-1',
  moteur: '1.14',
  promptVersion: 'V2.6',
  schema: 'V1.11',
  // M3 Phase 3 — atomic protocol bundle: {model, prompt version, schema version} versioned and
  // activated together, per docs/ApiSave_M3_Preimplementation_Clarifications.md section 4.5.
  // Sent to the proxy as X-Protocol-Bundle on every analysis request; the proxy rejects the
  // request if this doesn't match its own currently-active, allowlisted bundle (proxy/allowlist.js)
  // — the mechanism that makes "model paired with an untested prompt/schema combo" structurally
  // impossible rather than just discouraged. Update this string, and the proxy's allowlist entry,
  // together whenever the model, prompt, or schema version changes — never independently.
  protocole: 'gemini-3.6-flash+prompt-V2.6+schema-V1.11',
};

export const TABS = [
  { key: 'HOME',    label: 'Accueil',      featherIcon: 'camera' },
  { key: 'MAP',     label: 'Carte',        featherIcon: 'map' },
  { key: 'HISTORY', label: 'Historique',   featherIcon: 'clock' },
  { key: 'INFO',    label: 'Informations', featherIcon: 'book-open' },
];
