---
'@theya/shadcn': patch
---

Chip `asChild` no longer crashes: the child element becomes the chip and the leading icon is rendered inside it, before its own content (Slot used to receive the icon and the child as two children). New story "As link (asChild)".
