---
"@theya/tokens": patch
"@theya/shadcn": patch
---

`typography.font-family.code` is now `'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace` (was `Inconsolata`, which nothing rendered: globals.css put Fira Code in front of it). `--font-code` and `--font-mono` read the token directly, so code, Figma's `font-family/code` variable and the DTCG export name the same family.
