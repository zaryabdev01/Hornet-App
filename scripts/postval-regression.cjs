// Post-validation Item 1 regression harness — repeated live sampling across the full set the
// client named: the two new false negatives, the confirmed-ROUGE Asian-hornet cases, the
// confirmed European-hornet cases, plus wasp / distant / scoliid / V. mandarinia as
// must-not-regress groups.
//
// Runs the exact production prompt + schema + Judge. Per-run decision trace captured.
// ROUGE-adjacent groups sampled deeply; periphery sampled lightly (Photo 1 lesson: never
// one sample on a ROUGE-adjacent case).
//
// Usage: node scripts/postval-regression.cjs <label> [--quick]
//   <label>  : output filename, e.g. "baseline", "after-v1", "after-v2"
//   --quick  : halve every sample count (smoke pass)
//
// Output: test_images_5/regression/<label>.json and .md

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
const LABEL = process.argv[2];
const QUICK = process.argv.includes('--quick');
// --only=<comma-separated substrings>, matched against "group|file" — lets a targeted follow-up
// re-run just the entries under investigation instead of the full manifest.
const ONLY_ARG = process.argv.find(a => a.startsWith('--only='));
const ONLY = ONLY_ARG ? ONLY_ARG.slice('--only='.length).split(',').map(s => s.trim()).filter(Boolean) : null;
if (!LABEL) { console.error('Usage: node scripts/postval-regression.cjs <label> [--quick] [--only=substr1,substr2]'); process.exit(1); }
if (!API_KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1); }

const OUT_DIR = path.join(__dirname, '..', 'test_images_5', 'regression');
fs.mkdirSync(OUT_DIR, { recursive: true });
const DELAY_MS = 1400;
const ANTI_CRABRO_TYPES = new Set(['abdomen_jaune_dominant', 'rayures_jaune_noir_vif', 'abdomen_segmente_jaune_noir_alterne', 'thorax_roux', 'tete_rousse_orangee']);

// group: A new false negatives | B confirmed ROUGE | C confirmed European hornet
//        D wasp/Polistes | E other non-regress | F V. mandarinia (known residual)
const MANIFEST = [
  { group: 'A', dir: 'test_images_5', file: 'Case1_AsianHornet_FalseNegative_crabro_flying.jpeg', acceptable: ['ROUGE', 'ORANGE_INSUFFISANCE'], goal: 'ROUGE', samples: 8 },
  { group: 'A', dir: 'test_images_5', file: 'Case2_AsianHornet_FalseNegative_crabro_predation.jpeg', acceptable: ['ROUGE'], goal: 'ROUGE', samples: 8 },
  { group: 'A', dir: 'test_images_5', file: 'Case4_AsianHornet_FalseNegative_crabro_jar.jpeg', acceptable: ['ROUGE', 'ORANGE_INSUFFISANCE'], goal: 'ROUGE', samples: 8 },
  { group: 'B', dir: 'test_images_2', file: 'ref_image_09.jpg', acceptable: ['ROUGE'], goal: 'ROUGE', samples: 8 },
  { group: 'B', dir: 'test_images', file: 'ref_image_04.jpg', acceptable: ['ROUGE'], goal: 'ROUGE', samples: 6 },
  { group: 'B', dir: 'test_images', file: 'ref_image_08.jpg', acceptable: ['ROUGE'], goal: 'ROUGE', samples: 6 },
  { group: 'B', dir: 'test_images', file: 'ref_image_09.jpg', acceptable: ['ROUGE'], goal: 'ROUGE', samples: 6 },
  { group: 'C', dir: 'test_images_2', file: 'ref_image_01.jpg', acceptable: ['ORANGE_PROBABLE_NON_CIBLE'], goal: 'ORANGE_PROBABLE_NON_CIBLE', samples: 6 },
  { group: 'C', dir: 'test_images_2', file: 'ref_image_02.jpg', acceptable: ['ORANGE_PROBABLE_NON_CIBLE'], goal: 'ORANGE_PROBABLE_NON_CIBLE', samples: 6 },
  { group: 'C', dir: 'test_images_2', file: 'ref_image_06.jpg', acceptable: ['ORANGE_PROBABLE_NON_CIBLE'], goal: 'ORANGE_PROBABLE_NON_CIBLE', samples: 6 },
  { group: 'C', dir: 'test_images_2', file: 'ref_image_07.jpg', acceptable: ['ORANGE_PROBABLE_NON_CIBLE'], goal: 'ORANGE_PROBABLE_NON_CIBLE', samples: 6 },
  { group: 'C', dir: 'test_images_3', file: 'Photo_02_European_Hornet_Under_Glass_Run_A.jpeg', acceptable: ['ORANGE_PROBABLE_NON_CIBLE'], goal: 'ORANGE_PROBABLE_NON_CIBLE', samples: 6 },
  { group: 'C', dir: 'test_images_3', file: 'Photo_03_European_Hornet_Under_Glass_Run_B.jpeg', acceptable: ['ORANGE_PROBABLE_NON_CIBLE'], goal: 'ORANGE_PROBABLE_NON_CIBLE', samples: 6 },
  { group: 'D', dir: 'test_images_2', file: 'ref_image_03.jpg', acceptable: ['ORANGE_PROBABLE_NON_CIBLE', 'ORANGE_PLAFOND'], goal: 'ORANGE_PROBABLE_NON_CIBLE', samples: 3 },
  { group: 'D', dir: 'test_images_2', file: 'ref_image_04.jpg', acceptable: ['ORANGE_PROBABLE_NON_CIBLE'], goal: 'ORANGE_PROBABLE_NON_CIBLE', samples: 3 },
  { group: 'D', dir: 'test_images_2', file: 'ref_image_05.jpg', acceptable: ['ORANGE_PROBABLE_NON_CIBLE'], goal: 'ORANGE_PROBABLE_NON_CIBLE', samples: 3 },
  { group: 'D', dir: 'test_images_2', file: 'ref_image_10.jpg', acceptable: ['ORANGE_PROBABLE_NON_CIBLE'], goal: 'ORANGE_PROBABLE_NON_CIBLE', samples: 3 },
  { group: 'D', dir: 'test_images_3', file: 'Photo_04_Clear_Wasp_Non_Target.jpeg', acceptable: ['ORANGE_PROBABLE_NON_CIBLE'], goal: 'ORANGE_PROBABLE_NON_CIBLE', samples: 3 },
  { group: 'E', dir: 'test_images_3', file: 'Photo_01_Confirmed_Asian_Hornets_Distant.jpeg', acceptable: ['ORANGE_INSUFFISANCE'], goal: 'ORANGE_INSUFFISANCE', samples: 4 },
  { group: 'E', dir: 'test_images_3', file: 'Photo_05_Scoliid_Hairy_Body.jpeg', acceptable: ['VERT'], goal: 'VERT', samples: 3 },
  { group: 'E', dir: 'test_images_3', file: 'Photo_06_Scoliid_On_Flower.jpeg', acceptable: ['VERT'], goal: 'VERT', samples: 3 },
  { group: 'E', dir: 'test_images_5', file: 'Case3_DistantStructure_correct_green_wants_guided_retake.jpeg', acceptable: ['VERT'], goal: 'VERT', samples: 3 },
  { group: 'E', dir: 'test_images_2', file: 'ref_image_08.jpg', acceptable: ['ORANGE_PLAFOND'], goal: 'ORANGE_PLAFOND', samples: 3 },
  { group: 'F', dir: 'test_images_4', file: 'WhatsApp Image 2026-08-24 at 7.41.58 PM.jpeg', acceptable: ['ORANGE_PROBABLE_NON_CIBLE', 'ORANGE_INSUFFISANCE'], goal: 'not-ROUGE (known residual)', samples: 3 },
  { group: 'F', dir: 'test_images_4', file: 'WhatsApp Image 2026-08-24 at 7.41.59 PM.jpeg', acceptable: ['ORANGE_PROBABLE_NON_CIBLE', 'ORANGE_INSUFFISANCE'], goal: 'not-ROUGE (known residual)', samples: 3 },
  { group: 'F', dir: 'test_images_4', file: 'WhatsApp Image 2026-08-24 at 7.41.59 PM (1).jpeg', acceptable: ['ORANGE_PROBABLE_NON_CIBLE', 'ORANGE_INSUFFISANCE'], goal: 'not-ROUGE (known residual)', samples: 3 },
  { group: 'F', dir: 'test_images_4', file: 'WhatsApp Image 2026-08-24 at 7.41.59 PM (2).jpeg', acceptable: ['ORANGE_PROBABLE_NON_CIBLE', 'ORANGE_INSUFFISANCE'], goal: 'not-ROUGE (known residual)', samples: 3 },

  // group G — Nordine's post-validation-v2 non-target regression cases (raw photos, 2026-09-04).
  { group: 'G', dir: 'test_images_7', file: 'C7_1_Polistes_on_open_comb_nest_FALSE_ROUGE.png', acceptable: ['ORANGE_PROBABLE_NON_CIBLE', 'ORANGE_INSUFFISANCE'], goal: 'not-ROUGE (Polistes on open comb nest)', samples: 8 },
  { group: 'G', dir: 'test_images_7', file: 'C7_2_banded_wasp_on_bark.png', acceptable: ['ORANGE_PROBABLE_NON_CIBLE'], goal: 'ORANGE_PROBABLE_NON_CIBLE', samples: 6 },
  { group: 'G', dir: 'test_images_7', file: 'C7_3_banded_wasp_on_thistle.png', acceptable: ['ORANGE_PROBABLE_NON_CIBLE'], goal: 'ORANGE_PROBABLE_NON_CIBLE', samples: 6 },
  { group: 'G', dir: 'test_images_7', file: 'C7_4_volucella_hoverfly_on_mint.png', acceptable: ['VERT', 'ORANGE_PROBABLE_NON_CIBLE'], goal: 'not a retake', samples: 6 },
  { group: 'G', dir: 'test_images_7', file: 'C7_5_volucella_hoverfly_white_flower.png', acceptable: ['VERT', 'ORANGE_PROBABLE_NON_CIBLE'], goal: 'not a retake', samples: 6 },
  { group: 'G', dir: 'test_images_7', file: 'C7_6_volucella_hoverfly_white_flower2.png', acceptable: ['VERT', 'ORANGE_PROBABLE_NON_CIBLE'], goal: 'not a retake', samples: 6 },
  { group: 'G', dir: 'test_images_7', file: 'C7_7_european_hornet_dead_on_side.png', acceptable: ['ORANGE_PROBABLE_NON_CIBLE'], goal: 'ORANGE_PROBABLE_NON_CIBLE', samples: 6 },
  { group: 'G', dir: 'test_images_7', file: 'C7_8_polistes_on_white_flowers.jpeg', acceptable: ['ORANGE_PROBABLE_NON_CIBLE'], goal: 'ORANGE_PROBABLE_NON_CIBLE', samples: 4 },
  { group: 'G', dir: 'test_images_7', file: 'C7_9_distant_insect_on_branch_GROUNDTRUTH_TBD.jpeg', acceptable: ['ORANGE_INSUFFISANCE', 'ORANGE_PROBABLE_NON_CIBLE', 'ROUGE'], goal: 'fail-safe (ground truth TBD)', samples: 4 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callGemini(base64Image, attempt = 0, mimeType = 'image/jpeg') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: VISION_SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: VISION_USER_PROMPT }, { inline_data: { mime_type: mimeType, data: base64Image } }] }],
        generationConfig: { temperature: 0, response_mime_type: 'application/json' },
      }),
    });
  } catch (e) {
    if (attempt < 4) { await sleep((2 ** attempt) * 1000 + Math.random() * 500); return callGemini(base64Image, attempt + 1); }
    throw e;
  }
  if ((response.status === 429 || response.status === 503 || response.status === 500) && attempt < 6) {
    const wait = (2 ** attempt) * 1000 + Math.random() * 800;
    process.stdout.write(`(${response.status} retry) `);
    await sleep(wait);
    return callGemini(base64Image, attempt + 1, mimeType);
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text().catch(() => '')).slice(0, 160)}`);
  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('empty response');
  return rawText;
}

const tagList = (obs) => (obs.incompatibilites_cible || []).map((i) => (typeof i === 'string' ? i : i.type));

async function main() {
  const report = { label: LABEL, model: GEMINI_MODEL, generated: new Date().toISOString(), quick: QUICK, entries: [] };
  const manifest = ONLY
    ? MANIFEST.filter(m => ONLY.some(s => `${m.group}|${m.file}`.includes(s)))
    : MANIFEST;
  if (ONLY) console.log(`--only filter matched ${manifest.length}/${MANIFEST.length} manifest entries.`);
  for (const m of manifest) {
    const n = QUICK ? Math.max(2, Math.ceil(m.samples / 2)) : m.samples;
    const imgPath = path.join(__dirname, '..', m.dir, m.file);
    process.stdout.write(`\n[${m.group}] ${m.dir}/${m.file} (${n}x) `);
    const b64 = fs.readFileSync(imgPath).toString('base64');
    const mimeType = /\.png$/i.test(m.file) ? 'image/png' : 'image/jpeg';
    const runs = [];
    for (let i = 0; i < n; i++) {
      try {
        const raw = await callGemini(b64, 0, mimeType);
        let obs; try { obs = JSON.parse(raw); } catch { obs = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]); }
        validateObservation(obs);
        const v = juger(obs);
        const insect = obs.etape_1_declencheur.insecte_exploitable === true;
        const tags = tagList(obs);
        runs.push({
          verdict: v.verdict_code, reason: v.reason_code,
          Q1: insect ? `${obs.Q1_thorax.reponse}/${obs.Q1_thorax.confidence}` : null,
          Q2: insect ? `${obs.Q2_abdomen.reponse}/${obs.Q2_abdomen.confidence}` : null,
          Q3: insect ? `${obs.Q3_morphologie.reponse}/${obs.Q3_morphologie.confidence}` : null,
          fond: insect ? obs.Q2_abdomen.fond_dominant : null,
          zoneOr: insect ? obs.Q2_abdomen.zone_terminale_orangee : null,
          tags, antiCrabro: tags.filter((t) => ANTI_CRABRO_TYPES.has(t)).length,
        });
        process.stdout.write(v.verdict_code === m.goal || (m.acceptable || []).includes(v.verdict_code) ? '.' : 'X');
      } catch (e) { runs.push({ error: e.message }); process.stdout.write('!'); }
      await sleep(DELAY_MS);
    }
    const ok = runs.filter((r) => !r.error);
    const dist = {};
    ok.forEach((r) => { dist[r.verdict] = (dist[r.verdict] || 0) + 1; });
    const pass = ok.length > 0 && ok.every((r) => (m.acceptable || []).includes(r.verdict));
    const majority = Object.entries(dist).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    report.entries.push({ ...m, samples_run: n, distribution: dist, majority, pass, runs });
  }

  fs.writeFileSync(path.join(OUT_DIR, `${LABEL}.json`), JSON.stringify(report, null, 2));

  const md = [`# Post-validation Item 1 regression — \`${LABEL}\``, '',
    `Model \`${GEMINI_MODEL}\` · ${report.generated}${QUICK ? ' · QUICK' : ''}`, '',
    '| Grp | Image | Goal | Distribution | Majority | All-acceptable |',
    '|---|---|---|---|---|---|'];
  for (const e of report.entries) {
    md.push(`| ${e.group} | ${e.dir}/${e.file} | ${e.goal} | ${JSON.stringify(e.distribution)} | ${e.majority} | ${e.pass ? 'yes' : 'NO'} |`);
  }
  md.push('', '## Per-run traces', '');
  for (const e of report.entries) {
    md.push(`### [${e.group}] ${e.dir}/${e.file}`, '',
      '| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |',
      '|---|---|---|---|---|---|---|---|---|');
    e.runs.forEach((r, i) => {
      if (r.error) { md.push(`| ${i + 1} | ERROR ${r.error} | | | | | | | |`); return; }
      md.push(`| ${i + 1} | ${r.verdict} / ${r.reason} | ${r.Q1 || '-'} | ${r.Q2 || '-'} | ${r.Q3 || '-'} | ${r.fond || '-'} | ${r.zoneOr} | ${r.antiCrabro ?? '-'} | ${(r.tags || []).join(', ')} |`);
    });
    md.push('');
  }
  fs.writeFileSync(path.join(OUT_DIR, `${LABEL}.md`), md.join('\n'));

  const fails = report.entries.filter((e) => !e.pass);
  console.log(`\n\n=== ${LABEL} ===`);
  console.log(`${report.entries.length - fails.length}/${report.entries.length} entries all-acceptable.`);
  if (fails.length) fails.forEach((f) => console.log(`  NOT-ACCEPTABLE  [${f.group}] ${f.file}  ${JSON.stringify(f.distribution)}`));
  console.log(`Written: test_images_5/regression/${LABEL}.{json,md}`);
}

main();
