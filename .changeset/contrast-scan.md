---
'@theya/shadcn': patch
---

New `pnpm a11y:contrast` (scripts/contrast-scan.mjs): measures the contrast of every visible text run in every story, light and dark, including text axe skips (aria-hidden counts, translucent backgrounds composited down to an opaque layer). First run's fixes:

- Card: a tone card's description is `text-subtle` in both themes (success was 4.39:1 in light).
- Dropzone: the success state's "Uploaded on" line is `text-success-on-tonal` (was 3.59:1 in dark).
