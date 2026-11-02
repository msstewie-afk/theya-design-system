---
'@theya/shadcn': patch
---

Progress, Slider and PasswordStrengthMeter fills use the icon color tokens (as Meter already does): the same colors in light, and in dark the fill now reaches 3:1 against its track (WCAG 1.4.11; the brand fill was 2.0:1, danger 1.36:1). PasswordStrengthMeter keeps the yellow warning fill in light, like Meter.
