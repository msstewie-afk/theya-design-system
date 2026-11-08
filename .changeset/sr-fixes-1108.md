---
'@theya/shadcn': patch
---

AlertDialog: the close button closes like Esc instead of being a second Cancel, so Radix focuses the footer's Cancel on open by itself again (VoiceOver in Safari read neither the dialog nor the focused button). ConfirmDialog: the type-to-confirm label keeps its original element and wraps through one inner span. Storybook: a play that clicks or types runs only in automated runs (`testOnly`), so stories open untouched for people.
