---
'@theya/shadcn': patch
---

Button: label changes ("Save changes" → "Saving…" → "Saved") are announced through the shared announcer (`announce()`), not an `aria-live` span inside the button. VoiceOver with Safari stayed silent when the live region sat in the focused button (found in the manual screen-reader pass). The first render is never announced. CopyButton's "Copied" uses the same path.
