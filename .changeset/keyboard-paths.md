---
'@theya/shadcn': patch
---

Keyboard paths, found while adding keyboard play tests to every interactive component:
- TopbarSearch: the results can now be reached from the keyboard. ArrowDown in the field moves focus to the first result, ArrowUp / ArrowDown / Home / End move between results and ArrowUp from the first one goes back; Escape or picking a result returns focus to the field. A result is any `role="option"` (with `tabIndex={-1}` and an Enter handler), `button` or link inside `children`. The field also gets `aria-label` from its placeholder, so it keeps a name once text is typed, and the ⌘K hint hides while the field has focus (it fell under 4.5:1 on the focused field in dark).
- MessagePopup: the panel is named by its title and described by its description (it was named by the launcher button, "Open assistant").
