---
'@theya/shadcn': patch
---

Status messages that Safari + VoiceOver didn't speak (hand check, 2026-10-29):

- Command (and FilterField, PhoneField, which use CommandEmpty): "No results" is put into the status region once typing pauses (500 ms) instead of on the first keystroke, where VoiceOver's typing echo spoke over it and it never changed again.
- Scheduler: the new range after Previous / Next / Today is announced through the shared announcer; `aria-live` on the heading was not read.
- DataTableToolbar: "N selected" is announced 700 ms after the change, after VoiceOver has spoken the row checkbox.
- `announce()` takes an optional `{ delay }` (default 100 ms).
