---
'@theya/shadcn': patch
---

Patterns: WCAG 2.2 AA code review (275 checks over 42 patterns, recorded in `a11y/manual.json`), with these fixes:

- OrderHistory: Track progress, Invoice (PDF) and Buy again name their order for screen readers ("Buy again order TH-23990"), like Details, so several open rows stay distinct (2.4.6).
- Comparison and PlanComparison: the "No" / "Not included" dash is `icon-subtle` (3:1 on white), was `icon-subtler` at 2.62:1 (1.4.11).
- Comparison's sticky compare tray and PlanComparison's sticky plan cards reserve their height as scroll-padding, so a Tab-focused card or row is never hidden under them (2.4.11).
- PaymentMethod: the expiry field shows "Month and year, MM / YY" as helper text, not only as a placeholder (3.3.2).
- ListView: the table and its search are named from `noun` ("Users", "Search users…") instead of "List" / "Search…"; the seeded demo uses user / users (2.4.6).

The accessibility matrix counts a manual review as axe evidence when a story switches an axe rule off with a reason (CardFan, Comparison: 2.5.8).
