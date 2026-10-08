---
"@theya/tokens": minor
---

DTCG / Tokens Studio export now includes the themes and density spacing. New sets `brand-iris`, `brand-iris-light`, `brand-iris-dark` (and the same for `lime`) carry the re-hued ramps, typeface, weights, radii and the semantic colors that differ from the aliases; the Tokens Studio "theme" group gains `iris-light`, `iris-dark`, `lime-light`, `lime-dark`. `density-compact` / `density-comfortable` now carry padding, gap and margin too (same rule as the CSS, shared in `scripts/lib/density-spacing.mjs`). `scripts/check-dtcg.mjs` runs after the export and fails if any value resolved through the sets differs from the CSS build. Also fixes theme CSS: headings built from the extralight weight (heading-3xl) now get 200 in Iris and Lime, like the extralight token itself. See TOKENS-EXPORT.md.
