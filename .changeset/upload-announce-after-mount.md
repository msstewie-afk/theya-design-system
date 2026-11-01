---
'@theya/shadcn': patch
---

UploadPanel and Attachment: the first upload message ("Uploading 3 files", "Uploading report.pdf") is written into the live region a moment after the region appears, so screen readers announce it (text a region is born with is ignored). An Attachment says nothing about the state it is rendered with; only changes are announced.
