---
'@theya/shadcn': minor
---

Fields share one inset, and FAB gets a square shape.

- Fields: text, or a leading icon, starts 12px from the border on 32px and 40px fields and 16px on 48px ones; a leading icon is followed by an 8px gap. Without a trailing chevron or button the end inset equals the start one. Trailing chevrons and clear buttons stay where they were. Applies to TextField (and Password, MaskedInput, SearchBox), Select, InputGroup, Combobox, Autocomplete, TagInput, DatePicker, DateRangePicker, Filter, PhoneField and SecretField.
- InputGroup: an addon with `divider={false}` sits on the field's background as the field's own icon, 8px before the text.
- Fab and FabSpeedDial: new `shape="square"` — rounded corners (12px on sm, 16px on md and lg) instead of a circle.
