Hi Nordine,

Diagnostic attached, no implementation done — as requested.

Short answer: I don't think a reliable narrower rule exists in the current data. I lined up passing and failing calls of the exact same confirmed-target photos side by side, and the description text is essentially identical between them — same claims about the insect, just reworded. Nothing distinguishes a "genuinely too small/distant" read from a normal one; `lisibilite` and `confidence` both look like self-rating noise on these two reference images rather than a real signal tracking anything that changed about the photo. I also checked the "multiple insects in frame" theory, since Photo 1 consistently mentions several insects — but one of your confirmed-target cases does too, including on calls that correctly fired the alert, so that doesn't separate the groups either.

On your architecture question: a dedicated size/framing field is possible, but only the deterministic version (asking for real bounding-box coordinates and computing frame occupancy as arithmetic) would actually be a different, more reliable kind of signal — a self-reported size estimate would just be a third field with the same self-rating noise problem the other two already show. The deterministic version is a genuinely bigger piece of work than anything in M2 so far, and I'd want to scope and price it separately rather than estimate it in passing here.

This diagnostic itself cost nothing extra — pure analysis against data and infrastructure already built under M2, no new calls, no new code.

My recommendation, per your own fallback: revert V1.12 and park Photo 1 alongside Photo 5 as a documented limitation for now. I'll do that as soon as you confirm — nothing changed yet.

Thanks,
Zaryab
