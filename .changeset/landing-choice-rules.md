---
'@theya/shadcn': minor
---

Landing pages, after the PlateCovery hero test:
- Hero: `titleSize="display"` (56 → 128 px in the theme's display face), `subtitle` (one large line) and `points` (two to four short benefits as a list).
- Hero and CtaBand `titleFont`: new values `theme` (the default, the theme's heading face) and `display-serif` (EB Garamond). Deprecated: `sans`, replace with `theme`; `serif`, replace with `display-serif`. The old values keep working and warn once in development.
- SiteHeader without `nav`: the actions take the end corner.
- `LANDING.md` / `LANDING.ru.md`, shipped in the package with `public/llms*.txt`: which block for which task, first-screen defaults, "not X for Y" rules. Stepper and OrbitCarousel guidelines name what to use instead on landings.
