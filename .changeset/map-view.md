---
'@theya/shadcn': minor
---

New `MapView` (`@theya/shadcn/ui/map-view`): places on a MapLibre GL map with vector tiles (OpenFreeMap by default, no key). The base map is drawn from tokens — land, water, parks, roads and labels follow light / dark and the product theme and are recolored when either changes. Points in the primary color, clusters with a count, zoom buttons, a card over the map for the selected place (`renderCard`), and a list of the same places with address and distance next to the map (under it on a phone) — the keyboard and screen-reader path. "Find near me" sorts the list by distance and selects the nearest place. `maplibre-gl` is a new dependency, loaded on the client only; `globals.css` now imports its stylesheet (`styles/map.css`).
