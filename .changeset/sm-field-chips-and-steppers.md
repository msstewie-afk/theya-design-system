---
'@theya/shadcn': patch
---

- TagInput and Combobox (`heightSize="sm"`): a row of chips no longer grows the field to 34px — vertical padding is 2px in sm, so the control stays 32px and lines up with TextField / Select sm.
- NumberField (`heightSize="sm"`): the −/+ icons are 14px as intended (a shared 16px class was overriding them).
