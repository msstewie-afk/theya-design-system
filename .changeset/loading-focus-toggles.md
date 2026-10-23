---
'@theya/shadcn': patch
---

Accessibility follow-ups:
- Button: `loading` now blocks the button like `softDisabled` (aria-disabled, presses ignored) instead of native `disabled`, so a focused button keeps focus while the action runs (WCAG 2.4.3). Its look is unchanged. Tests that checked a loading button with `toBeDisabled()` should check `aria-disabled="true"` instead.
- OrbitCarousel, CardStack, TickerList, MarqueeColumns: the Pause / Play button no longer sets `aria-pressed` — its name already changes, and both together read as “Play, pressed”.
- FacetedList: a value ticked past the first five stays in place while you're in that facet, so unticking it doesn't hide it and drop focus.
