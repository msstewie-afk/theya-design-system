---
'@theya/tokens': patch
'@theya/shadcn': patch
---

Text contrast fixes found by `pnpm a11y:contrast` (WCAG 1.4.3):

- Light code palette: `color.code.comment` #a0aab4 → #63717e (2.18:1 → 4.63:1 on `code.bg`; also the line-number gutter) and `color.code.number` #b66a1a → #a25e17 (3.83:1 → 4.68:1), darkened in-hue like `code.tag` before. The dark palette already passed.
- WheelPicker: the dimmed rows are at 80% opacity (5.4:1), were 60% (3.25:1); the scale-down still sets them back.
