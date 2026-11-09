---
'@theya/shadcn': patch
---

ListItem: new `align` prop (`start` | `center`, default `start`). `align="center"` puts the text on the middle of a tall leading visual (a 48px thumbnail, a large avatar), level with the trailing chevron; `start` keeps a small icon level with the title line. Replaces app-side `[&_[data-slot=list-item-content]]:self-center`.
