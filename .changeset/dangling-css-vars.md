---
"@theya/shadcn": patch
---

Topbar: the search results panel now stops at the bottom of the viewport and scrolls. Its max height pointed at `--available-height`, which nothing sets, so the panel could run off-screen. `pnpm api:check` now fails on any `var(--…)` that nothing declares (`scripts/check-css-vars.mjs`).
