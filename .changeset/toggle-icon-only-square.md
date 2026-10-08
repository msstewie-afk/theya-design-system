---
'@theya/shadcn': minor
---

Toggle and ToggleGroupItem: icon-only controls are now square at every size. The side padding used to win over `min-w`, so `sm` rendered 36×32 and outlined `md` 42×40. Icon-only content is detected automatically (a single icon child); the new `iconOnly` prop overrides the detection. Toggles with a text label are unchanged.
