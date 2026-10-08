---
'@theya/shadcn': patch
---

Accessibility: browser checks for WCAG 2.5.3, 2.4.7, 1.4.12 and 1.4.4 (`pnpm a11y:auto` against a running Storybook) feed the criteria matrix. Fixes they found:
- Toasts are Tab stops; they now show Theya's focus ring instead of Sonner's faint 2px one.
- PromptArea scrolls instead of clipping when text spacing grows after it has sized itself (1.4.12).
