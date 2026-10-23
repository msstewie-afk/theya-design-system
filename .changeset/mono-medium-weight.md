---
'@theya/shadcn': patch
---

Fira Code labels set in medium (CodeBlock / CodeEditor / DiffViewer filename, Terminal user@host, mono DataTableCell primary value) now render Fira's Medium face. Theya's `font-medium` is 375, below Fira Code's lightest loaded face, so the browser drew them at 400 and the bundled 500 face was never used. New `font-code-medium` utility.
