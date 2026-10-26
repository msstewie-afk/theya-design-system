---
'@theya/shadcn': patch
---

States that were shown by color alone now have a second cue (WCAG 1.4.1):
- Attachment / File: a selected file's edge doubles to 2px (no size shift). The click-only button carries `aria-current` when selected and there is no toggle, so File's selection reaches assistive tech.
- ListItem: selected rows get a 2px start-edge bar and a semibold title, like the active SidebarItem.
- DiffViewer: changed words are underlined (inserted) or struck through (deleted), not only tinted.
- Terminal: error and warning lines show a visible ✕ / ! glyph next to the screen-reader prefix.
