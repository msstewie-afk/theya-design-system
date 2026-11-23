---
'@theya/tokens': minor
'@theya/shadcn': minor
---

Landing motion, after the PlateCovery hero test:
- Tokens: `motion.duration.journey` (1600ms, an object travelling a long path), `motion.duration.ambient` (16s, one loop of a breathing ground) and `motion.easing.travel` (even start and stop). Landing only, never for UI feedback. CSS: `--transition-duration-journey`, `--transition-duration-ambient`, `--ease-travel`.
- AmbientBlobs: soft shapes behind a landing ground that slowly change outline and breathe, out of step; `paused` for the page's pause control (WCAG 2.2.2); still with reduced motion.
- ArcStage: one picture at a time on an invisible quarter arc around a corner — the next comes in past the top and turns as it travels (journey duration, travel curve), the last leaves past the side; controlled `index` or `autoplay` with `paused`, stops on a hidden tab and with reduced motion (then a cross-fade in place); sizes from the stage's width.
