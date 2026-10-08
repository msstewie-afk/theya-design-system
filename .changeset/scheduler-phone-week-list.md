---
'@theya/shadcn': minor
---

Scheduler: below 640px the week view is a list — each day with its events as full-width rows (all-day first), "No events" on empty days, and the day heading opens the day view. The seven-column grid made events about 15px wide on a phone, under the 24px target size (WCAG 2.5.8). New locale key `scheduler.noEvents` in all five locales.

On phones the visible range ("Oct 5 – 11, 2026") also gets its own row under the buttons instead of truncating to "Oct…".
