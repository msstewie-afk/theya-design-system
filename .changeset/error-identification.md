---
'@theya/shadcn': minor
---

Input errors are identified and described in text (WCAG 3.3.1).

- TimeField: typed text that isn't a time, or is outside `min`–`max`, used to be dropped without a word. The field now turns `aria-invalid` until a valid time is picked. New `onInvalidInput(text, message)` hands over the reason in the current locale, so it can be shown under the field. Without it the field announces the reason itself. DateTimePicker gets this through its TimeField.
- TimeRangePicker: new `aria-invalid`, `aria-describedby` and `onInvalidInput` props, passed to both fields.
- ColorPicker: a hex or channel value it can't read still goes back to the last good value, but a message under the fields now says what was expected. ColorField keeps the typed text, marks the field invalid and shows the reason under it. Esc or a valid color clears it.
- DataTableCell: `errorMessage` is shown and linked by `aria-describedby` for every editable kind. Before, only `input` and `textarea` showed it, and `select` kept it off screen. A cell with a shown message grows to fit it.
- FilterField: Apply on an empty number range marks both fields invalid and says to enter a minimum, a maximum or both. Before, nothing happened.
- PropertyGrid: new per-row `error`. It shows under the control, marks the control `aria-invalid` and is linked by `aria-describedby`, together with the row description, which now has an id. `custom` renders receive `invalid` and `describedBy`.
- Checkbox: `error` sets `aria-invalid`, and the description turns into danger text with the error icon.
- FieldError: shows the error icon before the text, so the error doesn't rest on red alone.
- New locale keys in all five locales: `timeField.invalid`, `timeField.outOfRange`, `colorPicker.invalidHex`, `colorPicker.invalidNumber`, `filterField.rangeEmpty`.
