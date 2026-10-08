---
'@theya/shadcn': patch
---

Dialog, AlertDialog and Alert descriptions, Message bubbles, Terminal output and the Preferences block use a fixed 20px line height (`--size-size20`) instead of `leading-relaxed` (1.625), matching the Figma library. Text in these places sits a little tighter.
