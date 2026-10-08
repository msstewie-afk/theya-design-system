---
'@theya/shadcn': patch
---

Closing a Drawer (and PushSheet's phone overlay) returns focus to whatever opened it. vaul keeps the panel mounted through its exit animation and then dropped focus on `<body>` (WCAG 2.4.3) — with a DrawerTrigger and without one. Found by the new mobile play tests.
