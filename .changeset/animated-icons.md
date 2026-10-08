---
'@theya/shadcn': minor
---

New `AnimatedIcon` (and named `CopyAnimated`, `BellAnimated`, `MenuAnimated`, … — 13 icons): iconoir geometry with CSS-only motion from the motion tokens. `trigger="hover"` plays when a button or link around it is hovered or keyboard-focused, `trigger="active"` switches to a second state (Copy → tick, Plus/Menu → ×, Eye → closed, Heart → filled), `trigger="loop"` for busy. prefers-reduced-motion: no motion, states still switch. CopyButton now uses `CopyAnimated`; DataTable's "loading more" uses `RefreshAnimated`.
