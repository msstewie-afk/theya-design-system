---
'@theya/shadcn': minor
---

New `BottomNav` and `BottomNavItem`: the tab bar of a phone screen, 3–5 destinations, each an icon with a label (no icon-only variant). The current item gets `aria-current="page"`, a semibold label and a tonal pill behind the icon; `badge` puts a count ("99+" over 99) or a dot on the icon and adds it to the item's name ("Inbox, 3 new"). Pads for `safe-area-inset-bottom`, reserves its height as scroll padding, takes `href` or a router link via `asChild`. Strings are localized (en, ru, de, ar, zh).
