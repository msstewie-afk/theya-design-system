---
'@theya/shadcn': patch
---

Code text renders one pixel smaller than the text around it (font-size-adjust on font-mono / font-code and Prose code): 14px in 15px body text, scaled the same way at every other size. Tune it with --font-code-adjust.
