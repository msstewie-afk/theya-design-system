---
'@theya/shadcn': minor
---

Status messages reach screen readers without moving focus (WCAG 4.1.3).

- New `announce(message, politeness?)` in `@theya/shadcn/lib/announce`: speaks a message through a shared, visually hidden live region. The region sits inside the top-most open dialog when there is one, so messages from inside a modal aren't hidden by it. Use it for messages whose own element mounts with the text already in it, or lives outside an open dialog.
- Command: the `CommandEmpty` text is spoken through a status region on the menu ("No results found." used to appear silently).
- Countdown: says when the time is up (the `completed` text, or the new `t.countdown.ended`).
- Terminal: the connection status line is a `role="status"` region.
- StickyActionBar: a changed `message` is announced while the bar is open (the bar mounts with it, so its own `aria-live` was never read).
- DataTableToolbar: the selected count is announced when it changes.
- Dropzone: upload status changes (uploading, done) are announced.
- Patterns: NotificationsInbox (result text), PasswordReset (link sent again), OrderHistory ("Showing X of Y"), Comparison (item count, "These items match on every attribute."), FacetedList (result count, "No matches."), Cart (promo code errors).
- New locale key `countdown.ended` in all five locales.
