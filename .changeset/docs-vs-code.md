---
'@theya/shadcn': patch
---

Rating and NumberField read their spring easing from the `--motion-easing-spring` token instead of a copied cubic-bezier, so a theme that changes the spring now reaches them too. Docs brought in line with the code: Foundations / Focus ring (every ring is 4px; the inset ring is `focus-ring-inset`, used by Tree rows and underline Tabs), Foundations / Elevation (Card, Switch and Slider thumbs, the Tabs chip take their shadows through the state tokens), README component count, TESTING (what `pnpm api:check` checks).
