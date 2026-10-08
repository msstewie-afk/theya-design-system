---
"@theya/shadcn": minor
---

Remove props that were accepted but had no effect.

- DataTableCell (`kind="number"`): `format` is removed; it was never applied to the field.
- MaskedInput: `separate` is removed (also from `MaskedInputModifyResult`); it never changed how deleting works.
