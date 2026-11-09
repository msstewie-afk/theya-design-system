---
'@theya/shadcn': patch
---

Button: new `opticalIcon` prop. A `leftIcon` / `rightIcon` is pulled toward the button's edge by the empty space around its drawing (measured per icon, stroke included), so a chevron or arrow no longer makes one side look more padded: NavArrowRight in a 24px box moves 8.5px, ArrowRight 1.5px. Icon-only buttons stay centred. Replaces app-side `-me-2` / `-ms-2` on the icon.
