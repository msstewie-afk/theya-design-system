---
'@theya/shadcn': patch
---

Toaster: the action / cancel buttons (Retry, Undo …) now render as designed — primary fill with `text-on-primary`, `radius-sm`, medium weight. Sonner's own `[data-button]` styles were winning, so the action showed as a near-black pill with a 4px radius and weight 500. The ghost action of `toast.progress` keeps its transparent fill.
