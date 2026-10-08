---
"@theya/shadcn": minor
---

Built-in strings are localizable: `TheyaLocaleProvider` (`@theya/shadcn/lib/i18n`) plus ready bundles for Russian, German, Arabic and Chinese (`lib/locale-ru`, `-de`, `-ar`, `-zh`). English stays the default and every label prop still overrides the dictionary. Dates and numbers in DatePicker, DateRangePicker, Scheduler, Meter, Price and PhoneField now follow the provider's `locale` (en-US without one) instead of the browser's; Calendar takes the provider's date-fns locale. See LOCALIZATION.md.
