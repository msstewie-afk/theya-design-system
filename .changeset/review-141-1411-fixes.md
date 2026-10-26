---
'@theya/shadcn': patch
---

Fixes from the manual 1.4.1 / 1.4.11 screenshot review:

- Checkbox: in dark, a checked or indeterminate box gets the light primary edge (5.95:1 on the surface; the blue fill alone is 2.71:1), the error box the danger edge (3.6:1; the red fill is 1.84:1). Not on a primary surface, where the box is white.
- Switch: the off track is `bg-secondary-strong` (4.69:1 on white, 3.01:1 on the dark surface; was 2.62 / 1.87, the white thumb on it is 4.69:1). On tracks under 3:1 get a 1px inset edge in their tone: primary and danger in dark, warning in both themes.
- SwatchPicker and ColorPicker swatches: the inner edge is the field-border color (3:1 on the surface in both themes), so a pale swatch on white or a dark one on the dark surface keeps its shape. The translucent hairline was ~1.3:1.
- AvatarGroup: each disc sits on an opaque surface, so the avatar underneath no longer shows through a translucent tonal fallback at the overlap.
- BadgeIndicator: filled success in light is the solid success green with white (4.74:1), like info and danger; dark keeps the status green with dark ink.
- Tabs (and UrlTabs): underline tabs draw the focus ring inside the tab. The list scrolls, so the outer ring was clipped to a stray vertical sliver at the tab's edge. Chips keep the outer ring.
