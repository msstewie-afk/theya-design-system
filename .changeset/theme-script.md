---
'@theya/shadcn': minor
---

New `ThemeScript` (`ui/theme-script`): an inline script for the document head that applies the remembered theme and density before the first paint, so a dark page no longer flashes light. `useTheme().setTheme` and `useDensity().setDensity` (ThemeToggle, DensityToggle) now remember the choice in localStorage. Avatar infers `type` from `src` / `initials` / `icon` when neither `type` nor children are given (`initials` alone used to render an empty circle), and an `iconOnly` Button renders an icon passed as children when there is no `leftIcon` (it used to render an empty button).
