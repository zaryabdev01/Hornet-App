// M2 post-validation diagnostic — repeated live sampling for the client's 2026-09-02 observations.
//
// Unlike run-reference-set.cjs (1 call/image), this runs N samples per image and reports the
// per-sample decision trace: Gemini's Q1/Q2/Q3 + confidence + lisibilite, incompatibilites_cible
// tags, the anti-crabro hit count the Judge computes, the structure fields, and the final Judge
// verdict/reason. Built to answer "is Q2/Q3=NON stable or flickering, and which tags drive the
// CRABRO_LIKE_PROFILE route" — per the project rule: never trust a single sample (Photo 1 saga).
//
// Usage: node scripts/m2-postval-diagnostic.cjs [images_dirname] [samples]
//   e.g. node scripts/m2-postval-diagnostic.cjs test_images_5 8

global.__DEV__ = false;
require('dotenv').config();
require('./babel-esm-loader.cjs');

const fs = require('fs');
const path = require('path');
const { VISION_SYSTEM_PROMPT, VISION_USER_PROMPT } = require(path.join(__dirname, '..', 'src', 'core', 'prompts.js'));
const { validateObservation } = require(path.join(__dirname, '..', 'src', 'core', 'schema.js'));
const { juger } = require(path.join(__dirname, '..', 'src', 'engine', 'judge.js'));

const GEMINI_MODEL = 'gemini-3.6-flash';
const API_KEY = process.env.GEMINI_API_KEY;
const IMAGES_DIRNAME = process.argv[2] || 'test_images_5';
const SAMPLES = parseInt(process.argv[3] || '8', 10);
const IMAGES_DIR = path.join(__dirname, '..', IMAGES_DIRNAME);
const EXPECTED_PATH = path.join(IMAGES_DIR, 'expected_outcomes.json');
const OUT_JSON = path.join(IMAGES_DIR, 'postval-diagnostic.json');
const OUT_MD = path.join(IMAGES_DIR, 'postval-diagnostic.md');
const DELAY_MS = 1500;

// Mirrors src/engine/judge.js ANTI_CRABRO_TYPES — kept in sync manually (not exported).
const ANTI_CRABRO_TYPES = new Set([
  'abdomen_jaune_dominant', 'rayures_jaune_noir_vif', 'abdomen_segmente_jaune_noir_alterne',
  'thorax_roux', 'tete_rousse_orangee',
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callGemini(base64Image, attempt = 0) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: VISION_SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [
          { text: VISION_USER_PROMPT },
          { inline_data: { mime_type: 'image/jpeg', data: base64Image } },
        ] }],
        generationConfig: { temperature: 0, response_mime_type: 'application/json' },
      }),
    });
  } catch (e) {
    if (attempt < 4) { await sleep((2 ** attempt) * 1000 + Math.random() * 500); return callGemini(base64Image, attempt + 1); }
    throw e;
  }
  // Diagnostic-only backoff so a transient 429/503 during sampling doesn't abort the run.
  if ((response.status === 429 || response.status === 503 || response.status === 500) && attempt < 5) {
    const wait = (2 ** attempt) * 1000 + Math.random() * 700;
    process.stdout.write(`(${response.status}, retry in ${Math.round(wait)}ms) `);
    await sleep(wait);
    return callGemini(base64Image, attempt + 1);
  }
  if (!response.ok) {
    const t = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${t.slice(0, 200)}`);
  }
  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('empty response');
  return rawText;
}

function tagList(obs) {
  return (obs.incompatibilites_cible || []).map((i) => (typeof i === 'string' ? i : i.type));
}

async function main() {
  if (!API_KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1); }
  const expected = JSON.parse(fs.readFileSync(EXPECTED_PATH, 'utf8'));
  const report = { model: GEMINI_MODEL, generated: new Date().toISOString(), samples_per_image: SAMPLES, images: [] };

  for (const tc of expected.cases) {
    console.log(`\n=== ${tc.file} (${SAMPLES} samples) ===`);
    const base64Image = fs.readFileSync(path.join(IMAGES_DIR, tc.file)).toString('base64');
    const runs = [];
    for (let n = 0; n < SAMPLES; n++) {
      process.stdout.write(`  run ${n + 1}/${SAMPLES}... `);
      try {
        const raw = await callGemini(base64Image);
        let obs;
        try { obs = JSON.parse(raw); } catch { obs = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]); }
        validateObservation(obs);
        const v = juger(obs);
        const tags = tagList(obs);
        const antiCrabroHit = tags.filter((t) => ANTI_CRABRO_TYPES.has(t)).length;
        const insect = obs.etape_1_declencheur.insecte_exploitable === true;
        runs.push({
          verdict: v.verdict_code, reason: v.reason_code, motif: v.motif_principal, confiance: v.confiance,
          path: insect ? 'INSECT' : 'STRUCTURE',
          Q1: insect ? `${obs.Q1_thorax.reponse}/${obs.Q1_thorax.confidence}/${obs.Q1_thorax.lisibilite}` : null,
          Q2: insect ? `${obs.Q2_abdomen.reponse}/${obs.Q2_abdomen.confidence}/${obs.Q2_abdomen.lisibilite}` : null,
          Q3: insect ? `${obs.Q3_morphologie.reponse}/${obs.Q3_morphologie.confidence}/${obs.Q3_morphologie.lisibilite}` : null,
          fond_dominant: insect ? obs.Q2_abdomen.fond_dominant : null,
          zone_terminale_orangee: insect ? obs.Q2_abdomen.zone_terminale_orangee : null,
          tags, antiCrabroHit,
          structure: !insect ? {
            evaluee: obs.structure.evaluee, strength: obs.structure.structure_strength,
            forme: obs.structure.forme_globale, texture: obs.structure.texture_papier_carton,
            strates: obs.structure.strates_repetitives, forts: obs.structure.marqueurs_forts,
            faibles: obs.structure.marqueurs_faibles,
          } : null,
          descriptions: insect ? {
            Q1: obs.Q1_thorax.description_visible, Q2: obs.Q2_abdomen.description_visible, Q3: obs.Q3_morphologie.description_visible,
          } : { structure: obs.structure && obs.etape_1_declencheur.justification },
          error: null,
        });
        console.log(`${v.verdict_code} / ${v.reason_code}  [antiCrabro=${antiCrabroHit}]`);
      } catch (e) {
        runs.push({ error: e.message });
        console.log(`ERROR ${e.message}`);
      }
      await sleep(DELAY_MS);
    }

    // Aggregate
    const ok = runs.filter((r) => !r.error);
    const dist = {};
    ok.forEach((r) => { dist[r.verdict] = (dist[r.verdict] || 0) + 1; });
    const tagFreq = {};
    ok.forEach((r) => (r.tags || []).forEach((t) => { tagFreq[t] = (tagFreq[t] || 0) + 1; }));
    report.images.push({
      file: tc.file, category: tc.category, ground_truth: tc.ground_truth,
      expected_verdict: tc.expected_verdict, prohibited_verdicts: tc.prohibited_verdicts,
      verdict_distribution: dist,
      prohibited_hits: ok.filter((r) => (tc.prohibited_verdicts || []).includes(r.verdict)).length,
      tag_frequency: tagFreq,
      runs,
    });
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));

  const md = [`# ${IMAGES_DIRNAME} — M2 post-validation diagnostic`, '',
    `Model \`${GEMINI_MODEL}\` · ${SAMPLES} samples/image · ${report.generated}`, ''];
  for (const img of report.images) {
    md.push(`## ${img.file}`, '', `- Ground truth: ${img.ground_truth}`,
      `- Expected: ${img.expected_verdict} · prohibited: ${(img.prohibited_verdicts || []).join(', ')}`,
      `- **Verdict distribution:** ${JSON.stringify(img.verdict_distribution)}`,
      `- **Prohibited-verdict hits: ${img.prohibited_hits}/${img.runs.filter((r) => !r.error).length}**`,
      `- Tag frequency: ${JSON.stringify(img.tag_frequency)}`, '',
      '| run | verdict / reason | Q1 (r/c/l) | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |',
      '|---|---|---|---|---|---|---|---|---|');
    img.runs.forEach((r, i) => {
      if (r.error) { md.push(`| ${i + 1} | ERROR ${r.error} | | | | | | | |`); return; }
      md.push(`| ${i + 1} | ${r.verdict} / ${r.reason} | ${r.Q1 || '-'} | ${r.Q2 || '-'} | ${r.Q3 || '-'} | ${r.fond_dominant || '-'} | ${r.zone_terminale_orangee} | ${r.antiCrabroHit ?? '-'} | ${(r.tags || []).join(', ')} |`);
    });
    md.push('');
  }
  fs.writeFileSync(OUT_MD, md.join('\n'));
  console.log(`\n\nWritten:\n  ${OUT_JSON}\n  ${OUT_MD}`);
}

main();
