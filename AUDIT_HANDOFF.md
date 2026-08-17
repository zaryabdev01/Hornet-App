# ApiSave — Read-only audit handoff

This archive is a sanitized copy of the current React Native / Expo project.
It is provided exclusively for the agreed read-only technical audit.

## Canonical specification

The canonical `Apisave :: Gemini V14` PDF is supplied separately. It is the
reference document for comparing the current implementation with V14.

## Sanitization performed

The following items were intentionally excluded:

- `.env` and all real environment-variable values;
- `node_modules`;
- `.expo`;
- `.git`;
- local caches and operating-system metadata.

The required variable names are documented in `.env.example` with empty values.

## Audit boundary

No source-code changes are requested during this phase. The expected written
report should identify significant divergences from V14, explain recommended
corrections, and propose a milestone-based implementation plan with estimated
effort.
