---
'@theya/tokens': minor
'@theya/shadcn': patch
---

Dark theme visual pass (hierarchy that axe can't check):
- `bg-primary-subtle` (dark): 50% → 30% blue, hover 40%, pressed 50% — the same steps the iris and lime themes already use. Tonal primary buttons, selected table and tree rows, the active Sidebar item and primary avatars no longer look almost like filled primary.
- `bg-secondary-hover` / `-pressed` (dark): gray-a300 / gray-a400. The unchecked Switch track now changes on hover in dark (it didn't change before).
- New `bg-surface-sunken` (gray-010 light, slate-800 dark): a recessed track or well for raised items. The Tabs chips track, WheelPicker and Kanban columns use it, so the active chip, the WheelPicker selection and Kanban cards look raised in dark instead of sunk. In light, WheelPicker and Kanban columns go from gray-005 to gray-010 (cards stand out a little more); Tabs chips are unchanged.
- New `text-placeholder` (slate-450 light, slate-200 dark): field placeholders. In dark they were slate-100, hard to tell from typed values. Light is unchanged.
- New `bg-input-disabled` (gray-005 light, slate-800 dark): the fill of disabled and read-only fields. In dark a disabled field was lighter than an enabled (black) one. Light is unchanged.
- Things that float or stick over content no longer let it show through in dark (tonal fills are translucent there): the tonal FAB (and FabSpeedDial actions), TableHead (sticky DataTable header, frozen first column) and the hover / selected fill of pinned DataTable cells now paint their tint over the opaque surface. They look the same as before.
