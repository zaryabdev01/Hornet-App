// Verbatim reproduction of jugerStructure() exactly as it existed BEFORE the
// M1 fix (src/engine/judge.js, pre-2026-08-05). Kept ONLY so the M1 report can
// show real before/after behavior side by side. Not imported by the app, not
// used anywhere in src/. If src/engine/judge.js's structure logic changes
// again later (e.g. in M2), this file stays frozen as the M1 baseline.
function jugerStructurePreFix(s) {
  if (!s.evaluee) {
    return { verdict_code: 'VERT', reason_code: 'NONE' };
  }

  // This is the exact bug: fires on a single artificial cue, unconditionally,
  // before any nest evidence is even looked at.
  if (s.indices_artificiels.length >= 1) {
    return { verdict_code: 'VERT', reason_code: 'OBJECT_NON_BIOLOGICAL_STRUCTURE' };
  }

  const forts = s.marqueurs_forts.length;
  const faibles = Math.min(s.marqueurs_faibles.length, 2);
  const hasPiegeVeg = s.pieges_vegetaux_possibles.length >= 1;

  const texture = s.texture_papier_carton || 'NON_LISIBLE';
  const strates = s.strates_repetitives || 'NON_LISIBLE';
  const forme = s.forme_globale || 'non_lisible';
  const suspension = s.suspension_visible || 'NON_LISIBLE';
  const qualite = s.qualite_structure || 'MEDIUM';
  const strength = s.structure_strength || 'WEAK';

  if (hasPiegeVeg && forts === 0 && texture !== 'OUI' && strates !== 'OUI') {
    return { verdict_code: 'VERT', reason_code: 'NONE' };
  }

  let score = 0;
  score += forts * 2;
  score += faibles;
  if (texture === 'OUI' && strates === 'OUI') score += 7;
  else if (texture === 'OUI') score += 3;
  if (strates === 'OUI') score += 2;
  if (forme === 'ovoide' || forme === 'spherique') score += 1;
  if (suspension === 'OUI') score += 1;
  if (qualite === 'HIGH') score += 1;
  if (qualite === 'LOW') score -= 1;
  if (hasPiegeVeg) score -= 2;

  const hasPositiveSignal = forts >= 1 || texture === 'OUI' || strates === 'OUI';

  if (score >= 3 && hasPositiveSignal) {
    return { verdict_code: 'ORANGE_PLAFOND', reason_code: 'STRUCTURE_STRONG_GLOBAL' };
  }
  if (strength === 'STRONG') {
    return { verdict_code: 'ORANGE_PLAFOND', reason_code: 'STRUCTURE_STRONG_GLOBAL' };
  }
  if (strength === 'MEDIUM') {
    return { verdict_code: 'ORANGE_INSUFFISANCE', reason_code: 'STRUCTURE_MEDIUM_GLOBAL' };
  }
  return { verdict_code: 'VERT', reason_code: 'NONE' };
}

module.exports = { jugerStructurePreFix };
