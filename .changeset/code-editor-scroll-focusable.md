---
"@theya/shadcn": patch
---

CodeEditor: the editing area is an explicit tab stop (`tabindex="0"`), so accessibility checkers see its scroll box as keyboard-reachable. No change for users.
