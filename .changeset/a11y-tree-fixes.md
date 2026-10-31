---
'@theya/shadcn': patch
---

Accessibility-tree fixes found by the new tree check (`pnpm a11y:tree`):

- Decorative icons are hidden from assistive tech where the component takes consumer content: the icon in Alert, ListItem's `leading` and `trailing`, TextField's `rightIcon`, DataTableCell's primary `leading` (a bare SVG without a name gets `aria-hidden`; controls and named images are left alone). Attachment and File type icons, the Tooltip arrow and UndoToast's default trash icon are hidden too. Chrome exposed each as an unnamed image ("graphic" in NVDA).
- ChartRangeSelection hides the Recharts plot from assistive tech; the group's name, help and live announcements carry the range.
- Select's listbox is named after its trigger (its aria-label or Label); Combobox's listbox gets the same name as its popover.
- TimeField without `onInvalidInput` keeps the reason it rejected a value attached to the field as its description while the field is invalid (it was only announced once).
