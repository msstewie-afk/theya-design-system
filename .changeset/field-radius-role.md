---
'@theya/shadcn': patch
---

Every field follows a profile's field radius (`--theme-radius-field`): NumberField, DatePicker / DateRangePicker, Autocomplete, TagInput, Combobox, InputOTP, TextArea, InputGroup (PhoneField) and SecretField did not, so in Ember or Lime they kept Theya's 6px next to 14px TextFields. Theya itself is unchanged.
