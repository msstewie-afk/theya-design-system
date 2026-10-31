---
'@theya/tokens': minor
'@theya/shadcn': minor
---

Charts readable without relying on color, and in dark:
- `chart-01`…`chart-07` now have dark values: all seven series share one lightness, 3.6:1 on the page and 3.2:1 on cards (in dark they reused the light colors, 1.5–3:1). New primitives for them: `blue-450`, `magenta-350`, `teal-350`, `slate-375`, `red-250`, `green-450`, `purple-350`. The tokens moved from the theme-independent set to the light and dark semantic sets; their names don't change.
- `chart-07` is purple (`purple-500` light) instead of azure: at equal lightness azure was hard to tell from blue.
- **Breaking (primitives):** the `azure` ramp is removed; nothing else used it. Use `cyan` (the info color) or `blue` instead.
- LineChart and AreaChart (with `series`) give every series after the first its own dash, shown in the legend and tooltip too (`seriesPatterns`, default true).
- DonutChart: `slicePatterns` fills slices after the first with a pattern (lines, dots, grid), legend included. Off by default.
