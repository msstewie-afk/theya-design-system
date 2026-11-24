import { C, type ComponentGuidelines } from '../../docs/guidelines';

export const mapViewGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'Where places are: stores, pickup points, studios, clinics — and which one is nearest.',
    'A small set of places a person picks from (tens to a few hundred), with an address for each.',
  ],
  whenNotToUse: [
    { text: 'One address on a contact page', instead: 'a link to a maps app next to the address' },
    { text: 'Numbers by region (sales per country)', instead: 'a Chart or a Table' },
    { text: 'A decorative picture of a map in a hero', instead: 'an illustration — it doesn’t need tiles or WebGL' },
  ],
  anatomy: [
    { part: 'Map', description: <>MapLibre with a base map drawn from tokens: land on surface-sunken, water on info-subtle, parks on success-subtler, roads on surface with border casings, labels in text-subtle. Recolored on a theme or brand change. Tiles from OpenFreeMap by default (<C>tiles</C>); <C>tiles={'{null}'}</C> draws points only.</> },
    { part: 'Points', description: 'a 14px dot in the primary color with a surface ring; the selected one grows to 20px — size marks it, not only color.' },
    { part: 'Clusters', description: <>nearby points merge into a primary circle with the count; click to zoom in. Off with <C>cluster={'{false}'}</C>.</>, optional: true },
    { part: 'Zoom buttons', description: 'top end corner; disabled at the zoom limits.' },
    { part: 'Card', description: <>over the map, bottom start (full width on a phone), for the selected place: name, address, distance — or your content via <C>renderCard</C>. Closes with its × button.</>, optional: true },
    { part: 'List', description: <>the same places with address and distance, next to the map (<C>list="end"</C> or <C>"start"</C>) and under it on a phone. Sorted by distance once there is an <C>origin</C>.</> },
    { part: 'Find near me', description: <>asks for the location, sorts the list and selects the nearest place (<C>locate</C>).</>, optional: true },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="grid w-80 grid-cols-[1fr_8rem] gap-2">
            <div aria-hidden className="h-28 rounded-[var(--size-border-radius-border-radius-xl)] border border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-sunken)]" />
            <ul className="flex flex-col gap-1 font-body text-body-s text-[var(--color-text-text)]">
              <li>Helios Studio · 0.4 km</li>
              <li>Pickup · Graça · 0.6 km</li>
              <li>Eos Portraits · 0.9 km</li>
            </ul>
          </div>
        ),
        caption: 'The places are also a list with addresses and distances: it works by keyboard, by screen reader, and when the map can’t load.',
      },
      dont: {
        example: <div aria-hidden className="h-28 w-80 rounded-[var(--size-border-radius-border-radius-xl)] border border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-sunken)]" />,
        caption: 'A map as the only way to find a place shuts out everyone who can’t see it or use a pointer.',
      },
    },
  ],
  a11y: [
    'The map is never the only way in: the list carries every place with its address and is the keyboard and screen-reader path. Keep it; list="none" only when the same places are listed elsewhere on the page.',
    'Markers mirror the list for the pointer: they are out of the tab order and hidden from screen readers, so places aren’t announced twice. Each has its name as a tooltip.',
    'The map canvas takes focus: arrows pan, + and − zoom; it is named so people know what the keys do. The zoom buttons work without the canvas.',
    'Selecting a place moves the map, not the focus; the card is a named group. "Find near me" announces the result (nearest place and distance) or the failure, and the list stays usable either way.',
    'Under reduced motion the map jumps instead of flying.',
    'Without WebGL the frame says the map can’t be shown and the list works as usual.',
    <>Name the map region with <C>aria-label</C> (“Our studios”) and the list with <C>listTitle</C>.</>,
  ],
};
