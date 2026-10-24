---
'@theya/shadcn': patch
'@theya/tokens': patch
---

Three accessibility decisions (Maria, 2026-10-24):

- Current item by more than color (WCAG 1.4.1): the active SidebarItem and the current section in Preferences' nav are semibold with a 2px bar at the start edge, in the text color, besides the tinted fill.
- Dark danger status (1.4.11): `color.bg-danger-status` in the dark theme is red-200 (#f05a7e), 4.3:1 on `bg-surface` like the other status tones; it was red-400 at 2.08:1. StatusDot, Timeline dots, BadgeIndicator and AccountMenu's attention dot use it. BadgeIndicator's danger count is dark ink on it in the dark theme (5.5:1).
- Visible filter labels (3.3.2): AuditLog's category and date filters, OrderHistory's status select and the sort selects in Reviews and SavedItems have an inline label (Category, Date, Status, Sort by) instead of a placeholder or an aria-label only.
