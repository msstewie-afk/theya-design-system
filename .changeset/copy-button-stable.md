---
'@theya/shadcn': patch
---

CopyButton keeps one width ("Copy" and "Copied" share a grid cell), so nothing jumps and VoiceOver's cursor frame matches the button. Button no longer announces a return to its resting label ("Copied" → "Copy", "Saved" → "Save changes"), which cut off the message before it; text inside aria-hidden is left out of what Button announces.
