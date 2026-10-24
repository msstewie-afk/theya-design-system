---
'@theya/tokens': minor
---

Spacing tokens off the 4px grid, cleaned up. Removed, unused since the spacing pass: `size.margin.margin-3xs` (3px), `size.padding.padding-15xs` (6px), `size.padding.padding-s` (10px), `size.gap.gap-3xs` (3px), `size.gap.gap-s` (10px). Renamed `size.padding.padding2xl` to `size.padding.padding-2xl` (CSS `--size-padding-padding-2xl`), like every other step. `size.margin.margin-s` (10px) stays, documented as the one deliberate off-grid value: a field's chevron inset and a multiline field's vertical padding.
