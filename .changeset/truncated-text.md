---
'@theya/shadcn': minor
---

New `TruncatedText`: one line that ends in an ellipsis and shows the whole text in a tooltip while it is cut (on hover and on keyboard focus of its control; cut text with no focusable control becomes a tab stop). DataTableCell, ListItem, Select, DatePicker, DateRangePicker, Metric, Scheduler and InlineEdit use it for long user data. Short interface labels wrap instead of truncating: Table and DataTable headers, DataTableCell status and usage labels, Metric labels, Sidebar brand and section labels, Kanban column titles, Comparison item names. With text at 200% or WCAG text spacing nothing is lost any more (WCAG 1.4.4 / 1.4.12).
