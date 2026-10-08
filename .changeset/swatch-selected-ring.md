---
'@theya/shadcn': patch
---

SwatchPicker: the selected swatch shows its ring again when tooltips are on (the default). The tooltip trigger replaced the item's `data-state`, so the ring never appeared; the style now reads `aria-checked` / `aria-pressed`.
