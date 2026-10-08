---
"@theya/shadcn": minor
"@theya/tokens": minor
---

Motion presets for landing pages (new Storybook category "Motion"), ported from Kinetics (MIT, kinetics.colorion.co) onto Theya's motion tokens, no animation library:
- `Reveal` / `RevealGroup` — content eases in when it scrolls into view (`rise`, `fade`, `scale`, `blur`), groups one child after another.
- `CountUp` — a headline number counts up in view; screen readers get the final value.
- `Marquee` — an endless logo / quote strip; pauses on hover, focus and its own pause button (WCAG 2.2.2); the duplicate copy is hidden and inert.
- `TextEffect` — `split`, `scramble`, `shimmer`, `typewriter` headline effects; the plain text is always there for screen readers.
- `SurfaceEffect` — `spotlight`, `beam`, `tilt`, `shine`, `lift` on cards; `Aurora` — a drifting brand-color field behind a hero.
- `useInView` / `useReducedMotion` hooks. Everything is still under prefers-reduced-motion.
- Tokens: `motion.duration.slower` (450ms, `duration-slower`) and `motion.easing.glide` (`cubic-bezier(0.16, 1, 0.3, 1)`, `ease-glide`) — for landing entrances only.
- New strings in every locale: `marquee.pause`, `marquee.play`.
