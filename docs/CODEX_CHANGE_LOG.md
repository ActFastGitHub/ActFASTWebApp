# Codex Change Log

This file tracks meaningful Codex-assisted changes to the ActFASTWebApp project.

Use it for:

- project updates made by Codex
- files changed during those updates
- test/build checks that were run
- commits or branches created
- reversals, rejected changes, or restored files

Small investigation-only conversations do not need an entry unless they lead to a project decision.

## Entry Template

```text
## YYYY-MM-DD - Short update title

Branch:
- codex/example-branch

Status:
- Planned, in progress, completed, reverted, or rejected

Changed files:
- path/to/file

Summary:
- What changed and why.

Verification:
- Commands or manual checks used.

Reversal notes:
- How this can be undone, or what was reverted.
```

## 2026-06-01 - Added Codex Git Safety Workflow

Branch:
- Not created because Git status was blocked by the repository ownership warning in the Codex sandbox.

Status:
- Completed

Changed files:
- docs/GIT_FALLBACK_GUIDE.md
- docs/CODEX_CHANGE_LOG.md

Summary:
- Added a beginner-friendly Git fallback guide for direct Codex edits.
- Updated the guide to define the default ActFASTWebApp workflow: use `codex/*` branches, review changes, commit only after approval, merge approved work into `main`, and reject unwanted branches safely.
- Added this change log as the running tracker for future Codex updates and reversals.

Verification:
- Read back the updated guide after editing.
- Confirmed the `docs` folder contains the new guide.

Reversal notes:
- To undo this documentation update before committing, restore the changed docs files.
- If this update is committed later, revert the commit with `git revert`.
