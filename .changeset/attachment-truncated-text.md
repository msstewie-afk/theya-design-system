---
'@theya/shadcn': patch
---

Attachment (and File through it): a cut file name or meta line ("801 KB, PNG image") shows the whole text in a tooltip, via TruncatedText. The tooltip opens on keyboard focus of the row's link or click button; a static row with no control makes the cut text a tab stop. TruncatedText gains `side` and finds a control beside the text (`data-truncate-owner` inside a `data-truncate-scope`), not only one around it.
