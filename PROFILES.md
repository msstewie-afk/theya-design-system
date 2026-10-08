**English** · [Русский](PROFILES.ru.md)

# Product profiles and themes

A profile recolors Theya for a product with a single attribute, with no changes to components:

```html
<html data-brand="lime">                    <!-- light -->
<html data-brand="lime" data-theme="dark">  <!-- dark -->
```

Without `data-brand`, you get the regular blue Theya. In Storybook, you switch the profile with the **Brand** button in the toolbar.

Profiles live in `packages/tokens/src/profiles/<name>.json` and come in two kinds.

| Kind | What it changes | Ready-made |
|---|---|---|
| simple | only the hue of the primary color | — (format below, for quick experiments) |
| full theme | primary color, text on it, neutral and secondary colors, surfaces, text and links — separately for the light and dark theme; typeface and radii | `iris`, `lime` |

| Theme | Colors | Typeface | Radii |
|---|---|---|---|
| `iris` | violet primary `#743de4`, indigo links, cool near-gray neutrals, blue-black dark theme | Onest | sharp: fields 2px, everything else in the same proportion (buttons 3, cards 3, dialogs 4) |
| `lime` | lime primary `#9fe870` with dark green text, greenish neutrals, near-black green dark theme | Manrope | ×1.5, pill buttons, fields 12px |

## Simple profile

```json
{ "hue": 300, "chroma": 1, "description": "Product X" }
```

- `hue` — hue in OKLCH, 0–360;
- `chroma` — chroma (saturation) multiplier (default 1).

## Full theme

```json
{
  "description": "…",
  "primary": "#9fe870",
  "onPrimary": "#163300",
  "neutral": { "hue": 140, "chroma": 0.1 },
  "light": { "tokens": { "text-text": "#0e0f0c", "bg-neutral-bg-neutral-subtle": "#ecefec" } },
  "dark":  { "tokens": { "bg-surface-bg-surface-base": "#121512", "text-text-link": "#9fe870" } },
  "accept": ["primary hue vs success"],
  "font": "Manrope",
  "radius": { "scale": 1.5, "button": "max", "field": "xl" }
}
```

| Field | What it does |
|---|---|
| `primary` | the primary fill color (buttons, selected day, checkbox), exactly the same in both themes. Hover and pressed use the same color, 0.05 and 0.10 darker in L. You can override it for one theme: `dark.primary` |
| `onPrimary` | text and icons on this fill. If not set: white when it gives 4.5:1, otherwise the darkest step of the scale. For a light fill (as in `lime`), it must be dark |
| `neutral` | recolors the neutral scales (slate, gray, graphite and their transparent versions): `hue` is the hue, `chroma` is the chroma multiplier (Theya's neutrals are lavender; 0.1–0.2 makes them almost gray). Secondary buttons, borders, text and dark surfaces depend on them |
| `light.tokens`, `dark.tokens` | exact values for individual semantic tokens (name without `--color-`). They are applied last, so they win over everything generated. This is how you set surfaces, text color and links — the things that are specific to the product |
| `accept` | deliberate exceptions to the checks (see below) — the build prints them but does not fail |
| `font` | the theme typeface instead of Geologica (for headings and body text). The typeface must be loaded in `packages/tokens/fonts/fonts.css` — Manrope and Onest are already there; the browser downloads it only when the theme is active. Font weights go back to nominal (400/500/600/700): in Theya they are shifted by −125 because Geologica looks bolder |
| `radius.scale` | multiplier for the sm…5xl radius scale, rounded to whole px (`max` stays a pill) |
| `radius.anchor` | instead of `scale`: one step gets the given value, and the rest scale by the same factor. `{ "lg": 2 }` — fields 2px, the whole scale ×⅓ (this is how `iris` does it) |
| `radius.button`, `radius.field` | one radius for all Button sizes and for TextField + Select: a scale step (`xl`, `max`) or px |

## How colors are built (OKLCH)

Each scale (primary and neutrals) is converted to OKLCH. The lightness **L** of each step stays the same as in Theya; only the hue **H** and chroma **C** change. Colors outside sRGB are brought back into it by reducing chroma. As a result, each step stays in its place on the scale and contrast barely changes — unlike HSL, where the "same" lightness looks very different for yellow and blue.

- The primary scale takes its hue from `primary`, and chroma is adjusted so that step 500 matches it. Links, icons, borders and tonal backgrounds are derived from this scale.
- All semantic tokens that reference the recolored scales (light, dark and code tokens) get new values. Primitives (`--color-blue-*`, `--color-slate-*`…) are overridden too — several components use them directly.

## Build-time checks

The build fails if, in any theme:

- **contrast** dropped below the threshold where Theya was above it:
  - 4.5:1 — text (regular, subtle, subtler, links) on surfaces, and text on the primary fill;
  - 3:1 — icons, the primary border, and the fill itself against the page background;
- the **hue** of the primary color is closer than 20° to a status color (success, warning, danger, info). Otherwise the primary button reads as a status: for example, an orange profile (60°) collides with the dark warning (47°);
- `tokens` lists a token that does not exist.

You can allow an exception with `accept`. `lime` has two, both inherent to the color itself:

- `primary hue vs success` — the primary color is green, 18° from success;
- `light: bg-primary-bg-primary on bg-surface-bg-surface-base` — the lime fill on white is 1.47:1. The button is defined by the dark text on it (9.45:1), but an on Switch or a checked Checkbox differs from the off state mainly by color. This is the same kind of accepted exception as the focus ring in the WCAG audit.

## Limitations

- `data-brand` goes on `<html>`: shadcn variables (`--primary` and others) are computed at the root, so a profile on a nested element will not recolor them.
- A profile does not change chart colors (`--color-bg-chart-*`) or status colors.
- A theme does not set density — that is a separate layer (`data-density`, see DENSITY.md), and you can combine it with any theme.
- The typeface and radii, like the shadcn variables, work when `data-brand` is on `<html>`.
