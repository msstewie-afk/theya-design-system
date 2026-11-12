---
'@theya/shadcn': patch
---

Focus after a keyboard close, found by the new keyboard-model check:

- DataTable row menu and row context menu: closing with Escape (or choosing an item with Enter) puts focus back on the trigger; it fell to the page before. A pointer close still leaves focus where the pointer went.
- FilterField: Escape (or applying a filter) leaves focus in the field's input instead of moving it to the "Add filter" button.
