---
'@theya/shadcn': minor
---

Micro-interactions built into the components (from the Motion/Micro-interactions review; adapted from Kinetics, MIT). All of them are skipped with reduced motion.

- Checkbox: the tick is drawn along its stroke.
- Switch: the thumb stretches while pressed, then springs across.
- Tabs: one underline glides to the active tab and takes its width.
- CopyButton: the copy icon shrinks away as the check springs in.
- Rating: on a pick the stars light up one after another and the picked star throws sparks.
- SwatchPicker: the selected swatch grows a size.
- Chip: a toggled chip pops as it switches on.
- NumberField: the number pops on each step; the step buttons now step from a value being typed, like the arrow keys.
- TagInput: a new tag pops in, a removed tag pops out.
- BadgeIndicator: the count pops when it changes (the component is now a client component).
- New SuccessCheck: a success icon that draws itself; the Toaster uses it for `toast.success`.
- Stepper: a segment fills when its step completes and the new current step pops.
- Skeleton: fully rounded by default with a soft sweep instead of a pulse; pass a block radius for images and cards.
- undoToast: a bar drains over the grace window and pauses on hover.
- Fab: lifts on hover.
