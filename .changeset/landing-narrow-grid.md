---
'@theya/shadcn': patch
---

StickySteps and FeatureShowcase no longer spill past the screen on phones in comfortable density: their single column is `minmax(0,1fr)`, so a wide step visual cannot stretch it. The folders demo truncates long names and shortens its rule chip on phones.
