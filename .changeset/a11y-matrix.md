---
"@theya/shadcn": patch
---

Accessibility matrix: every component's Docs page now ends its Accessibility section with a WCAG 2.2 AA status (axe coverage in both themes, keyboard play tests, reduced motion, high contrast, screen-reader passes, accepted deviations), and Design System / Accessibility shows the whole table with filters. Generated into `spec/a11y.json` by `pnpm a11y` from the tests and the code plus `a11y/manual.json`; `pnpm api:check` fails when it is stale. Carousel indicators no longer animate their width under reduced motion.
