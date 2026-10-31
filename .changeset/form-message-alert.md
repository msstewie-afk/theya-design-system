---
'@theya/shadcn': patch
---

- FormMessage: an error is now `role="alert"` with the error icon, like FieldError, so it is spoken when it appears as you leave a field (WCAG 4.1.3) and doesn't rest on red alone. Found by the VoiceOver dry run.
- ChartRangeSelection: the wrapped chart's Recharts accessibility layer is turned off, so the selector is one tab stop; the inner `svg role="application"` was a second, unnamed one with different arrow keys.
