---
'@theya/shadcn': minor
---

OrbitCarousel and CardStack: the cards behind the front one are inert on React 19 too. React 19 treats `inert` as a boolean and dropped the `inert=""` these components set, so the back cards stayed focusable and were checked by axe (the cause of the failing React 19 CI job). New `lib/inert` helper (`inertProps`) sets the right value for React 18 and 19.
