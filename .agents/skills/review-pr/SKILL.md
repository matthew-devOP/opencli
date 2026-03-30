---
name: review-pr
description: "Review a GitHub Pull Request end to end inside the opencli project. Use whenever the user mentions 'review PR', 'review this PR', 'check this PR', shares a GitHub PR URL or number, asks to inspect a contributor's branch, wants a worktree-based code review, or says '帮我 review PR', '看一下这个 PR'. Covers: worktree isolation from origin/main, CI check, rebase, code review with P0/P1/P2 severity, direct fixes, and push back to the PR branch."
---

# Review PR

Review a PR in an isolated worktree, rebase it onto `origin/main`, summarize the change, identify issues, fix them, and push directly to the PR branch.

This skill is intentionally opinionated for `~/code/opencli`:

- Always start from `origin/main`
- Always use a dedicated worktree
- Always check remote CI with `gh pr checks`
- Always summarize what the PR does before or alongside the review result
- If you find clear issues, fix them directly and push to the PR branch

## Inputs

Accept any of these:

- PR number like `437`
- GitHub URL like `https://github.com/jackwener/opencli/pull/437`
- A vague request like "review this PR" when the active branch or context already identifies the PR

If the PR number is not obvious, resolve it first before touching git state.

## Output Contract

When reporting back to the user, always include:

1. What the PR does
2. Findings, ordered by severity
3. What you changed, if anything
4. What you ran to verify
5. Whether the branch was pushed

If no findings remain, say that explicitly and mention any residual risk or CI status.

## Workflow

### 1. Inspect PR metadata first

Run:

```bash
gh pr view <PR> --json number,title,body,author,baseRefName,headRefName,headRepository,headRepositoryOwner,isCrossRepository,mergeable,changedFiles,additions,deletions,url
gh pr diff <PR> --name-only
```

Capture:

- PR number
- base branch, expected to be `main`
- head branch
- head owner / repository
- whether this is a fork PR
- changed files

### 2. Create an isolated review worktree from `origin/main`

Never review directly in the main worktree.

Recommended pattern:

```bash
git fetch origin main
git worktree add /Users/jakevin/code/opencli-pr<PR>-review -b pr-<PR>-review origin/main
```

If the path already exists:

- Reuse it only if it is clearly dedicated to the same PR and clean
- Otherwise remove it first or create a new unique suffix

### 3. Fetch the PR branch into the worktree

Prefer avoiding local branch-name conflicts with the contributor branch.

1. Determine the git remote for the PR head repository.
2. If a matching remote already exists, use it.
3. Otherwise add a temporary remote:

```bash
git remote add <temp-remote> git@github.com:<owner>/<repo>.git
```

Then fetch and check out the PR head into the review branch:

```bash
git fetch <remote> <headRefName>
git checkout -B pr-<PR>-review FETCH_HEAD
```

Alternative fallback:

```bash
gh pr checkout <PR>
```

Use the git-fetch flow if `gh pr checkout` fails or collides with an existing local branch/worktree.

### 4. Check CI before doing local changes

Run:

```bash
gh pr checks <PR>
```

Interpretation:

- Green checks: continue
- Pending checks: continue, but mention it later
- Red checks: inspect whether the failure is related to the PR or a likely flaky existing test

If needed, inspect failed logs:

```bash
gh run view <RUN_ID> --job <JOB_ID> --log
```

### 5. Rebase onto `origin/main`

Inside the review worktree:

```bash
git fetch origin main
git rebase origin/main
```

If conflicts appear:

- Understand both sides before editing
- Prefer preserving both behaviors when compatible
- Continue with:

```bash
git add <resolved-files>
git rebase --continue
```

### 6. Understand and summarize the PR

Before giving findings or making edits, summarize:

- what user-facing behavior changed
- which files carry the main logic
- whether the PR is a bug fix, refactor, adapter change, or test-only change

Keep this concise, but concrete.

### 7. Review for real issues

Focus on:

- correctness bugs
- hidden behavior regressions
- `page.evaluate` / browser-context serialization issues
- missing tests for the actual execution path
- bad `rebase` fallout
- type or build regressions

Severity guide:

- `P0`: must fix before merge
- `P1`: should fix before merge
- `P2`: nice-to-have or follow-up

If the user asked to "review", findings come first.

### 8. Fix directly when the issue is clear

Unless the user explicitly wants review-only:

- fix `P0`
- fix `P1`
- fix easy `P2` if they meaningfully reduce risk

Use `apply_patch` for manual file edits.

### 9. Verify after edits

Run the smallest useful set first, then expand as needed:

```bash
npm run typecheck
npx vitest run <targeted-tests>
npm test
npm run build
```

For PRs touching adapters or browser logic, prefer at least:

- targeted tests for the changed area
- `npm run typecheck`
- `npm test` if reasonably fast

If a remote CI failure looked flaky, consider rerunning failed jobs:

```bash
gh run rerun <RUN_ID> --failed
gh run watch <RUN_ID> --exit-status
```

### 10. Push directly to the PR branch

If you rebased or edited the PR branch, push back to the contributor branch.

Use plain push when possible:

```bash
git push <remote> HEAD:<headRefName>
```

If you rebased or rewrote history:

```bash
git push --force-with-lease <remote> HEAD:<headRefName>
```

Be explicit about which remote and branch you are updating.

### 11. Final report structure

Use this structure:

```markdown
What it does
- <short summary>

Findings
- <P0/P1/P2 findings, or explicitly say no remaining findings>

What I changed
- <files or behaviors changed>

Verification
- <commands run and result>

Push status
- <which branch / remote was updated>
```

If there are no remaining code findings but CI is still red, say so clearly and do not describe it as merge-ready yet.

## Notes specific to opencli

- The main repo path is `~/code/opencli`
- Prefer review worktree names like `~/code/opencli-pr<PR>-review`
- Preserve unrelated worktrees
- Do not work directly on the user's main checkout if a worktree can avoid it
- When you finish, leave the review worktree in a predictable state unless the user asks to delete it

## Example triggers

- "review PR #437"
- "看一下这个 PR: https://github.com/jackwener/opencli/pull/437"
- "帮我 review 他的 PR，直接修了 push 上去"
- "基于 main 开个 worktree 看这个 PR"
