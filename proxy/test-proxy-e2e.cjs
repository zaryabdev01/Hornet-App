// One-off local test: proxy auth rejection + full end-to-end Gemini call through the proxy.
// Not part of the permanent test suite — run manually, delete or move once Phase 1 is verified.
global.__DEV__ = false;
require('../scripts/babel-esm-loader.cjs');
const fs = require('fs');
const path = require('path');
const { VISION_SYSTEM_PROMPT, VISION_USER_PROMPT } = require(path.join(__dirname, '..', 'src', 'core', 'prompts.js'));

const PROXY_URL = 'http://localhost:8787/api/analyze';
const REAL_SECRET = 'local-dev-test-secret-do-not-use-in-prod';
const ACTIVE_BUNDLE = 'gemini-3.6-flash+prompt-V2.5+schema-V1.9';

async function main() {
  const base64Image = fs.readFileSync(path.join(__dirname, '..', 'test_images_2', 'ref_image_02.jpg')).toString('base64');

  const body = JSON.stringify({
    system_instruction: { parts: [{ text: VISION_SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: VISION_USER_PROMPT }, { inline_data: { mime_type: 'image/jpeg', data: base64Image } }] }],
    generationConfig: { temperature: 0, response_mime_type: 'application/json' },
  });

  console.log('--- Test 1: wrong secret should be rejected with 401 ---');
  const badRes = await fetch(PROXY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-App-Secret': 'wrong-secret', 'X-Protocol-Bundle': ACTIVE_BUNDLE }, body });
  console.log('status:', badRes.status, await badRes.text());

  console.log('\n--- Test 2: missing secret should be rejected with 401 ---');
  const noSecretRes = await fetch(PROXY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Protocol-Bundle': ACTIVE_BUNDLE }, body });
  console.log('status:', noSecretRes.status, await noSecretRes.text());

  console.log('\n--- Test 3: correct secret, wrong bundle should be rejected with 409 ---');
  const badBundleRes = await fetch(PROXY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-App-Secret': REAL_SECRET, 'X-Protocol-Bundle': 'gemini-3.6-flash+prompt-V1.0+schema-V1.0' }, body });
  console.log('status:', badBundleRes.status, await badBundleRes.text());

  console.log('\n--- Test 4: correct secret and bundle, real end-to-end Gemini call through the proxy ---');
  const goodRes = await fetch(PROXY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-App-Secret': REAL_SECRET, 'X-Protocol-Bundle': ACTIVE_BUNDLE }, body });
  console.log('status:', goodRes.status);
  const data = await goodRes.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log('got observation text:', !!rawText);
  if (rawText) {
    const obs = JSON.parse(rawText);
    console.log('Q1:', obs.Q1_thorax.reponse, '| Q2:', obs.Q2_abdomen.reponse, '| Q3:', obs.Q3_morphologie.reponse);
  } else {
    console.log('full response:', JSON.stringify(data).slice(0, 500));
  }
}

main().catch(e => { console.error('FAILED:', e); process.exit(1); });
