# ApiSave — working rules for Claude Code

Claude Code loads this file into context at the start of **every** session. Keep it
short; put engagement history and architecture detail in `.claude/PROJECT_OVERVIEW.md`
(read that too, near the start of a session).

## Branching & review policy — NON-NEGOTIABLE (company policy)

**Never commit, merge, or push directly to `main` (or `master`).** Penalties apply.

Every milestone and every feature — however small, including docs and config — is done
like this:

1. `git checkout main && git pull` to get the latest.
2. `git checkout -b <descriptive-branch-name>` — e.g. `m3-proxy-and-protocol-bundle`,
   `fix/crabro-false-negatives`, `chore/...`.
3. Do the work and commit **on that branch only**.
4. `git push -u origin <branch>`.
5. Open a Pull Request. **A different team member reviews and merges it** — never
   self-merge, never fast-forward `main` locally.

Consequences of this policy for how you work:
- If you find yourself on `main` with changes to make, **stop and branch first**.
- A local `git checkout main && git merge <branch>` still bypasses review — don't do it,
  even though the push afterwards is what the guard blocks.
- The `.claude/hooks/guard-protected-branch.cjs` PreToolUse hook enforces this: it
  denies `git commit|merge|rebase|cherry-pick|revert|push` while on `main`/`master`, and
  any `git push` whose target ref is `main`/`master`. If it blocks you, that is working
  as intended — branch and open a PR. A genuinely authorised exception is disabled per
  session via `/hooks`.

## Other conventions

- Client deliverables: write a `.md`, convert with
  `pandoc <file>.md -o <file>.docx --standalone`, plus a short plain-text cover message.
- Never send an unverified build to the client; verify the embedded Gemini key in the
  built artifact first.
- Detection-logic changes (`src/engine/judge.js`, `src/core/prompts.js`,
  `src/core/schema.js`) need client sign-off and before/after repeated-sampling
  regression evidence (`scripts/postval-regression.cjs`) — never a single sample.
- `.env` is gitignored and never travels with the repo; EAS env vars are the source of
  truth for builds.
