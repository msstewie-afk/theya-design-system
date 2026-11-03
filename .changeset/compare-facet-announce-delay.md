---
'@theya/shadcn': patch
---

Comparison and FacetedList announce their counts 700 ms after a checkbox toggle, as DataTableToolbar does: VoiceOver in Safari dropped a count that arrived while it was still reading the checkbox.
