Hi Nordine,

Thank you — you've read this correctly, and the diagnosis is attached. I have gone through
the ten screenshots you sent (seven cases). No code has been changed; you asked for the
diagnosis first and here it is.

All seven cases are non-target insects and the build gets all seven wrong: one paper-wasp
on its comb nest reaching "Asian hornet highly probable" at 92%, three wasps and hoverflies
(one is a fly, not even a hymenopteran) sent to "Insufficient data" with a "use natural
light" message despite being shot in full sun, and a sharp European hornet sent to
"Insufficient data" with a "blurry image" message. Each one is mapped in the document to
the exact rule that produced it.

Short version:

**Kept:** the distant-structure advice and the Asian-hornet correction on the false
negatives are both good and stay.

**Confirmed broken, and why:** the caution logic added alongside the Asian-hornet fix went
too far. My own before/after sampling on the reference images shows it clearly — a
confirmed European hornet now goes to ROUGE on 4 runs out of 6 (was 2/6), and several
clearly non-target insects that used to be flagged "probable non-target" now land on
"insufficient". The reason codes attached to those "insufficient" results are generic
buckets, not real descriptions of the photo — which is why you're seeing "take a less
blurry photo" on sharp images and "use natural light" on outdoor daylight shots.

The structural cause is the one you pointed at: the Judge concludes ROUGE the moment
Q1 + Q2 + Q3 = OUI, and there is no mirror of that rule for the look-alikes. So a European
hornet that the model happens to read as a clean Asian-hornet signature never even reaches
the crabro logic. And where the crabro logic *is* reached, the new thresholds are strict
enough to divert genuine European hornets and wasps to "insufficient" before they can
conclude.

CRABRO_LIKE_PROFILE and NON_TARGET_HYMENOPTERA are still wired in and still run before the
ROUGE decision — but NON_TARGET_HYMENOPTERA only fires when the model reports the wasp
*shape* markers, and CRABRO_LIKE_PROFILE is only reachable when the individual isn't already
read as a full target signature.

**Proposed fix (in the document, for your approval):**
1. A symmetrical exclusion gate, checked *before* ROUGE: if two or more reliable
   non-velutina markers are clearly visible (multiple regular bands, yellow-dominant
   abdomen, reddish head or thorax, wasp morphology), the Judge concludes "other vespid"
   regardless of Q1/Q2/Q3.
2. Roll the over-strict thresholds back toward the previous behaviour for the non-target
   routes, keeping only the parts that genuinely protect against Asian-hornet false
   negatives.
3. A retake is only ever requested when a specific criterion is actually unreadable, with
   the reason code naming which one and why. "Species is ambiguous but the photo was fine"
   stops being an insufficiency.

Everything will be validated before/after with repeated sampling against the full set —
confirmed Asian hornets, the four false-negative hornets, the European hornets, the wasps,
the scoliids, the mandarinia set — plus your new screenshots added as permanent cases.

Could you send the original photographs for those seven cases (the raw images, not the app
screenshots)? Each will go into the permanent regression set. And let me know if the
direction in section 4 is what you want — I won't touch the code until then.

Thanks,
Zaryab
