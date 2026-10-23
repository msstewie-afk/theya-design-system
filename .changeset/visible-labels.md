---
'@theya/shadcn': minor
---

Visible labels and instructions (WCAG 3.3.2):

- New `label` prop (plus `description`, `required`, `optional` where they apply) on NumberField, Rating, WheelPicker, TagInput and DateTimePicker. DateTimePicker's label names the date field and, as "{label} time", the time field; NumberField's steppers take it ("Increase Replicas"); a click on WheelPicker's label focuses the wheel.
- MaskedInput types `label`, `description`, `required` and `optional` (they always reached TextField).
- ColorPicker: a visible letter before each channel field (R/G/B, H/S/L); channel names are localized (`colorPicker.channels`, `colorPicker.captions`).
- FilterField: the number filter shows labelled Min and Max fields side by side, at the text filter's size and spacing.
- SwatchPicker: `required` shows the red asterisk after the legend.
