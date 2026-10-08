**English** · [Русский](DENSITY.ru.md)

# Density mode

Three modes — **compact**, **default**, **comfortable** — mainly change **spacing** (padding, gap, margin), and with it the size of controls, table rows and menu items. You do not need to change components:

```html
<html data-density="compact">                 <!-- the whole page -->
<div data-density="compact">…table…</div>     <!-- only this block -->
<div data-density="default">…</div>           <!-- restore the default inside a dense block -->
```

Without the attribute, the mode is default. In Storybook, switch the mode with the **Density** button in the toolbar. Examples are in `Actions/DensityToggle`.

## What changes

| | compact | default | comfortable |
|---|---|---|---|
| Controls (buttons, fields, Select, Toggle) | one step down: 40 → 36, 32 → 28 | 28 · 32 · 36 · 40 · 44 · 48 | one step up: 40 → 44, 32 → 36 |
| Table / DataTable row (1 line of text) | 36 | 44 | 52 |
| Row with 2 lines of text | 48 | 56 | 64 |
| Menu, Select, Command item (top/bottom padding) | 4 | 8 | 12 |

The `size-control` scale steps from **md (28)** to **4xl (48)** shift. Small sizes (checkboxes, radios, 16–24px icons), large sizes (56/64), fonts and radii do not change.

## Spacing

Spacing inside cards, dialogs and panels, between sections and in grids is what makes an interface dense or airy. One rule applies to all of it:

- **up to 8px — no change.** Small spacing keeps an icon tied to its text and holds the internals of controls. Shrinking it breaks components;
- **anything above 8px** changes by 40% of the excess: smaller in compact, larger in comfortable;
- the result is rounded to **2px** to stay on the grid.

| Spacing in code | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 |
|---|---|---|---|---|---|---|---|---|
| compact | 4 | 8 | 10 | 12 | 16 | 18 | 22 | 28 |
| default | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 |
| comfortable | 4 | 8 | 14 | 20 | 24 | 30 | 42 | 52 |

This works for:

- numeric Tailwind utilities `p-*`, `px-*`, `py-*`, `ps-*`/`pe-*`, `pt-*`/`pb-*`, `m-*` (and its sides), `gap-*`, `gap-x-*`, `gap-y-*` — via `src/styles/density-spacing.css`;
- offsets `top-*`, `bottom-*`, `start-*`/`end-*`, `left-*`/`right-*`, `inset-*`, `inset-x-*`/`inset-y-*` — they position an element relative to the spacing: a separator inset by the padding, or a checkbox in the corner of a card. Without this, in comfortable the Card separator did not reach the edge of the text, and the checkbox of a selectable card moved above the title;
- tokens `--size-padding-*`, `--size-gap-*`, `--size-margin-*` — `density.css` overrides them.

These do not change: arbitrary values (`p-[13px]`), `px` utilities (`p-px`), `space-x-*`/`space-y-*`, widths and heights (`w-*`, `h-*`, `size-*`) and negative margins. If spacing must stay fixed in every mode, write it as an arbitrary value: `p-[24px]`.

In default the multiplier is 0, so the default look is exactly the same as without a mode.

Collisions at the edges are intentional: in compact the sm and md steps are both 24px, in comfortable 4xl and 5xl are both 56px. The build prints them as a list.

## For products

- `DensityToggle` — a compact / default / comfortable switch (labels are localized).
  - Without props, it sets `data-density` on `<html>`.
  - With `value` + `onValueChange`, it only reports the choice, and you set the attribute on the right block yourself.
- `useDensity()` — `{ density, setDensity }`, like `useTheme()`.
- Saving the choice is up to the product (user settings, cookie): on load, set the attribute back.

## Accessibility

- In compact, controls are no smaller than 24px — the WCAG 2.5.8 minimum.
- On mobile (narrower than the md breakpoint), interactive DataTable cells stay 44px in any mode.
- Compact is meant for desktop; on touch screens use default or comfortable.

## How it works

- Values are in `packages/tokens/src/density/*.json`, at the same paths as in `src/semantic/size.json`.
  - `default.json` defines the density tokens (`--size-density-density-row`, `-row-2`, `-item-py`) and the spacing multiplier `--size-density-density-space-delta` (0).
  - `compact.json` and `comfortable.json` override the steps and these tokens; the multiplier is −0.4 and 0.4.
- `scripts/build-density.mjs` builds `build/css/density.css`; it is imported in `globals.css`.
- The build fails if:
  - a mode references a token that does not exist;
  - the control scale in a mode goes down (a larger step is smaller than the previous one).
- It also works on nested blocks: components read the variables directly, without an alias on `:root`.
- In Figma, this maps to the "Density" variable collection with three modes — the same token names.
