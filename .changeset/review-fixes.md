---
"@theya/shadcn": patch
---

Review fixes.

- ToggleGroupItem: its own `appearance` / `size` now win over the group's; items without them follow the group as before.
- FilterField: operator words in chips and the value field's label ("Contains", "Is missing", …) now come from the locale dictionary, matching the operator menu.
- ListView: the seeded Status column's loading skeleton is a status dot and word instead of a badge pill.
- Tree: type-ahead resets after 500ms instead of 600ms, in line with WAI-ARIA practice.
