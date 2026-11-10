---
'@theya/tokens': patch
'@theya/shadcn': patch
---

Page surface (T14). New tokens `bg-surface-page`, `bg-surface-sunken-on-page` and `bg-neutral-subtle-on-page`; `bg-surface-page` follows a theme's `bg-surface-base` unless the theme sets it. Ember tints it warm (light #f7f4f1, dark #191512). `data-surface="page"` on a page wrapper paints it and moves the fills lying on it (Tabs chips track; Progress track, Skeleton) a step off the page; inside a Card, which now sets `data-surface="card"`, they are the theme's own. Muted chip text on a page track goes to text-subtle for contrast.
