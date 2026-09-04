export const BRAND = {
  name: 'API SAVE',
  tagline: 'Repérez · Signalez · Protégez',
  version: '1.0',
};

export const ENGINE = {
  name: 'BEEALERT CORE V13.5+ MES-1',
  moteur: '1.16',
  promptVersion: 'V2.8',
  schema: 'V1.13',
  // Identifiant de protocole {modèle + version prompt + version schéma}, activés ensemble.
  // Affiché dans chaque verdict (protocole_version) et envoyé en en-tête X-Protocol-Bundle
  // quand l'app tourne en mode proxy (PROXY_URL défini). À mettre à jour avec moteur /
  // promptVersion / schema ci-dessus — jamais indépendamment.
  protocole: 'gemini-3.6-flash+prompt-V2.8+schema-V1.13',
};

export const TABS = [
  { key: 'HOME',    label: 'Accueil',      featherIcon: 'camera' },
  { key: 'MAP',     label: 'Carte',        featherIcon: 'map' },
  { key: 'HISTORY', label: 'Historique',   featherIcon: 'clock' },
  { key: 'INFO',    label: 'Informations', featherIcon: 'book-open' },
];
