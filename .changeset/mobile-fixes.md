---
"@theya/shadcn": minor
---

Mobile (360px) fixes:
- Opening a Select, menu or dialog no longer shifts the page: the scroll-lock compensation rule zeroed `<body>` padding (in Storybook, its 16px padded layout). Storybook now pads the story root instead; don't pad `<body>` itself in a product (see the note in globals.css).
- Native scrollbars everywhere (tables, code, toolbars) look like ScrollArea's: thin, no track, translucent thumb — no white track under a table in the dark theme. The dark theme also sets `color-scheme: dark` for native controls.
- DataTable: the primary column keeps at least 200px; on a narrow screen it collapsed to 0 and its avatar overlapped the next column.
- DataTableToolbar wraps instead of scrolling sideways; ListView's filter field stays inside the bar.
- DataTableCell badges: the measuring copy no longer widens the page.
- ColorPicker, Card, Popover and Tooltip never exceed the screen width (Popover/Tooltip keep 8px from the edge).
- StatusTracker failure actions stay inside the alert (long labels truncate, full text kept as the name); LoginFormSplit's form panel shrinks with the screen; NotificationsInbox keeps the unread dot on the title's line.
- Stories: fixed-width wrappers (`w-[320px]`) and inline button rows fit a phone.
- `PopoverContent` and `TooltipContent` default `collisionPadding` to 8.
