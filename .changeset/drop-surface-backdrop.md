---
'@theya/tokens': minor
---

Removed `bg-surface-backdrop` (`--color-bg-surface-bg-surface-backdrop`). Nothing used it, and its values disagreed between themes (70% light, 10% dark). For a dimmed backdrop behind a dialog or drawer use `bg-scrim`, as the components do.
