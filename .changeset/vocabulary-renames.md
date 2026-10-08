---
"@theya/shadcn": minor
---

Prop and type names now follow Theya's vocabulary (`tone` for color/meaning, `neutral` instead of `default`, size steps for spacing). Rendered output is unchanged, apart from Card's `data-tone` and DialogContent's `data-gap` values.

- Card: `severity` → `tone`, value `default` → `neutral` (still the default)
- Card: type `CardSeverity` → `CardTone`
- Card: data attribute `data-severity` → `data-tone`
- ListView: row action `destructive: true` → `tone: 'danger'` (`ListRowAction.tone` is `'neutral' | 'danger'`, default `neutral`)
- AuditLog: category option `badge` → `tone` (`AuditCategoryMeta`)
- BillingUsage: plan option `badge` → `tone` (`BillingPlan`)
- TeamMembers: role option `badge` → `tone` (`TeamRoleOption`)
- DataTableToolbar: bulk action `destructive: true` → `tone: 'danger'` (`DataTableBulkAction.tone` is now `'neutral' | 'danger'`, default `neutral`; the old `tone` field took any Button tone but never changed what was shown, so it is replaced)
- SelectItem: status-dot prop `status` → `tone` (same values)
- Combobox: `showTrigger` → `showChevron`
- Combobox: `triggerLabel` → `chevronLabel`
- FilterField: `searchTipLabel` → `searchLabel`
- ToolbarGroup: `appearance` → `type` (`'single' | 'multiple'`, default `multiple`)
- AlertDialog, AlertDialogHeader, AlertDialogFooter, ConfirmDialog: `gap` / `contentGap` value `default` → `md`
- AlertDialog, AlertDialogHeader, AlertDialogFooter, ConfirmDialog: `gap` / `contentGap` value `compact` → `sm`
- DialogContent: `gap` value `default` → `md` (still the default)
- DialogContent: `gap` value `compact` → `sm`
- DialogContent: data attribute `data-gap` now carries `md` / `sm` / `none`
- MaskedInput: type `Track` → `MaskedInputTrack`
- MaskedInput: type `Modify` → `MaskedInputModify`
- MaskedInput: type `ModifyResult` → `MaskedInputModifyResult`

Update the prop names and values where you use them; behaviour and on-screen text are unchanged.
