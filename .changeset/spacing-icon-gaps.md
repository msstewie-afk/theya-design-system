---
'@theya/shadcn': patch
---

Icon-to-text gaps and small stacks on the 4px grid (rule: 4px next to a 12px icon or small text, 8px next to a 16px+ icon; 4px inside a label/value pair, 8px between list items).

- Button: lg gap 6 → 4 (same text and icon as md); xl side padding 14 → 16 and gap 6 → 8; 2xl gap 6 → 8. Fab sm icon–label gap 6 → 4.
- Badge: sm gap 6 → 4; md side padding 10 → 12, gap 6 → 8.
- Toggle, Tabs, Breadcrumb, Pagination, Tree, Calendar month/year dropdowns: icon–text gap 6 → 8.
- Message and Chat (avatar to bubble), Terminal, DataTableCell avatar cells, ColorPicker channel row: 10 → 8.
- Small status lines (Dropzone and PromptArea errors, DataTable sort header, TeamMembers, AccessTokens, Preferences, Checkout, SpecSheet, SiteFooter, PlanComparison): 6 → 4.
- Stacks: Sonner, ProductTour, PromptArea, Details, Scheduler day, DataTableCell skeleton 6 → 4; PasswordStrengthMeter, Kanban card, Reviews filter, AccountOverview lists 6 → 8.
- AvatarGroup sm overlap 6 → 4. NotificationsInbox tab badge 6 → 8.
