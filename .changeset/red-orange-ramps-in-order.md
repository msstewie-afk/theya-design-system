---
'@theya/tokens': minor
'@theya/shadcn': patch
---

**Breaking (primitives):** the `red` and `orange` ramps now get darker step by step, like every other ramp. Before, 700–900 were a separate, later set: `red-700` was lighter than `red-500` and `red-600`, `orange-700` lighter than `orange-600`. Semantic tokens point at the new steps, and every semantic token keeps its color, except `red-500` (#82052f) and the old `red-800` (#8A0B32) are merged into the new `red-600` (#8A0B32, ΔE 2), so the light `text-danger`, `bg-danger-hover`, `border-danger-hover` and `chart-05` are a hair lighter.

If you use red or orange primitives directly, rename them:

| Was | Now |
|---|---|
| `red-500` (#82052f) | `red-600` (#8A0B32) |
| `red-600` | `red-800` |
| `red-700` | `red-500` |
| `red-800` | `red-600` |
| `red-850` | `red-700` |
| `red-900` (#5C0F27) | removed; `red-900` is now #400216 |
| `orange-500` (#b44b00), `orange-600` (#8e2f00) | removed (unused) |
| `orange-700` | `orange-500` |
| `orange-800` | `orange-600` |
| `orange-850` | `orange-700` |
| `orange-900` | `orange-800`; `orange-900` is now #3e1c06 |
