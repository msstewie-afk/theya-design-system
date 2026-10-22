---
'@theya/shadcn': minor
---

WCAG 2.2 reviews of 1.3.5, 2.1.4, 2.2.1 and 3.2.2 for every component they apply to, recorded in `a11y/manual.json`, with these fixes:

- Toasts (2.2.1): keyboard focus inside the toasts now pauses the timer, like hover (Sonner alone only paused on hover). A toast with an `action` or `cancel` stays until dismissed unless you pass a `duration`. SecretField's copy-failed toast stays when it is the only explanation.
- Shortcuts (2.1.4): KeyboardShortcuts `hotkey` and the SearchBox block's `shortcut` accept a chord such as `"Mod+/"` (⌘ on Apple, Ctrl elsewhere), so apps can let users remap them; a bare character is still ignored while typing. New `lib/hotkey` helpers.
- Autofill (1.3.5): Password defaults to `autoComplete="current-password"` (pass `"new-password"` when setting one). Autocomplete and Combobox take `autoComplete` (default `"off"`). PhoneField's `autoComplete` (default `"tel"`) can be overridden. InlineEdit passes `autoComplete` to its multiline field too.
