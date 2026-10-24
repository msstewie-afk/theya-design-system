---
'@theya/shadcn': patch
---

WheelPicker: the focus ring shows again (WCAG 2.4.7). The top/bottom fade (`mask-image`) sat on the focusable element and clipped its box-shadow ring, so a focused wheel looked unfocused. The fade now lives on an inner layer; the look is unchanged.
