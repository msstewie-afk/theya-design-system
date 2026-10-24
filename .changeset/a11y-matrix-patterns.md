---
'@theya/shadcn': patch
---

Accessibility matrix covers the 42 patterns. `pnpm a11y` builds a row per pattern the same way as for components (axe on every story, keyboard play tests, the browser checks from `a11y-auto`, motion and forced colors), with each pattern's code-read notes from `a11y/patterns-notes.json` counted as a manual review. Design System/Accessibility shows a "By pattern" table and a Patterns column per criterion, and each pattern's Docs page shows its status.

Found on the way:
- Cart: "Save for later" and "Move to cart" are now named "Save for later: Pro plan" / "Move to cart: Pro plan", so the visible label starts the accessible name (WCAG 2.5.3, voice control).
- Stepper: the step circle that repeats the step's label button for the mouse is marked `data-pointer-shortcut`, and `a11y-auto` no longer reports it as pointer-only. `a11y-auto` also skips a control that disabled itself while Tab moved through the page (Preferences' Scroll to bottom at the end of the page).
