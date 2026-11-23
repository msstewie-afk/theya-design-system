---
'@theya/tokens': patch
'@theya/shadcn': patch
---

Gradient themes, contrast (a11y scan 23.11):
- Dusk, Lagoon, Ochre: `text-subtler` and `text-subtler-on-tonal` a step darker in light (and Lagoon's lighter in dark) — secondary text on a selected fill (OptionCard, Tabs, MegaMenu) now passes 4.5:1 (was 4.06–4.46).
- Gradient canvas: secondary text and icons on the canvas take the full ink (white 86% failed on the lightest points); every gradient theme writes its whole ink, glass and pill set, so a theme nested in another one keeps its own; a theme without a gradient falls back to its flat primary with its on-primary ink and outline-only glass.
- ToggleGroup on the canvas (the pricing period switch): glass when off, the filled-button pill when on.
