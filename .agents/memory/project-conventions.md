---
type: project
created: 2026-05-25
updated: 2026-07-12
---

# Project Conventions

## Git Workflow
- Always create a new dedicated branch for major code changes.
- Branch name format should follow: `feature/[task-slug]` or `fix/[bug-slug]`.

## Supported AI platforms (AG Kit)
- AG Kit **only supports Gemini CLI and Google Antigravity**.
- Do not claim compatibility with Claude Code, Cursor, Copilot, Windsurf, or other assistants unless the user explicitly expands scope.
- Copy on the website, docs, FAQ, README, and marketing should describe AG Kit as a toolkit for Gemini CLI / Antigravity-style agent setups.

## Automatic Semantic Versioning Protocol (HQs Collections)
- Current version starts at `1.0.1`.
- The assistant is solely responsible for auto-controlling the 3-digit SemVer (`MAJOR.MINOR.PATCH`) on every future user interaction:
  - **MAJOR (x.0.0):** Breaking changes, paradigm shifts, complete architectural redesigns.
  - **MINOR (1.x.0):** Additions, new features, significant capability changes (acréscimos, novas funcionalidades, mudanças estruturais).
  - **PATCH (1.0.x):** Bug fixes, corrections, adjustments, minor tweaks or verifications (correções, ajustes visuais, verificações).
- Canonical version is stored in `frontend/src/version.js` (`APP_VERSION`, `APP_NAME = 'HQs Collections'`) and synchronized with `frontend/package.json`.
- The version badge is prominently displayed next to the system title in the application header.
