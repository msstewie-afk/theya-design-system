---
'@theya/shadcn': minor
---

Demo cards in Motion and Landing examples use bright flat fills instead of photos: eight primitive hues at step 500 with white text (new `lib/fill-hues`: `FILL_HUES`, `fillHueAt`), ordered so neighbours never blend. No shadows, darkening or gradients on them. ExpandingPanels gains `tone` (one of those hues) for a panel without a picture. `DEMO_FILLS` and `DemoMesh` (a light mesh background) for landing demos.
