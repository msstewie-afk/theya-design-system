---
'@theya/shadcn': patch
---

Toaster: Theya's title, description, shadow and border styles now actually apply. Sonner's own unlayered stylesheet was beating Tailwind's utilities layer, so toasts rendered with Sonner's 15/22.5 weight-500 title, its own grey 13/18.2 description, Sonner's shadow and a 1px border on the dark surface. Now: title 15/20 semibold, description 13/16 `text-subtler` (`text-subtle-on-dark` on dark), elevation lg / xl, no border on dark.
