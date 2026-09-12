# Git Policy — Manual Commits & Pushes Only

The user explicitly manages all git commits and git pushes to GitHub (or any remote) manually.

## Rules:
1. **NEVER run `git commit` or `git push`** automatically under any circumstances, unless the user explicitly and directly instructs you to commit or push in that specific prompt.
2. Do NOT run git operations that modify history or push to remotes (e.g. `git push`, `git rebase`, `git reset`, `git merge`, `git commit`).
3. Making local file changes (editing, creating, deleting files, running builds/tests) as instructed by user tasks is allowed and expected.
4. Read-only git operations (such as `git status`, `git diff`, `git log`) to inspect workspace status are permitted.
