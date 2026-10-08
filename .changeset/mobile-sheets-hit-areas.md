---
'@theya/shadcn': minor
---

Phones:
- `Popover` gets `sheet`: below 640px it opens as a bottom Drawer (`PopoverContent` takes `sheetTitle` and `sheetClassName`). Filter, DatePicker, DateRangePicker (one month), ColorField and MessagePopup use it.
- Scheduler starts on the day view below 640px when `defaultView` isn't set.
- Checkbox, Radio and Switch have a 24px invisible hit area; the close buttons of Alert, Attachment and Toast get a 44px tap area on phones.
