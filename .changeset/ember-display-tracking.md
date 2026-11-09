---
'@theya/tokens': patch
'@theya/shadcn': patch
---

Ember: `text-display-s` letter-spacing is +0.4px (was Theya's −1px), so Playfair Display at 40px extrabold no longer touches its letters ("Ricotta", "Soufflé"). New profile option `typography` sets a theme's own typography token values after the fonts. Ember's heading-* steps keep 0px: checked at 24–32px, nothing touches.
