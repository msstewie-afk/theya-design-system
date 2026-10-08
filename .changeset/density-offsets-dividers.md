---
"@theya/shadcn": minor
---

Density and divider fixes:
- Offset utilities (`top-*`, `bottom-*`, `start-*`, `end-*`, `left-*`, `right-*`, `inset-*`, `inset-x-*`, `inset-y-*`) follow `data-density` like padding and gap do (up to 8px unchanged). In compact / comfortable a selectable Card's checkbox or radio no longer floats off its title, and inset dividers (Card, Dialog, Drawer, StickyActionBar) keep lining up with the content padding. Default density is unchanged.
- Lists in a bordered box (NotificationsInbox, OrderHistory, SavedItems) divide their rows with the divider level, `border-subtler`, edge to edge like table rows.
- Pattern borders follow the border levels: dividers `border-subtler`, totals and page bands `border-subtle` (were the field border in CatalogItemPage, SiteFooter, OrderHistory, Checkout and order summaries); a CatalogFacetedList drawer footer no longer draws a second, edge-to-edge line.
- ResourceForm renders a `select` field with up to 5 options as radios (Select's own guideline); TeamMembers' invite form does the same for up to 5 roles.
