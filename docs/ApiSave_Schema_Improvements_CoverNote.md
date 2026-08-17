Hi Nordine,

As discussed, attached is a short proposal covering some possible improvements to the observation schema — outside of, and not included in, the M1–M5 plan currently in progress.

Of the six items reviewed, two are recommended: structured evidence per observation (helpful for debugging and building out the reference bank, and doesn't touch the Judge at all), and a breakdown of image quality into focus/lighting/occlusion (makes retake guidance more specific, in the spirit of what you've already asked us to preserve).

Two others — continuous confidence scores and a continuous visibility score — are addressed but not recommended as originally framed. Language models don't produce genuinely calibrated probabilities, so a number like "0.96" would look more rigorous without actually being more trustworthy, and both would require inventing new numeric thresholds inside the Judge rather than staying schema-only as they first appear. The proposal includes a categorical alternative for each that gets the same practical benefit without that risk.

The remaining two — a bounding box and a general notes field — are deferred: the bounding box has no current feature that uses it, and the notes field overlaps with the evidence field in a way that could make model output less consistent, not more.

This is entirely optional and separate from the current corrective work — happy to scope it as its own milestone later if any of it is of interest, but nothing here needs a decision before M1–M5 proceeds.

Thank you.
