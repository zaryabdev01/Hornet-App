# ApiSave — "Too Many Gemini Requests" Diagnostic

**Prepared for:** Nordine
**Date:** 2026-08-28
**Status:** Diagnosis only, per your explicit request — no changes made yet.

---

## Short answer

The build you're testing is almost certainly still running on **my personal Gemini key, not yours** — the free tier of that key has a **hard cap of 20 requests per day**, and everything you're describing matches that exactly: works for roughly 10 analyses, fails for hours afterward, and only recovers the next day (a daily quota reset, not a per-minute one). Your own dashboard shows you well under limits because these requests aren't landing in your project at all.

I found this by checking the actual build records, not by guessing — details below, then direct answers to your five questions.

## What I checked

**1. EAS's server-side environment/secrets store is completely empty for this project** (`eas env:list`, `eas secret:list` — both return nothing). This matters because Expo's config resolution reads the Gemini key from whichever machine's local `.env` file was present *at the moment `eas build` was run* — it does not pull from a central secret store unless one was explicitly configured, which never happened here.

**2. The Android build history shows only three builds, all from 11 days ago (2026-08-17), and no newer one since.** The most recent — `V8qnTiYkZsjc142SLKcbX5WgdsxY0r-eXkGtqPRbjag.apk` — is the exact crash-fix build I sent you with the message asking for your own Gemini key, specifically because that build was running on mine. If you're testing Android and haven't installed a newer APK since, this is definitively still that build.

**3. Two iOS builds exist (2026-08-25 and 2026-08-27)** — these are internal/direct-install builds, not an actual App Store Connect TestFlight submission (that step has been separately blocked by an Apple 2FA issue we're still working through, so if "TestFlight" means the literal TestFlight app, that submission hasn't gone through yet — if it means the direct-install link, that's a different thing and may already have your key). I can't confirm with certainty from here whether these two builds have your key baked in without checking the exact timing against when you sent it — flagging this as open rather than guessing.

## Direct answers to your five questions

1. **Does one photo generate only one Gemini request?** Normally yes — but the app has automatic retry logic that fires up to 2 additional attempts if a request comes back as rate-limited or hits a network error. Near a quota boundary, a single user-visible "analysis" can silently become up to 3 real requests, which accelerates hitting a tight daily cap faster than the visible analysis count suggests.

2. **Are requests or retries accumulating inside the app?** Yes, per the above — invisibly to you, but real requests are being made on retry.

3. **Is the build using your API key and Gemini project?** For Android: strong evidence no — see the build history above. For iOS: unconfirmed, needs the timing check.

4. **Does the model have a daily request limit?** Yes, confirmed directly against the live API: the free tier caps `gemini-3.6-flash` at exactly 20 requests per day, project-wide. Your paid tier does not have this specific cap.

5. **What's the exact error?** In the currently-deployed code, any HTTP 429 from Gemini produces the message `"Trop de requêtes Gemini — réessayez dans quelques secondes"`. "Too many Gemini requests" is consistent with that — not a sign of some other hidden error underneath it.

## What I verified empirically, per your request

I ran **20 consecutive rapid analyses using your actual paid key** (the same one that's supposed to be in the build) — every single one succeeded, zero failures, zero rate-limit errors. That's direct evidence your key and quota are fine at this volume; the problem is specifically about which key the deployed build is actually using, not your account or the app's request pattern in general.

## What I have not done

No code changes, no rebuild — this was diagnosis only, as you asked. The actual fix is straightforward once confirmed: rebuild with your key correctly in place before the build runs. Separately, this is exactly the class of problem the server-side proxy work already underway (moving the Gemini key out of the app entirely) is designed to prevent going forward — once that ships, which key is baked into which build stops being a question at all, since the app would call a proxy rather than embed a raw key.

**One thing I need from you to close this out precisely:** can you confirm which platform/build you've been testing (Android APK, or one of the two iOS builds), so I can verify with certainty rather than leave the iOS side as an open question?
