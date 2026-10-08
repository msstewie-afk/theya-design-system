---
"@theya/shadcn": patch
---

Spec / llms.txt import lines now name real exports: `TextArea` (was `Textarea`), `InputOTP` (was `InputOtp`), and `KebabIconVertical, KebabIconHorizontal`, `ResizablePanelGroup, …`, `TableSkeletonRows` instead of family names that are not exported. Files that export through `export { … }` lists (Select, Popover, DropdownMenu, Form, …) now list their parts too. `build-spec` fails if an import line names something the file does not export.
