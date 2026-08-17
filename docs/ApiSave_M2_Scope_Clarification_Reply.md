Hi Nordine,

Thank you — and glad M1 landed well.

**On the Product Vision / verdict flow breakdown:** understood, no action needed on our side beyond what's already planned. M2 already restores and wires up `verdict_code` and `reason_code` cleanly (including making the two previously-unreachable reason codes functional), so this downstream flow will have what it needs.

**On the Non-Target Hymenoptera Rule:** the underlying concern is legitimate and worth fixing — I want to flag what implementing it actually involves before confirming scope, since it's more than a small extension of the European-hornet work already planned.

Tracing it through the current code: when a wasp/Polistes is detected, the prompt forces two specific morphological markers together, which today trips an *earlier* shortcut in the Judge — one that returns a flat "nothing suspicious" (VERT) before the code ever reaches the European-hornet routing logic we're already building for M2. So a clearly-photographed wasp can currently bypass that entire mechanism rather than passing through it. Fixing this properly means adding a check at that earlier point, not just extending the European-hornet branch — genuinely additional work, even though both cases end up at the same `ORANGE_PROBABLE_NON_CIBLE` verdict.

Two things I'd like confirmed before starting:

1. **Scope of the VERT reservation.** You've listed non-biological objects and plant traps as the VERT-eligible cases. The Judge also currently returns VERT for a couple of other narrow cases — e.g. an insect confidently identified as too small to be a hornet, or a confidently-identified beetle/hairy-bodied insect. Should those remain VERT as-is, or should this rule extend to them as well? I'd default to leaving them untouched unless you'd like them included, since they're not wasps/Polistes/European hornets specifically.

2. **The existing message text.** The current on-screen text for `ORANGE_PROBABLE_NON_CIBLE` specifically says "likely a related species (European hornet)" — accurate today, since only European hornets reach that verdict. Once wasps/Polistes share it, that wording would be inaccurate for a wasp. This is right at the edge of the "backend only, no UX redesign" boundary you set, so rather than deciding either way myself, I'd like to confirm: should this one string become species-neutral (e.g., "likely a non-target species"), or do you want to leave the wording as-is for now and revisit later?

One small note: your message refers to `apisave-juge.js` — just confirming we'll be working in the actual file, `src/engine/judge.js`.

**On scope and price:** given the above, I'd like to treat this as a small, justified addition to M2 rather than folding it in silently — proposing **+$150**, bringing M2 to **$1,150** total. This reflects the extra code path involved, plus a couple of additional wasp/Polistes reference images in the validation set to confirm the fix the same way we validated M1. Let me know if that works, or if you'd like to discuss it further.

Once these three points are confirmed, I'll create Milestone 2 and get started.

Thank you.
