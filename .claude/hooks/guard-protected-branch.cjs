#!/usr/bin/env node
/**
 * PreToolUse / Bash guard — enforces the company policy:
 *   All milestone/feature work happens on its own branch, is opened as a PR,
 *   and is reviewed + merged by another team member. Nothing lands on main
 *   (or master) via a direct push, commit, or local merge.
 *
 * Denies (permissionDecision "deny"):
 *   1. Any `git push` segment whose target ref is a protected branch
 *      (e.g. `git push origin HEAD:main`, `git push origin main`, `git push` while on main).
 *   2. `git commit | merge | rebase | cherry-pick | revert` run while the working
 *      tree is checked out on a protected branch.
 *
 * Allows: everything on a feature branch; read-only / sync git on a protected
 * branch (status, log, fetch, pull, checkout, branch, diff, stash, ...); and any
 * command that merely mentions those words in a string/echo/grep without invoking git.
 *
 * Authorised exception: disable this hook for the session via /hooks.
 */
'use strict';

const { execSync } = require('node:child_process');
const fs = require('node:fs');

const PROTECTED = ['main', 'master'];
const WRITE_SUBCMDS = ['commit', 'merge', 'rebase', 'cherry-pick', 'revert'];

const allow = () => process.exit(0);
const deny = (reason) => {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
};

let command = '';
try {
  command = (JSON.parse(fs.readFileSync(0, 'utf8')).tool_input || {}).command || '';
} catch {
  allow();
}
if (!command) allow();

// Break the command line into shell segments and keep only the ones that
// actually invoke `git` as the command (not `git` appearing inside a string,
// an echo, a grep pattern, a path, etc.).
const gitSegments = command
  .split(/[\n;&|]+|\$\(|`|\)/)
  .map((s) => s.trim())
  .filter((s) => /^git(\s|$)/.test(s));

if (gitSegments.length === 0) allow();

let branch = '';
try {
  branch = execSync('git symbolic-ref --quiet --short HEAD', {
    stdio: ['ignore', 'pipe', 'ignore'],
  })
    .toString()
    .trim();
} catch {
  branch = '';
}
const onProtected = PROTECTED.includes(branch);

for (const seg of gitSegments) {
  // --- Rule 1: a git push whose target ref is a protected branch, from anywhere ---
  if (/\bpush\b/.test(seg)) {
    const afterPush = seg.replace(/^git\s+push\b/, '');
    for (const b of PROTECTED) {
      if (new RegExp(`(?:[:\\s/])${b}(?![\\w-])`).test(afterPush)) {
        deny(
          `Blocked by company policy (guard-protected-branch hook): no direct push to "${b}". ` +
            `Push your feature branch instead — git push -u origin <feature-branch> — and open a PR ` +
            `for a teammate to review and merge.`,
        );
      }
    }
    if (onProtected) {
      deny(
        `Blocked by company policy (guard-protected-branch hook): you are on "${branch}". ` +
          `Never push from a protected branch. Work on a feature branch and open a PR.`,
      );
    }
  }

  // --- Rule 2: a writing subcommand while checked out on a protected branch ---
  if (onProtected) {
    const m = seg.match(
      new RegExp(
        `^git\\s+(?:-\\S+\\s+|--\\S+\\s+|-c\\s+\\S+\\s+)*(${WRITE_SUBCMDS.join('|')})\\b`,
      ),
    );
    if (m) {
      deny(
        `Blocked by company policy (guard-protected-branch hook): you are on "${branch}" and ` +
          `every change must go through a reviewed PR. Do not "git ${m[1]}" here.\n` +
          `  1. git checkout -b <feature-branch>\n` +
          `  2. make the change and commit on that branch\n` +
          `  3. git push -u origin <feature-branch>\n` +
          `  4. open a PR for a team member to review and merge.`,
      );
    }
  }
}

allow();
