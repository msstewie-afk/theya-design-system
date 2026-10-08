---
"@theya/shadcn": minor
---

Tables on a phone no longer scroll sideways by default:
- Table and DataTable take `mobileLayout`: `stack` (default) turns each row into an item below 640px — the first / primary column as its title, the other columns as label/value pairs; `paged` keeps the table but shows the first column plus `columnsPerPage` (2) others at a time, with dots and a swipe to page through (for comparisons); `scroll` keeps the old sideways scroll.
- Table: labels come from the column headers by themselves; TableCell `label` rewords one, `label={false}` makes a full-width cell, `stackAction` pins a cell (a remove button) to the item's top end. New `stickyFirstColumn` freezes the first column while the table scrolls sideways. Stacked parts carry explicit table roles for screen readers. Layout lives in the new `styles/table.css`.
- DataTable: labels from the new `meta.label`, else a string `header`, else the column id. With `mobileLayout="scroll"`, `meta.pin` columns stay frozen on a phone too. Virtualized and infinite tables always stay tables.
- TeamMembers, AccessTokens, AuditLog and BillingUsage stack; BillingUsage's stats go one per row on a phone.
- ColorPicker: opacity moved to its own row under the RGB/HSL fields, which were too narrow for three digits four to a row.
- New strings in every locale: `table.columnPages`, `table.showColumns`.
