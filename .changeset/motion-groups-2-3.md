---
'@theya/shadcn': minor
---

More motion from the Motion/Micro-interactions review (adapted from Kinetics and CSS Loaders, MIT). All of it is skipped or softened with reduced motion.

System-wide:
- Bloom: DropdownMenu, ContextMenu, Menubar, Select and Popover unfold from the edge next to their trigger, and their items slide in one after another (was a fade and zoom).
- New Spinner (the CSS Loaders Meridian arc), used by Button `loading`, Combobox, Autocomplete, Command and Dropzone.
- Form: a submit that fails validation shakes each invalid field once.

New variants and props:
- Tabs: `TabsList variant="chips"` — segmented tabs with a pill that springs to the hovered tab.
- Progress: `indeterminate`, and `segments` for a known number of stages.
- Countdown: `appearance="ring"` (with `from`), a draining ring with a check at zero.
- Button: `success` — a tick draws itself in place of the icon.
- BadgeIndicator: `pulse` / `pulseKey` — two rings spread three times, then rest.
- New FabSpeedDial, HoldToTalk, WheelPicker and ChatTyping components.
- Locales: `chat.typing`, `holdToTalk`, `speedDial` strings in all five languages.
