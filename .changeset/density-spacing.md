---
"@theya/tokens": minor
"@theya/shadcn": minor
---

Density now scales spacing. In compact and comfortable, padding, gap and margin above 8px shrink or grow by 40% of the excess, rounded to 2px (16 → 12 / 20, 24 → 18 / 30); 8px and below stay put. Covers numeric Tailwind `p-*`, `m-*`, `gap-*` utilities (incl. logical sides) and the `--size-padding-*`, `--size-gap-*`, `--size-margin-*` tokens. Default is unchanged. New token: `--size-density-density-space-delta`.
