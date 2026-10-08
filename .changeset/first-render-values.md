---
"@theya/shadcn": patch
---

Preselected Combobox, TimeField and DateTimePicker show their value on the first render instead of a frame later. `useTheme` (and ThemeToggle) reads the current theme on the first render and follows `data-theme` changes, so several toggles on a page stay in sync.
