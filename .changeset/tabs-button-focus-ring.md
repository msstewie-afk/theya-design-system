---
'@theya/shadcn': patch
---

Tabs: the trigger is a `<button type="button">` again (was `<div role="tab">`), so clicking or tapping a tab no longer shows the focus ring; Tab and arrow keys still do. Chrome matched `:focus-visible` on the focusable div after a pointer click. A disabled tab is natively `disabled` as well as `aria-disabled`.
