// Diagnostic requested by client 2026-08-26: run 15-20 consecutive analyses using the SAME
// direct-to-Gemini call pattern the currently-deployed app uses (pre-M3 proxy work), with
// minimal delay between calls, capturing the exact status code and error body of every single
// call — not just the final failure — to determine exactly what's happening and when.
global.__DEV__ = false;
require('dotenv').config();
require('./babel-esm-loader.cjs');
const fs = require('fs');
const path = require('path');
const { VISION_SYSTEM_PROMPT, VISION_USER_PROMPT } = require(path.join(__dirname, '..', 'src', 'core', 'prompts.js'));

const GEMINI_MODEL = 'gemini-3.6-flash';
const API_KEY = process.env.GEMINI_API_KEY;

const images = [];
for (const dir of ['test_images', 'test_images_2']) {
  const full = path.join(__dirname, '..', dir);
  for (const f of fs.readdirSync(full)) {
    if (f.endsWith('.jpg') || f.endsWith('.jpeg')) images.push(path.join(full, f));
  }
}

async function callDirect(base64Image) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;
  const start = Date.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: VISION_SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: VISION_USER_PROMPT }, { inline_data: { mime_type: 'image/jpeg', data: base64Image } }] }],
      generationConfig: { temperature: 0, response_mime_type: 'application/json' },
    }),
  });
  const elapsed = Date.now() - start;
  const bodyText = await res.text();
  return { status: res.status, elapsed, bodyText };
}

async function main() {
  console.log('Using', images.length, 'available images, running up to 20 rapid consecutive calls.\n');
  for (let i = 0; i < Math.min(20, images.length); i++) {
    const img = images[i];
    const base64Image = fs.readFileSync(img).toString('base64');
    try {
      const { status, elapsed, bodyText } = await callDirect(base64Image);
      const ok = status === 200;
      let note = '';
      if (!ok) {
        try {
          const parsed = JSON.parse(bodyText);
          note = parsed?.error?.message?.slice(0, 200) || bodyText.slice(0, 200);
        } catch {
          note = bodyText.slice(0, 200);
        }
      }
      console.log(`[${i + 1}/20] ${path.basename(img)} -> HTTP ${status} (${elapsed}ms)${ok ? '' : ' | ' + note}`);
    } catch (e) {
      console.log(`[${i + 1}/20] ${path.basename(img)} -> NETWORK ERROR: ${e.message}`);
    }
    // Minimal delay — deliberately faster than the app's own real-world usage pattern would be,
    // to stress-test within a short window rather than spread over the "several hours" the
    // client described. If this passes cleanly, that's strong evidence the KEY is fine at volume.
    await new Promise(r => setTimeout(r, 500));
  }
}

main().catch(e => { console.error('FAILED:', e); process.exit(1); });
