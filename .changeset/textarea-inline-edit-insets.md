---
'@theya/shadcn': patch
---

TextArea and InlineEdit use the same 12px side inset as every other field: TextArea and the multiline InlineEdit go from 12px / 8px to 12px on both sides, and the single-line InlineEdit display from 16px / 8px to 12px on both sides, so it lines up with the TextField that replaces it while editing.
