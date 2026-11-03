---
'@theya/shadcn': patch
---

ListView: Enter on "Search for …" keeps the search instead of clearing it and showing every row. FilterField has a new `searchChips` prop (default `true`); with `false`, Enter on the search row keeps the text in the field and closes the dropdown.
