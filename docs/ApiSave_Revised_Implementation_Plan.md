# ApiSave — Implementation Plan (Confirmed Terms)

**Prepared for:** Nordine
**Basis:** Audit findings 1–9, your decisions of 2026-07-30 and 2026-07-31, your confirmation/questions of 2026-08-01, and the M2 validation rounds through 2026-08-09.
**Status (updated 2026-08-09):** M1 is complete and validated (10/10, see M1 validation report). M2's logic work is implemented and has been through four real-data validation rounds (see Round 1–4 reports and the accompanying engineering assessment) — current score 9/10 on the reference set, with one confirmed open finding (photo #10, tag-recall gap) and no outstanding Judge bugs. M2 is not yet formally closed — pending your review of the engineering assessment and sign-off. M3's scope now includes four mandatory acceptance criteria added after M2 validation (below); its price is still pending the proxy-status question. M4 now has two designated permanent stability-test images. M5 is unchanged.

---

## Closed items

**Finding 5 — approved as recommended, no further action needed:**
1. "Insect priority" sentence — dropped, not restored.
2. Expanded ignore-list — held, revisit only if validation shows a real gap.
3. Additional Q2/Q3 "NON" examples — held, same reasoning.
4. Fixed fallback values for the inactive mode block — kept.

**Schema Enhancement Proposal — deferred in full**, per your instruction. Not part of this plan or its pricing. Per-feature evidence and the image-quality breakdown remain open to reconsider later if validation results justify them.

---

## Your four technical questions, answered

**1. Installable build at the end of M2 for your own testing.**
Confirmed — a development/internal build will be produced at the end of M2 (before M3 begins), so you can run your reference images through the actual app yourself. iOS will be distributed via TestFlight; Android via a directly-installable internal build. Two things this changes:
- **Timing dependency moved up:** Apple Developer Program / App Store Connect access is now needed **before the end of M2**, not at M5 as originally planned. Please arrange this access ahead of M2 starting, so it doesn't block delivery.
- **Security caveat:** this build still calls Gemini with the API key embedded client-side, because M3 (the key-security fix) hasn't happened yet. That's fine for your own personal testing, but this specific build shouldn't be distributed further than that — flagging so it's explicit rather than assumed.

M3 remains conditional on your satisfactory validation of this build, as you've requested.

**2. European-hornet schema/prompt addition — confirmed included in M2.**
If validation shows the existing observation fields aren't specific enough to reliably route European-hornet cases, designing and implementing the addition stays inside M2's fixed price — **provided it remains a narrow, bounded addition serving this specific rule** (in practice: one or two new fields/tags, not a broader schema redesign). It's still subject to your approval before implementation, per the same process as Finding 5. If investigation surfaced something structurally larger than that, it would be flagged separately before proceeding — same principle as everything else in this plan, stated explicitly since you asked.

**3. M4 comparison methodology — confirmed as requested.**
- **Field-based comparison:** every decision-relevant structured field (Q1/Q2/Q3 answers, confidence, structure fields, `incompatibilites_cible` entries, and the final `verdict_code`/`reason_code`/`confiance`) must match exactly — these are enums driving the Judge, so exact match is the correct bar.
- **Free-text fields** (`description_visible`, `justification`) are captured and logged for human review, not scored pass/fail — word-for-word matching on prose isn't a meaningful test.
- **Verdict stability:** the two highest-stakes categories — confirmed Asian hornet and confirmed European hornet cases — will each be run **5 times** through the full pipeline, with the consistency rate reported. This is included in M4's existing scope; no separate charge.

**4. Proxy status.**
Checked first, as you asked: from the sanitized repository, this **cannot be determined**. The real `PROXY_URL` value was correctly stripped as part of sanitization — all that remains is an aspirational code comment ("consider a Cloudflare proxy identical to the OpenAI architecture"), which isn't proof of a live, deployed server. This genuinely requires input from you: either confirm directly whether it's still running (and share the endpoint), or the $125 infrastructure check applies. **Confirmed: if that check is needed, its $125 cost is credited toward whichever M3 option is ultimately selected** — not an additional cost on top.

---

## Budget

The original combined M1+M2 price was $1,750. Reducing all the way to $1,200 would go below what the added scope (European-hornet rule work, plus the newly-added TestFlight/internal-build deliverable) actually costs to deliver properly.

**Proposed compromise: $1,500 combined, structured as:**
- **M1: $500** (unchanged)
- **M2: $1,000** (reduced from $1,250)

This absorbs the European-hornet contingency work and the new build/TestFlight deliverable as a $250 concession, rather than passing their cost on, while keeping the full scope and deliverables described below unchanged. M1 and M2 remain separate milestones; **M2 will not be created until you've confirmed M1's validation results are satisfactory.**

---

## M1 — Critical Judge Fix + Model Pin — ✅ COMPLETE, VALIDATED 10/10 (2026-08-06)

**Priority:** highest — addressed first and independently of everything else.

**Work:**
- Correct the structure-Judge override so a single artificial-looking cue no longer discards genuine, strong nest evidence (restoring the "more than one cue, and no strong nest markers" condition).
- Pin the exact stable Gemini model identifier for `gemini-3.6-flash` (confirmed against Google's published model list at implementation time — no `-latest` or preview alias), replacing the current `gemini-2.5-flash` call. This supersedes the earlier Gemini 3.5 alignment step entirely; not additional work.
- No other Judge logic is touched in this milestone.

**Verification (deliverable, not just implementation):**
- Reference image set (nest/structure subset) run through the structure-judging path before and after the fix, on the newly-pinned model.
- Report shows, per image: the raw structured JSON returned by Gemini and the final deterministic verdict, both before and after.
- Confirm previously-correct cases are unchanged; confirm the bug scenario now resolves correctly.

**Deliverables:**
1. Patched `judge.js` (structure-override logic only).
2. Updated `geminiApi.js` with the pinned model identifier.
3. Before/after report: raw JSON + final verdict, per reference image.

**Acceptance criteria:**
- No changes outside the specific override condition and the model identifier.
- All previously-correct reference cases remain correct on both JSON and verdict.
- The bug scenario is demonstrably fixed, shown at both the JSON and verdict level.

**Dependency on you:** the nest/structure portion of the reference set with expected outcomes — received and validated 2026-08-06, 10/10 match.

**Price: $500 fixed (2 days) — delivered and validated**

---

## M2 — Prompt, Schema & Judge Fidelity Restoration + European Hornet Rule + Test Build — logic work implemented, pending your close-out sign-off (2026-08-09)

**Status:** all logic scope below is implemented and has been through four real-data validation rounds against the reference set. Current state: 9/10 matched, zero unjustified VERT verdicts, zero remaining Judge logic bugs. One confirmed open finding — photo #10, a tag-recall gap in the vision layer, not a Judge defect — assigned to M3 (enum enforcement) and M4 (stability measurement) rather than fixed unilaterally in M2, per the same approval discipline used throughout. Full detail in the Round 1–4 reports and `ApiSave_Engineering_Assessment_M2_Closure`. Client has accepted M2's logic results (2026-08-09). **The TestFlight/internal test build (deliverable 5 below) is the sole remaining item before M2 formally closes** — Apple ID provided (2026-08-10), awaiting the client's App Store Connect invitation before the build can be produced and submitted.

**Work — fidelity restoration (from the audit):**
- Restore the explicit five-step gated pipeline structure (`ETAPE 1–5`) from §1.3, verbatim.
- Fix the beetle-exclusion tag (currently mislabeled as the opposite morphology).
- Restore the missing "stop evaluation" instruction on the wasp/Polistes lock.
- Reconcile the JSON enum split back to the single canonical value.
- Apply the Finding 5 decisions (confirmed above).
- Add two new, distinct incompatibility tags ("hairy/massive body," "hard carapace/elytra") and wire the two previously-unreachable reason codes into `judge.js`.

**Work — European hornet verdict rule:**
An exploitable image showing European-hornet characteristics must deterministically resolve to `ORANGE_PROBABLE_NON_CIBLE`, never `VERT`; an insufficient image stays `ORANGE_INSUFFISANCE`; the rule stays narrow to genuine close-hornet-like non-target cases and must not push every excluded insect or object to orange.
1. Tighten the existing chromatic-threshold logic first, so a clearly-identified European-hornet signature reliably routes to `ORANGE_PROBABLE_NON_CIBLE`, without touching how unrelated/excluded cases are handled.
2. Validate against the European-hornet images in your reference set.
3. If (and only if) validation shows the existing fields aren't specific enough, a bounded schema/prompt addition will be presented with justification before implementation (confirmed included in this milestone's price per your question above).

**Work — test build:**
- Produce a development/internal build at the end of this milestone: TestFlight for iOS, direct-install internal build for Android — for your own reference-image validation ahead of approving M3.

**Verification (deliverable):**
- Full reference set run before and after (insect-path and structure-path, including European hornet and unrelated-object categories).
- Report shows raw JSON + final verdict, per image, before and after.
- Confirm: hairy-body and beetle-carapace cases produce their dedicated reason codes; European-hornet images resolve to `ORANGE_PROBABLE_NON_CIBLE`; unrelated/excluded cases are not pushed to orange; insufficient images remain `ORANGE_INSUFFISANCE`.

**Deliverables:**
1. Restored `prompts.js`, matching §1.3 exactly except approved Finding 5 exceptions.
2. Reconciled `schema.js` (enum fix, two new incompatibility tags, plus any justified European-hornet addition).
3. Updated `judge.js` (two new reason-code branches, tightened European-hornet routing).
4. Before/after report across the full reference set (JSON + verdict).
5. Installable TestFlight (iOS) and internal (Android) build.

**Acceptance criteria (status as of Round 4, 2026-08-09):**
- `prompts.js` diffed against §1.3 is an exact match aside from documented, approved exceptions. ✅
- Both newly-wired reason codes demonstrated on real reference images. ✅ (M1 reference set)
- Every European-hornet reference image resolves to `ORANGE_PROBABLE_NON_CIBLE`; no unrelated/excluded case is pushed to orange. ✅ (all 4 European-hornet cases correct as of Round 4; zero VERT verdicts anywhere in the run)
- Every wasp/Polistes reference image resolves to `ORANGE_PROBABLE_NON_CIBLE`. ⚠️ 3 of 4 — photo #10 remains an open, evidenced tag-recall gap (0-for-4 across all rounds), assigned to M3/M4 per the engineering assessment rather than patched unilaterally.
- You've been able to install and run the test build against your own reference images. ⏳ Not yet — pending Apple Developer / App Store Connect access.

**Dependency on you:** Apple Developer Program / App Store Connect access, in place before this milestone starts (moved up from M5).

**Price: $1,000 fixed (4 days) — negotiated, includes the European-hornet contingency and test-build deliverable at no additional charge**

---

## M3 — Gemini API Hardening & Key Security

**Work:**
- Add native structured-output schema enforcement (`responseSchema`) to the Gemini call, built from `core/schema.js`.
- Move the Gemini call behind a server-side proxy so `GEMINI_API_KEY` no longer ships inside the mobile app bundle, reusing the existing `PROXY_URL`/`PROXY_SECRET` architecture from the retired OpenAI integration wherever it can be directly adapted.

| Scenario | Scope | Price |
|---|---|---|
| **Option A** — old proxy still deployed and reachable | Repoint at Gemini, adjust payload shape, redeploy | 3 days — **$750** |
| **Option B** — that infrastructure no longer exists | Stand up a new minimal proxy in addition to the above | 4 days — **$1,000** |

As covered above: this can't be determined from the sanitized repo alone. Please confirm directly, or approve the $125 infrastructure check (credited toward whichever option applies).

**Deliverables:** updated `geminiApi.js` with schema enforcement and the M1-pinned model; Gemini calls routed through the proxy; `GEMINI_API_KEY` removed from the client bundle; updated `.env.example` if needed.
**Acceptance criteria:** key no longer present in the built app bundle; schema-conformant responses confirmed on test calls; no change in observed verdict behavior end-to-end.

**Additional mandatory acceptance criteria (added 2026-08-09, per client decision after M2 Round 2/3 validation):** the M2 reference-set runs surfaced recurring schema validation failures — Gemini occasionally writes a near-miss/invalid enum value (e.g. `proportions_robustes` instead of the valid `proportions_compactes_robustes`), which today causes the pipeline to produce no verdict at all. M3 must close this gap, specifically:
- Gemini's output must be constrained to the exact allowed enum values via `responseSchema` — not just validated after the fact.
- Every analysis must produce a valid JSON response and a usable verdict — a malformed response is not an acceptable end state for a user.
- A safe fallback verdict must exist for the case where a response still fails validation despite schema enforcement (e.g. `ORANGE_INSUFFISANCE` with a retake reason, never a raw error screen).
- Photo #9 (the Asian-hornet control case in the M2 reference set) must return `ROUGE` consistently across repeated runs — this is the concrete bar M3's fix will be checked against.

---

## M4 — Full-Pipeline Regression Test Suite

**Work:**
- Build a labeled reference bank from the images and expected outcomes you provide, covering all six categories (Asian hornets, European hornets, unrelated insects/objects, nests, artificial structures, insufficient images).
- Automated harness running the complete real pipeline — photo → Gemini → schema validation → Judge → verdict — against the full set.
- **Field-based comparison** on decision-relevant structured fields (exact match); free-text fields logged, not scored.
- **Stability testing:** Asian-hornet and European-hornet reference cases each run 5 times through the full pipeline; consistency rate reported.

**Note on ongoing cost:** live API calls on every run means real, ongoing API cost/time — worth knowing as an operational cost once this is part of your regular workflow, not just a one-time build cost.

**Deliverables:** reference image bank with documented expected outcomes; automated full-pipeline harness with stability-testing mode.
**Acceptance criteria:** harness runs cleanly against the post-M1/M2 codebase, all cases passing at JSON and verdict level; stability results reported for both critical categories; adding a new reference case is a documented process.

**Designated permanent stability-test images (added 2026-08-09, per client decision):** photo #1 (European hornet) and photo #9 (Asian-hornet control case) from the M2 reference set (`test_images_2/`) are retained unchanged and re-run in every future validation round, including as part of M4's repeated-run stability testing.

**Update (Round 4, 2026-08-09):** photo #1 was initially read as a stable hard case after three consecutive incorrect readings (Rounds 1–3), but flipped to correct in Round 4 with no code change on its path — revising the earlier "stable" characterization. This turned out to be evidence of run-to-run model variance rather than a systematic bias, which is itself a useful finding for calibrating how many repeated runs M4 needs before drawing conclusions about any given case (three was not enough here). Photo #10, not photo #1, is the reference set's actual persistent case — 0 for 4 across every round so far. Both remain designated stability-test images; conclusions about which is "hard" should be based on M4's fuller run count, not the M2 rounds alone. Photo #9 must return `ROUGE` on every run; any deviation is a regression.

**Price: $1,250 fixed (5 days)**

---

## M5 — Production Release (App Store + Google Play)

**Work:** final production configuration; App Store Connect and Google Play Console submission (actual release); release smoke testing; corrections from the initial round of store review.

**Scope boundary:** up to two review-response iteration cycles per platform included. Anything requiring substantial rework beyond that would be scoped separately, flagged immediately if it comes up.

**Timeline note:** 6 billable days; actual calendar time to release will typically run 2–4 weeks longer due to store review turnaround, which is outside our control.

**Dependency on you:** Apple Developer Program / Google Play Console access (already established by M2, per above); store listing assets; privacy policy and data-safety content (decisions only you can make; happy to advise on technical accuracy).

**Deliverables:** finalized production build configuration; app live on both stores; release smoke-test report.
**Acceptance criteria:** approved and publicly available on both stores; no secrets in build artifacts or version control; up to two review-response cycles per platform completed if needed.

**Price: $1,500 fixed (6 billable days)**

---

## Summary Timeline & Pricing

| Milestone | Days | Price | Status |
|---|---|---|---|
| M1 — Critical Judge fix + model pin | 2 | **$500** | ✅ Complete, validated 10/10 |
| M2 — Prompt/schema/Judge fidelity + European hornet rule + test build | 4 | **$1,000** | Logic work complete, 9/10 validated (Round 4) — pending your close-out sign-off; test build still outstanding |
| M3 — Gemini API hardening & key security | 3 or 4 | **$750 (A) / $1,000 (B)** | Price pending your confirmation on proxy status; scope expanded with 4 mandatory acceptance criteria (2026-08-09) |
| M4 — Full-pipeline regression suite | 5 | **$1,250** | Two permanent stability-test images designated (2026-08-09) |
| M5 — Production release (both stores) | 6 | **$1,500** | |

**Total — Option A:** 20 days — **$5,000**
**Total — Option B:** 21 days — **$5,250**

---

## What happens next (updated 2026-08-09)

M1 is complete, validated, and closed out. M2's milestone is active on Upwork; its logic scope is implemented and validated through four real rounds (9/10, see the engineering assessment for the honest read on what that number does and doesn't mean). M2 is not yet marked complete — two things remain before it can close:

1. **Your sign-off** on the engineering assessment and Round 4 results — including your decision on how to treat the photo #10 finding (assigned to M3/M4 by default, per the assessment, unless you'd rather revisit).
2. **The TestFlight/internal test build** — blocked on Apple Developer Program / App Store Connect access, still outstanding.

**Needed before M3 is priced exactly:** confirmation on the proxy server's status (or approval of the $125 check).
**Needed before M3 starts:** your approval to proceed, informed by the engineering assessment.
