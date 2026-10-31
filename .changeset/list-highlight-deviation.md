---
"@theya/shadcn": patch
---

Focus visibility in menus:
- MenubarTrigger now shows the focus ring on keyboard focus (it had none).
- NavigationMenuLink now shows the focus ring on keyboard focus, not just a fill.
- The highlighted option fill in Select, Combobox, Autocomplete, Command, FilterField, Menubar, DropdownMenu and ContextMenu (1.15:1 light / 1.35:1 dark) is recorded as an accepted WCAG 1.4.11 deviation, alongside the focus-ring deviation.
