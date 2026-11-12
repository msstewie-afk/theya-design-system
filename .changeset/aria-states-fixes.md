---
'@theya/shadcn': patch
---

ARIA fixes found by the new states check (`scripts/a11y-states.mjs`), which opens every popup, types into every combobox and presses Escape:

- Combobox, Autocomplete (and TimeField, DateTimePicker, AuditLog that use them): while loading or with no match the listbox stays in the DOM, empty, so the input's `aria-controls` points at it; the loading / "no results" message is a `role="status"`. Autocomplete's listbox has a name.
- Popover: the content is labelled by its trigger even when the trigger is a child with its own (or no) id — DatePicker, DateRangePicker, DateTimePicker calendars were named by an id that didn't exist.
- Select: a trigger labelled by `aria-labelledby` names its list too.
- Form: `FormControl` points `aria-describedby` at a `FormDescription` only when there is one.
- Dropzone: with an error, the field is described by the error only (the hint it pointed at isn't rendered then).
- Card with an action, static Chip, AvatarGroup's "+N": no `aria-label` on a plain `div` / `span` (screen readers drop it); the "+N" avatar is `role="img"`.
- NavigationMenu: a panel is a named `role="group"`.
