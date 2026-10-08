---
"@theya/tokens": minor
"@theya/shadcn": minor
---

Elevation tuned (from the light-and-shadow study): light shadows are tinted toward slate-900 instead of neutral ink, and lg / xl get a 1px ambient layer because they float. Dark theme gets its own set — black at 0.32–0.6 with a faint light rim on lg / xl — where it used to reuse the light values and the shadows all but disappeared. New `--elevation-edge-up` / `shadow-elevation-edge-up` for panels pinned to the bottom edge; the bottom Drawer uses it, so its shadow falls on the page instead of past the screen edge. Values moved to `src/code/elevation.json` and `elevation.dark.json`; the DTCG export carries them in the color-light / color-dark sets.
