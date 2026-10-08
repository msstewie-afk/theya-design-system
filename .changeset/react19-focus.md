---
"@theya/shadcn": patch
---

File: focus moves onto the picked file again on React 19. The mount effect could run late (just before the next update) and use up the "focus the attachment" request while the picker was still on screen; it now waits until the swap has rendered. The same race made the File story flaky under load on React 18. With this, all 956 Storybook tests pass on React 18 and React 19.
