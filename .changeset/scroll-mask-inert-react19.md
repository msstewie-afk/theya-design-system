---
'@theya/shadcn': patch
---

ScrollMaskReveal: the hidden text sets `inert` through `inertProps`, so it type-checks and stays inert on React 19 (a bare `inert=""` is dropped there as falsy).
