---
"@theya/tokens": minor
"@theya/shadcn": minor
---

Density modes: `data-density="compact" | "comfortable"` on `<html>` or on any container resizes controls one step along the size-control ramp (md…4xl), Table / DataTable rows (36/44/52px, two-line 48/56/64px) and menu, Select and Command items (4/8/12px vertical padding). Defined in `packages/tokens/src/density/*.json`, built into `build/css/density.css` and imported by `globals.css`. New `DensityToggle` (localized compact / default / comfortable switch, page-wide or controlled for one region) and `useDensity()`. Storybook has a Density toolbar switch. Default sizes are unchanged.
