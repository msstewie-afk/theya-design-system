---
'@theya/shadcn': minor
---

Built-in labels say what they act on (WCAG 2.4.6), so several of the same control on a page stay distinct:

- NumberField steppers: "Decrease/Increase {label}" when the field has an aria-label.
- TextField and Autocomplete clear buttons: "Clear {label}".
- Sidebar item actions: "More actions for {item}"; new `actionsLabel` prop on SidebarItem.
- DataTable row menu: "Actions for {row}" when `getRowLabel` is set.
- CopyButton: new `subject` prop ("Copy API key" for assistive tech; the visible label stays "Copy").
- ColorField: "Choose color for {label}", and the picker popover is named by the label.
- Dropzone: the picker button is named "Choose files"; the status line describes it.
- ConfirmDialog: a neutral confirm defaults to "Confirm"; "Delete" stays for `tone="danger"`.
- Alert: "Dismiss alert". DataTableCell: "{n} items" instead of "{n} badges". Sparkline: the default name adds the range.

New locale keys in all five languages: `numberField.decrementFor/incrementFor`, `textField.clearFor`, `sidebar.moreActionsFor`, `copyButton.copyFor`, `confirmDialog.confirmNeutral`, `dataTable.rowActionsFor`, `dropzone.choose`, `colorPicker.openFor`, `chart.spark`. The Storybook test scripts allow 30 s per story (the accessibility matrix needs more than 15 s under load).
