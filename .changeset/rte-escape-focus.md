---
'@theya/shadcn': patch
---

RichTextEditor: Escape in the link popover and the text-style menu puts focus back on the toolbar button that opened it (WAI-ARIA APG); it went to the text before. Applying a link or choosing a style still goes on in the text, and a link popover opened with ⌘K returns to the text on Escape.
