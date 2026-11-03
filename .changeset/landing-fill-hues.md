---
'@theya/shadcn': minor
---

Demo cards in Motion and Landing examples no longer use photos. Cards in motion take soft tonal fills (new `lib/tonal-fills`: `TONAL_ORDER`, `tonalFill`, `tonalFillAt`), the tints LandingCard already used, now with a translucent border in their own hue instead of a shadow; template cards show a light mesh on top and the text on a plain plate (`DemoMesh`). ExpandingPanels gains `tone` (a tonal hue) for a panel without a picture.
