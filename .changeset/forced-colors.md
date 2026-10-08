---
"@theya/shadcn": minor
---

High contrast (Windows forced colors) support. The focus ring stays visible (it's an outline there, not a shadow), buttons, tabs, toggles and other fill-only controls get edges, selected / pressed / current states use the system highlight, and Switch, Slider, Progress, Meter and Radio draw their tracks, fills and dots with system colors. New `pnpm test-visual:forced` keeps visual baselines for this mode.
