---
'@theya/tokens': minor
'@theya/shadcn': patch
---

Dark theme, second round:
- Popovers, menus, Command, HoverCard and other `bg-surface-overlay` surfaces are now a step lighter than the page (new `slate-650`, #303150) instead of darker (slate-900), so they read as raised. Tooltips and toasts stay dark.
- Field fill (`bg-input`) is `slate-900` instead of pure black.
- Text hierarchy is spread a little wider: `text-subtle` slate-050 → new `slate-030` (lighter), `text-subtler` slate-100 → new `slate-150` (dimmer), still at least 4.5:1 on hover fills and in menus.
- Filled buttons no longer sink into the page when pressed: each pressed step (and success hover) is half a ramp step instead of a full one. New primitives `blue-650`, `green-650`, `green-675`, `red-850`, `orange-850`, `cyan-650`, `graphite-650`, `slate-475`. White text contrast only goes up. Light theme unchanged.
