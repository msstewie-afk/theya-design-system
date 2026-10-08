---
"@theya/tokens": minor
---

W3C Design Tokens (DTCG 2025.10) export: `npm run build` now also writes `build/dtcg/*.tokens.json` (primitive, base, shared / light / dark colors, density modes, with aliases kept and `$type` on every token) and `build/tokens-studio/` (the same sets with string values plus `$metadata.json` and `$themes.json`), so Figma Variables, Tokens Studio and other platforms read the same source as the CSS. The build fails on an alias that does not resolve, points at another type, or loops. `--color-brand-brand` was emitted as `[object Object]`; it is now `#384859`.
