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

## 2026-07-08 - Added Compliance Pages and Cookie Notice

Branch:
- Not created because Git status was blocked by the repository ownership warning in the Codex sandbox.

Status:
- Completed

Changed files:
- app/components/CookieConsent.tsx
- app/components/legal/LegalPageShell.tsx
- app/layout.tsx
- app/components/footer.tsx
- app/(site)/privacypolicy/page.tsx
- app/(site)/cookiepolicy/page.tsx
- app/(site)/termsofuse/page.tsx
- app/(site)/delete-my-data/page.tsx
- docs/CODEX_CHANGE_LOG.md
- public/sitemap.xml
- public/sitemap-0.xml
- version.json

Summary:
- Added a site-wide cookie notice for necessary cookies and browser storage.
- Updated the Privacy Policy to match the actual site code, including employee portal cookies, NextAuth, contact form email handling, local storage, social login, YouTube embeds, Google Places testimonials, Dropbox, and Cloudinary.
- Added Cookie Policy and Terms of Use pages using the existing legal-page visual style.
- Updated footer links so visitors can reach the compliance pages.
- Corrected the Data Deletion page so it no longer claims a self-service privacy settings flow that was not found in the current app.

Verification:
- `npx prettier --check app\components\CookieConsent.tsx app\components\legal\LegalPageShell.tsx app\components\footer.tsx app\layout.tsx app\(site)\privacypolicy\page.tsx app\(site)\cookiepolicy\page.tsx app\(site)\termsofuse\page.tsx app\(site)\delete-my-data\page.tsx`
- `npx tsc --noEmit`
- `npm run build` succeeded after rerunning with network access for the existing Prisma-backed prerender route.
- Local smoke test returned 200 for `/`, `/privacypolicy`, `/cookiepolicy`, `/termsofuse`, and `/delete-my-data`.

Reversal notes:
- To undo before committing, restore the files listed above.
- If committed later, revert the commit with `git revert`.
