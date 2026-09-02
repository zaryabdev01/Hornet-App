# ApiSave proxy

M3, Phase 1: a minimal server-side forward-proxy for the Gemini vision call, so the real
`GEMINI_API_KEY` never ships inside the mobile app bundle.

## Local setup

```
cd proxy
npm install
cp .env.example .env   # fill in APP_SECRET and GEMINI_API_KEY
npm run dev
```

Health check: `GET http://localhost:8787/health`

## Request shape

`POST /api/analyze`, header `X-App-Secret: <APP_SECRET>`, body identical to what the mobile
app already builds for a direct Gemini call:

```json
{
  "system_instruction": { "parts": [{ "text": "..." }] },
  "contents": [{ "role": "user", "parts": [...] }],
  "generationConfig": { "temperature": 0, "response_mime_type": "application/json" }
}
```

The proxy injects the real Gemini key server-side, forwards to
`generativelanguage.googleapis.com`, and returns Gemini's response unchanged.

## Status

Phase 1 only — a transparent pass-through. Not yet implemented:

- **Phase 2**: native `responseSchema` enforcement + fallback path, with native-valid vs.
  fallback-activation reported as separate metrics.
- **Phase 3**: model allowlist (refuse to start on an unapproved model string) and the atomic
  {model, prompt version, schema version} protocol bundle, replacing the single `GEMINI_MODEL`
  env var used today.

See `docs/ApiSave_M3_Implementation_Plan.md` in the main repo for the full scope.

## Deployment

Not yet deployed anywhere. Any small Node host works (Render, Railway, Fly.io, a plain VPS).
Whichever is chosen, set `APP_SECRET` and `GEMINI_API_KEY` as the platform's own secret/env
vars — never commit `.env`.
