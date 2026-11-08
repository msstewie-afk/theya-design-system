---
'@theya/shadcn': patch
---

ChipRemove is a 24px target around a 14px icon, as its docs say (it was the Button's 28px square with a 12px icon). A removable chip is 6px narrower and matches Figma: label, 4px gap, icon, padding. An interactive chip's own target now covers its border too, so it keeps the full 24px height next to the remove button.
