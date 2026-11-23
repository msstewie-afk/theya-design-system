---
'@theya/shadcn': patch
'@theya/tokens': patch
---

Accessibility (WCAG 1.4.11) in every theme: field, checkbox and radio borders reach 3:1 in the light variant of every product theme (Iris, Lime, Ember, Dusk, Lagoon, Ochre); checked Checkbox and Switch carry the primary edge in every theme (Lime's pale fill was 1.47:1), and the checked Switch thumb an on-primary edge; Checkbox styles its states from aria-checked, so a Tooltip around it no longer makes it look unchecked (DataTableToolbar's indeterminate select-all); SavedItems' select-all bar sits on the surface.
