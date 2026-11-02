---
'@theya/tokens': minor
'@theya/shadcn': minor
---

Elevation, reworked with Maria (2.11): the scale is layered "contact + ambient" — a tight shadow at the edge, then soft wide layers, each lighter as it spreads (light: slate-tinted; dark: black with a faint light rim on md, lg, xl). Components use two steps only: `shadow-elevation-sm` for what sits in the page (cards, raised details) and `shadow-elevation-md` for what floats (tooltips, menus, popovers, dialogs, sheets, toasts, cards in motion); xs, lg and xl stay as options. New alternative scale `shadow-elevation-smooth-xs…xl` (layers doubling 1→32px at one low alpha), not used by components yet. `shadow-card` = sm, `shadow-card-hover` = md. Landing photo cards: the gradient sits only under the text; the BookmarksPreview search key lines up with the row chips.
