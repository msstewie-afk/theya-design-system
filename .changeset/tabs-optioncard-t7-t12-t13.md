---
'@theya/shadcn': patch
---

Tabs: the focus ring shows only after keyboard input. Radix focuses a tab on mouse down and Chrome counted that as :focus-visible; Theya now tracks input modality on <html> (`data-theya-input`, `lib/input-modality`) and draws the tab ring only when the last input wasn't a pointer (T7). Chips: the scroll button fades from the track's colour; `--tabs-track-bg` on Tabs or an ancestor recolours the track and the fade (T13).

OptionCard: the icon and the indicator centre on the title's first line whatever its line height, with `data-slot="option-card-icon"` / `"option-card-indicator"`; the group goes to two columns by its own width (each card at least 16rem), not the window (T12).
