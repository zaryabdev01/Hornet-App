// M3 Phase 2 acceptance check: rerun the 10 unchanged M2 reference images through the proxy,
// full validateObservation() on every response (not just the lightweight proxy-side check),
// confirm photo #9 -> ROUGE and zero unjustified VERT, report raw outputs + native-valid vs
// fallback split per case. Matches acceptance criteria items 3-6 in
// docs/ApiSave_M3_Preimplementation_Clarifications.md.
global.__DEV__ = false;
require('../scripts/babel-esm-loader.cjs');
const fs = require('fs');
const path = require('path');
const { VISION_SYSTEM_PROMPT, VISION_USER_PROMPT } = require(path.join(__dirname, '..', 'src', 'core', 'prompts.js'));
const { validateObservation } = require(path.join(__dirname, '..', 'src', 'core', 'schema.js'));
const { juger } = require(path.join(__dirname, '..', 'src', 'engine', 'judge.js'));

const PROXY_URL = 'http://localhost:8787/api/analyze';
const APP_SECRET = 'local-dev-test-secret-do-not-use-in-prod';
const ACTIVE_BUNDLE = 'gemini-3.6-flash+prompt-V2.5+schema-V1.9';
const IMAGES_DIR = path.join(__dirname, '..', 'test_images_2');

async function main() {
  const expected = JSON.parse(fs.readFileSync(path.join(IMAGES_DIR, 'expected_outcomes.json'), 'utf8'));
  const results = [];

  for (const testCase of expected.cases) {
    const imagePath = path.join(IMAGES_DIR, testCase.file);
    const base64Image = fs.readFileSync(imagePath).toString('base64');

    const body = JSON.stringify({
      system_instruction: { parts: [{ text: VISION_SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: VISION_USER_PROMPT }, { inline_data: { mime_type: 'image/jpeg', data: base64Image } }] }],
      generationConfig: { temperature: 0, response_mime_type: 'application/json' },
    });

    process.stdout.write(`[${testCase.file}] `);
    const metricsBefore = await (await fetch('http://localhost:8787/metrics')).json();

    const res = await fetch(PROXY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-App-Secret': APP_SECRET, 'X-Protocol-Bundle': ACTIVE_BUNDLE }, body });
    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    const metricsAfter = await (await fetch('http://localhost:8787/metrics')).json();
    const wasFallback = metricsAfter.fallback_activated_count > metricsBefore.fallback_activated_count;

    let observation, verdict, validationError;
    try {
      observation = JSON.parse(rawText);
      validateObservation(observation);
      verdict = juger(observation);
    } catch (e) {
      validationError = e.message;
    }

    const result = {
      file: testCase.file,
      expected: testCase.expected_verdict,
      path: wasFallback ? 'FALLBACK' : 'NATIVE',
      verdict_code: verdict?.verdict_code,
      reason_code: verdict?.reason_code,
      validation_error: validationError || null,
      raw_observation: observation || null,
    };
    results.push(result);
    console.log(`${result.path} | ${verdict?.verdict_code || 'VALIDATION_FAILED'} (expected ${testCase.expected_verdict}) ${validationError ? 'ERROR: ' + validationError : ''}`);

    await new Promise(r => setTimeout(r, 1200));
  }

  fs.writeFileSync(path.join(__dirname, 'phase2-regression-report.json'), JSON.stringify(results, null, 2));

  const nativeCount = results.filter(r => r.path === 'NATIVE').length;
  const fallbackCount = results.filter(r => r.path === 'FALLBACK').length;
  const unjustifiedVert = results.filter(r => r.verdict_code === 'VERT' && !['ORANGE_PROBABLE_NON_CIBLE', 'VERT'].includes(r.expected)).length;
  const photo9 = results.find(r => r.file.includes('09'));

  console.log('\n=== Summary ===');
  console.log(`Native-valid: ${nativeCount}/10 | Fallback activated: ${fallbackCount}/10`);
  console.log(`Photo #9 verdict: ${photo9?.verdict_code} (expect ROUGE)`);
  console.log(`Any validation failures: ${results.filter(r => r.validation_error).length}`);
  console.log('Full raw output: proxy/phase2-regression-report.json');
}

main().catch(e => { console.error('FAILED:', e); process.exit(1); });
