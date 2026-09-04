#!/usr/bin/env bash
# Manual test harness for guard-protected-branch.cjs. Run from the repo root:
#   bash .claude/hooks/test-guard.sh
# Switches to main briefly for the "on protected" cases, then restores your branch.
set -u
G="$(cd "$(dirname "$0")" && pwd)/guard-protected-branch.cjs"
start_branch="$(git symbolic-ref --quiet --short HEAD || echo DETACHED)"
pass=0; fail=0

check() { # <command> <ALLOW|DENY>
  local cmd="$1" exp="$2" out got
  out="$(node -e 'process.stdout.write(JSON.stringify({tool_name:"Bash",tool_input:{command:process.argv[1]}}))' "$cmd" | node "$G")"
  got=$([ -n "$out" ] && echo DENY || echo ALLOW)
  if [ "$got" = "$exp" ]; then pass=$((pass+1)); printf '  ok   %-44s %s\n' "$cmd" "$got"
  else fail=$((fail+1)); printf '  FAIL %-44s exp=%s got=%s\n' "$cmd" "$exp" "$got"; fi
}

echo "[on feature branch: $start_branch]"
check 'git push'                              ALLOW
check 'git push -u origin feature/x'          ALLOW
check 'git commit -m wip'                     ALLOW
check 'git push origin HEAD:main'             DENY
check 'git push origin main'                  DENY
check 'git push --force origin master'        DENY
check 'git push origin feat:main-thing'       ALLOW
check 'echo "run: git push origin main"'      ALLOW
check 'grep -rn "git commit" .'               ALLOW
check 'npm run build'                         ALLOW

git checkout -q main 2>/dev/null || { echo "cannot switch to main, skipping protected cases"; }
if [ "$(git symbolic-ref --quiet --short HEAD)" = "main" ]; then
  echo "[on protected branch: main]"
  check 'git commit -m x'                     DENY
  check 'git commit --amend'                  DENY
  check 'git merge feature'                   DENY
  check 'git rebase origin/main'              DENY
  check 'git cherry-pick abc1234'             DENY
  check 'git revert HEAD'                     DENY
  check 'git push'                            DENY
  check 'git status'                          ALLOW
  check 'git pull'                            ALLOW
  check 'git fetch origin'                    ALLOW
  check 'git checkout -b feature/x'           ALLOW
  check 'git log --grep=commit'               ALLOW
  check 'git diff main'                       ALLOW
  git checkout -q "$start_branch"
fi

echo
echo "$pass passed, $fail failed."
[ "$fail" -eq 0 ]
