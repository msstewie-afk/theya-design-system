---
'@theya/tokens': patch
'@theya/shadcn': patch
---

Text contrast in hover states, dark theme (WCAG 1.4.3). Checked by hovering every interactive element in every story:
- Badge `neutral` and the Sidebar count badge use `text-subtle` instead of `text-subtler`; on a hovered row the stacked fills put them at 3.5–4.0:1. Light is a shade darker too, like Chip `neutral`.
- Card with a `tone`, or selected: the description uses `text-subtle` in dark (was 3.9:1 under a hovered child). Light unchanged.
- `text-link-on-tonal` (dark) blue-100 → blue-050: a primary Badge on a selected (primary-tinted) Card was 4.46:1, now 4.93:1.
