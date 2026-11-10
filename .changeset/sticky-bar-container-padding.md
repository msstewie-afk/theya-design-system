---
'@theya/shadcn': patch
---

StickyActionBar: side padding and divider inset follow the bar's own width (16px, 24px from 30rem) instead of the window, so a bar in a phone frame or narrow panel keeps 16px. New `--sticky-action-bar-padding-inline` CSS variable sets both to match the page.
