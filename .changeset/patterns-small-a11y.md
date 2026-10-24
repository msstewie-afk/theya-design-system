---
'@theya/shadcn': patch
---

Patterns, small accessibility fixes:
- Reviews: the rating filter reads "1 star" / "1 review" in the singular (it said "1 stars").
- FacetedList: when focus moves to the section heading (after "Clear all" or removing the last filter chip), the heading shows as a small label with a focus ring instead of staying invisible (WCAG 2.4.7). Nothing below it shifts.
- Cart: a held Enter or Space no longer presses the control that focus moves to. Holding Enter on Apply removed the code at once; holding it on a row's Remove removed the next rows too.
