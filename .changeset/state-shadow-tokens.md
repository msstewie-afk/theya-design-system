---
'@theya/tokens': minor
'@theya/shadcn': minor
---

State shadow tokens (preparation for a Neumorphism theme). New semantic tokens `--shadow-control`, `--shadow-control-hover`, `--shadow-control-pressed`, `--shadow-field`, `--shadow-track`, `--shadow-thumb`, `--shadow-thumb-hover`, `--shadow-raised`, `--shadow-card`, `--shadow-card-hover`, with matching utilities (`shadow-control`, `shadow-field`, …). In the default theme they keep today's look: none for controls, fields and tracks; the same elevation step for thumbs, the Tabs chip pill and Card.

Button, Toggle, ToggleGroup, pressable Chip, Tabs, every text field and picker trigger, Checkbox, Radio, OptionCard, Switch, Slider and Card now take their shadows from these tokens. A state shadow is drawn in its own box-shadow slot, so it stacks with the focus ring instead of being replaced by it: a focused Slider thumb keeps its shadow, and a focused interactive Card still lifts on hover (the `not-focus-within` guard is gone). Documented on Foundations → Elevation.
