---
'@theya/shadcn': patch
---

Links in small text (body-s, body-xs, Link size xs / sm) and in AnnouncementBar are semibold instead of medium: one weight step was too close to tell a link from the words around it (WCAG 1.4.1; Мария, 2026-11-26). Small-text links still never underline (2026-11-07). SignUpForm's terms links drop their own font-medium.
