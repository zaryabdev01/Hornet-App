// M1 — real reference-set run: image -> live Gemini API -> schema validation
// -> Judge (before-fix replica + after-fix real code) -> compare to the
// client's expected verdicts.
//
// Requires GEMINI_API_KEY in a local .env file (not committed — see .env.example).
// Run: node scripts/m1-run-reference-set.cjs

global.__DEV__ = false;
require('dotenv').config();
require('./babel-esm-loader.cjs');

const fs = require('fs');
const path = require('path');
const { VISION_SYSTEM_PROMPT, VISION_USER_PROMPT } = require(path.join(__dirname, '..', 'src', 'core', 'prompts.js'));
const { validateObservation } = require(path.join(__dirname, '..', 'src', 'core', 'schema.js'));
const { juger } = require(path.join(__dirname, '..', 'src', 'engine', 'judge.js'));
const { jugerStructurePreFix } = require('./legacy-prefix-structure-judge.cjs');

// Not imported from src/services/geminiApi.js — that file pulls in expo-constants
// (native-only, can't resolve under plain Node). Kept as a literal here instead;
// must match GEMINI_MODEL in src/services/geminiApi.js (verified equal below).
const GEMINI_MODEL = 'gemini-3.6-flash';
const geminiApiSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'services', 'geminiApi.js'), 'utf8');
if (!geminiApiSource.includes(`GEMINI_MODEL = '${GEMINI_MODEL}'`)) {
  console.error(`ERROR: harness's GEMINI_MODEL ('${GEMINI_MODEL}') no longer matches src/services/geminiApi.js — update this script.`);
  process.exit(1);
}

const API_KEY = process.env.GEMINI_API_KEY;
const IMAGES_DIR = path.join(__dirname, '..', 'test_images');
const EXPECTED_PATH = path.join(IMAGES_DIR, 'expected_outcomes.json');
const REPORT_JSON_PATH = path.join(IMAGES_DIR, 'm1_report.json');
const REPORT_MD_PATH = path.join(IMAGES_DIR, 'm1_report.md');
const DELAY_BETWEEN_CALLS_MS = 1500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(base64Image) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: VISION_SYSTEM_PROMPT }] },
      contents: [{
        role: 'user',
        parts: [
          { text: VISION_USER_PROMPT },
          { inline_data: { mime_type: 'image/jpeg', data: base64Image } },
        ],
      }],
      generationConfig: { temperature: 0, response_mime_type: 'application/json' },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Gemini HTTP ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  const finishReason = data?.candidates?.[0]?.finishReason;
  if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
    throw new Error(`Gemini finishReason=${finishReason}`);
  }
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty Gemini response');
  return rawText;
}

async function main() {
  if (!API_KEY) {
    console.error('ERROR: GEMINI_API_KEY not set. Create a .env file (see .env.example) with a valid key and re-run.');
    process.exit(1);
  }

  const expected = JSON.parse(fs.readFileSync(EXPECTED_PATH, 'utf8'));
  const results = [];

  for (const testCase of expected.cases) {
    const imagePath = path.join(IMAGES_DIR, testCase.file);
    process.stdout.write(`\n[${testCase.file}] calling Gemini (${GEMINI_MODEL})... `);

    const result = {
      file: testCase.file,
      category: testCase.category,
      description: testCase.description,
      expected_verdict: testCase.expected_verdict,
    };

    try {
      const base64Image = fs.readFileSync(imagePath).toString('base64');
      const rawText = await callGemini(base64Image);

      let observation;
      try {
        observation = JSON.parse(rawText);
      } catch {
        const match = rawText.match(/\{[\s\S]*\}/);
        observation = JSON.parse(match[0]);
      }
      validateObservation(observation);

      const insectPath = observation.etape_1_declencheur.insecte_exploitable === true;
      const afterFix = juger(observation);

      let beforeFix = null;
      let fixExercised = false;
      if (!insectPath && observation.etape_1_declencheur.structure_visible) {
        beforeFix = jugerStructurePreFix(observation.structure);
        fixExercised = beforeFix.verdict_code !== afterFix.verdict_code
          || beforeFix.reason_code !== afterFix.reason_code;
      }

      result.raw_observation = observation;
      result.path_taken = insectPath ? 'INSECT (jugerMorphologie — unaffected by M1)' : 'STRUCTURE (jugerStructure — M1 fix applies)';
      result.before_fix = beforeFix ? beforeFix.verdict_code + ' / ' + beforeFix.reason_code : 'N/A (insect path)';
      result.after_fix_verdict = afterFix.verdict_code;
      result.after_fix_reason = afterFix.reason_code;
      result.after_fix_confidence = afterFix.confiance;
      result.after_fix_motif = afterFix.motif_principal;
      result.fix_changed_this_case = fixExercised;
      result.matches_expected = afterFix.verdict_code === testCase.expected_verdict;
      result.error = null;

      console.log(`${result.after_fix_verdict} (expected ${testCase.expected_verdict}) ${result.matches_expected ? 'MATCH' : 'MISMATCH'}`);
    } catch (e) {
      result.error = e.message;
      result.matches_expected = false;
      console.log(`ERROR: ${e.message}`);
    }

    results.push(result);
    await sleep(DELAY_BETWEEN_CALLS_MS);
  }

  fs.writeFileSync(REPORT_JSON_PATH, JSON.stringify(results, null, 2));

  const mdLines = [];
  mdLines.push('# M1 — Real reference-set before/after report');
  mdLines.push('');
  mdLines.push(`Model: \`${GEMINI_MODEL}\` | Generated: ${new Date().toISOString()}`);
  mdLines.push('');
  mdLines.push('| # | File | Category | Path | Before fix | After fix | Expected | Match |');
  mdLines.push('|---|---|---|---|---|---|---|---|');
  results.forEach((r, i) => {
    const afterDisplay = r.error ? `ERROR: ${r.error}` : `${r.after_fix_verdict} / ${r.after_fix_reason}`;
    mdLines.push(`| ${i + 1} | ${r.file} | ${r.category} | ${r.path_taken || '-'} | ${r.before_fix || '-'} | ${afterDisplay} | ${r.expected_verdict} | ${r.matches_expected ? '✅' : '❌'} |`);
  });
  mdLines.push('');
  const nMatch = results.filter(r => r.matches_expected).length;
  mdLines.push(`**${nMatch}/${results.length} match the client's expected verdict.**`);
  mdLines.push('');
  mdLines.push('Full raw JSON observations per image are in `m1_report.json`.');
  fs.writeFileSync(REPORT_MD_PATH, mdLines.join('\n'));

  console.log(`\n\nDone. ${nMatch}/${results.length} matched.`);
  console.log(`Report written to:\n  ${REPORT_JSON_PATH}\n  ${REPORT_MD_PATH}`);
}

main();
