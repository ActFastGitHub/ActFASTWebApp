# Git Fallback Guide for Codex Changes

This guide is a simple safety workflow for letting Codex edit project files directly while keeping an easy way to undo the work.

For this project, `ActFASTWebApp`, this is the default workflow Codex should follow when making project changes:

- use a `codex/*` branch for direct file edits whenever possible
- show the changed files before commit
- do not commit unless asked
- merge back into `main` only after approval
- log meaningful updates and reversals in [CODEX_CHANGE_LOG.md](D:/ActFast/ActFASTWebApp/docs/CODEX_CHANGE_LOG.md)

## The Main Idea

Think of Git as your project undo system.

Before Codex changes files, use a separate branch. This branch is like a temporary testing copy of your project.

```text
main branch
  = your real project

codex/some-change branch
  = a temporary place where Codex can safely edit files
```

If you like the result, commit the Codex branch, merge it back into `main`, then push.

If you do not like the result, switch back to `main` and delete the Codex branch.

Recommended flow:

```bash
git status
git checkout main
git checkout -b codex/short-description-of-change
```

Then let Codex make the changes.

Afterward:

```bash
git diff
```

If everything looks good:

```bash
git add .
git commit -m "Describe the change"
git checkout main
git merge codex/short-description-of-change
git push
```

If you do not like the changes:

```bash
git checkout main
git branch -D codex/short-description-of-change
```

## Step 1: Check Where You Are

Run:

```bash
git status
```

This tells you:

- what branch you are on
- what files are changed
- whether anything is staged for commit

If you see changes you made yourself, tell Codex before asking it to edit the same files.

## Step 2: Make a Safety Branch

Before Codex starts a task, create a branch:

```bash
git checkout main
git checkout -b codex/seo-metadata-improvements
```

Use a short name that explains the work:

```bash
git checkout -b codex/fix-login-page
git checkout -b codex/update-homepage-copy
git checkout -b codex/add-seo-tags
```

This keeps Codex work separate from your main branch.

While you are on this branch, Codex edits the real files in your project folder. The difference is that those edits belong to the temporary branch, not to `main`.

## Step 3: Let Codex Make the Change

Ask Codex to make the update.

Good example:

```text
Please add page-specific SEO metadata for the public website pages.
Before editing, check git status. After editing, show me what changed.
```

Codex should:

- check the existing files
- make focused edits
- avoid unrelated changes
- run tests or checks if appropriate
- summarize the changed files

## Step 4: Review the Changes

To see changed files:

```bash
git status
```

To see exact code changes:

```bash
git diff
```

You can also ask Codex:

```text
Show me a simple summary of the git diff.
```

## Step 5A: Keep the Changes

If you like the result:

```bash
git add .
git commit -m "Improve SEO metadata for public pages"
```

After this, the change is saved as a Git checkpoint.

Then merge it into your real project branch:

```bash
git checkout main
git merge codex/seo-metadata-improvements
git push
```

This is the part you remembered from school: `git merge` brings the finished branch changes into `main`.

## Step 5B: Reject the Whole Codex Branch

If you do not like the Codex changes and they are on their own branch, switch back to `main`:

```bash
git checkout main
```

Then delete the Codex branch:

```bash
git branch -D codex/seo-metadata-improvements
```

This abandons the Codex work. Your `main` branch never receives those changes.

## Step 5C: Undo Uncommitted Changes

If Codex made changes and you have not committed them yet, undo all uncommitted edits with:

```bash
git restore .
```

Undo one file only:

```bash
git restore app/layout.tsx
```

Important: `git restore .` removes all uncommitted changes in the current folder. Only use it when you are sure those changes are not needed.

If you are already using a separate Codex branch, deleting the branch is usually the cleaner fallback. `git restore .` is useful when you want to stay on the current branch but undo the latest uncommitted edits.

## If Your Project Uses `master` Instead of `main`

Some projects use `master` as the main branch name.

If `git checkout main` does not work, use:

```bash
git checkout master
```

Then merge into `master` instead:

```bash
git merge codex/seo-metadata-improvements
git push
```

## If Changes Were Already Committed

If you committed a change but want to undo it, the safest method is usually:

```bash
git revert HEAD
```

This creates a new commit that reverses the last commit.

To revert a specific commit:

```bash
git log --oneline
git revert COMMIT_ID
```

This is safer than rewriting history.

## Commands to Be Careful With

Avoid these unless you are very sure:

```bash
git reset --hard
git clean -fd
git checkout -- .
```

These can permanently remove local work if used at the wrong time.

Codex should not run destructive Git commands unless you explicitly ask.

## Fixing Dubious Ownership

Sometimes Git may show this error when Codex runs inside a different Windows user:

```text
fatal: detected dubious ownership in repository
```

Git is protecting the repository because the folder owner and the current process user are different.

If you trust this project folder, you can allow it with:

```bash
git config --global --add safe.directory D:/ActFast/ActFASTWebApp
```

After that, `git status` should work normally for Codex in this project.

## Best Prompt to Use Before Codex Edits

Use this when you want maximum safety:

```text
Before editing, check git status and tell me what branch we are on.
Create or use a codex/* branch if needed.
Make the smallest focused change.
After editing, show me the changed files and explain how I can merge or reject the branch.
Do not commit unless I ask.
```

## Quick Cheat Sheet

Check status:

```bash
git status
```

Create safety branch:

```bash
git checkout main
git checkout -b codex/my-change
```

See exact changes:

```bash
git diff
```

Undo uncommitted changes:

```bash
git restore .
```

Commit approved changes:

```bash
git add .
git commit -m "Describe the change"
```

Merge approved branch into main:

```bash
git checkout main
git merge codex/my-change
git push
```

Reject branch:

```bash
git checkout main
git branch -D codex/my-change
```

Undo last committed change safely:

```bash
git revert HEAD
```
