---
'@theya/shadcn': minor
---

`TheyaLocaleProvider` takes `syncDocument`: it sets `lang` (and `dir`, when given) on `<html>` and restores the previous values on unmount, so screen readers pick the right voice.
