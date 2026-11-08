---
'@theya/shadcn': patch
---

Icons inside controls are hidden from screen readers (`aria-hidden`), so Safari no longer exposes a button with an icon as a group of text and image that VoiceOver steps into (VO + Space then didn't press it or speak its state). Covers the Accordion chevron, icons passed as children to Toggle, ToggleGroupItem, ToolbarButton, TabsTrigger (and its `icon`), DropdownMenu / ContextMenu / Menubar items, CommandItem and TopbarAction, the `icon` of HelpIcon and SidebarItem, and the built-in icons of Select, Filter, FilterField, NumberField, DatePicker, DateRangePicker, Calendar, DataTable sort headers and pagination, ThemeToggle and the Topbar search and menu buttons. An icon that sets its own `aria-label` or `aria-hidden` is left as it is; with `asChild` the child is the control and is never hidden.
