---
"@theya/tokens": minor
"@theya/shadcn": patch
---

The code syntax palette (Luna Pro) is now tokens instead of hand-written CSS in globals.css: `color.code.{bg,text,tag,attribute,string,number,selector,comment,invalid}` (Light in the default theme, Midnight in dark) and the fixed `color.code.*-inverse` set plus `code.border-inverse` in `src/code/color.json`. CSS variable names and values are unchanged (`--color-code-*`); the palette now also reaches the DTCG export and Figma (`code/…` in the semantic collection).
