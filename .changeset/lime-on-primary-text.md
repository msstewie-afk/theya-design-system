---
'@theya/tokens': patch
---

Lime theme, found by the new per-theme axe run:
- Text and borders on the lime fill (a filled Card, the DataTable bulk bar) now come from the dark ink, not white: `text-subtle-on-primary`, `border-on-primary` and `focus-ring-on-primary` are the ink at 80%, 60% and 30% over the fill, the same weights as Theya's white ones. The card description was 1.4:1, now 5.7:1. Every theme with dark text on its primary fill gets the same, and the build checks `text-subtle-on-primary` at 4.5:1.
- Dark `text-subtler`: #a0a3a0 → #acafac. Secondary text on a highlighted Command item was 4.0:1, now 4.6:1.
