---
'@theya/shadcn': minor
---

Attachment and File: `upload` ('uploading' | 'paused' | 'done') and `progress` (0–100). A progress bar with "3.2 MB of 12 MB · 26%" while uploading or paused, "Completed" with a check when done; a failed upload stays `error`. Screen readers hear changes of state only (started, paused, uploaded, failed). The row keeps its height when the bar goes. A File still uploading can't be replaced by clicking it. New locale strings under `upload`.
