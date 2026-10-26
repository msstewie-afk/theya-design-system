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

## Make your own theme

1. **Copy a theme.** `cp packages/tokens/src/profiles/iris.json packages/tokens/src/profiles/<name>.json`. The name becomes the attribute value: lowercase letters, digits and hyphens. Don't name a theme after a real product.
2. **Set the primary color.** `primary` — one hex. Pick a hue at least 20° from the status colors (success, warning, danger, info), or the primary button will read as a status. Leave `onPrimary` out first: the build picks white or the darkest step.
3. **Tune the neutrals.** `neutral.hue` near the primary hue makes the grays feel related; `chroma` 0.1–0.2 is almost gray, 1 keeps Theya's tint.
4. **Build:** `cd packages/tokens && npm run build`. The build checks contrast and hue (see “Build-time checks”), lists what fails and stops.
5. **Fix what the build reports**, in this order:
   - text or icons on the fill fail → set `onPrimary`;
   - links or text on surfaces fail in one theme → give exact values in `light.tokens` / `dark.tokens` (`text-text-link`, `text-text-subtle`…);
   - the fill is too light against the page (a pale or yellow primary) → darken `primary` or set `dark.primary`; accept the exception only if it is the point of the color, and say why in `description`.
6. **Surfaces and text** (optional): the product's own page background, text color and links in `light.tokens` / `dark.tokens`. Keep the order of surfaces: in dark, raised layers (cards, menus, dialogs) are lighter than the page.
7. **Typeface and radii** (optional): `font` (add the `@font-face` to `packages/tokens/fonts/fonts.css` if it isn’t there; the font must cover Cyrillic) and `radius`.
8. **Add it to the Storybook toolbar:** a `{ value: '<name>', title: '<Name>' }` item under `brand` in `packages/theya-shadcn/.storybook/preview.ts`.
9. **Check it** (next section), then add a changeset: `pnpm changeset`.

Figma gets the theme by itself: the DTCG export adds `brand-<name>` sets and modes ([TOKENS-EXPORT.md](TOKENS-EXPORT.md)).

## Checking a theme

The build checks contrast of token pairs. What it can’t see — how components actually look — is checked in Storybook:

1. **By eye.** Brand → your theme, then light and dark. Go through Foundations / Colors, Button, TextField, Select, Checkbox, Switch, Tabs, Card, Table, Dialog, Toast. Look for: the primary button vs a status badge, the selected state vs hover, raised surfaces in dark, focus rings.
2. **Axe and play tests in the theme**, both themes (from `packages/theya-shadcn`, with Storybook running or a static build served on port 6008):

   ```bash
   THEYA_BRAND=<name> pnpm test-storybook
   THEYA_BRAND=<name> pnpm test-storybook:dark
   ```

   A failure here that doesn’t happen without `THEYA_BRAND` belongs to the theme: usually a pair that needs an exact value in `light.tokens` / `dark.tokens`.
3. **Visual baselines** (optional): add `THEYA_VISUAL=1`; the theme gets its own folder in `__visual__/<name>-light` and `<name>-dark`.

CI runs step 2 for `iris` and `lime` in both themes on every pull request and on `main`. A new theme is added to the `brand` matrix in `.github/workflows/ci.yml`.

## Limitations

- `data-brand` goes on `<html>`: shadcn variables (`--primary` and others) are computed at the root, so a profile on a nested element will not recolor them.
- A profile does not change chart colors (`--color-bg-chart-*`) or status colors.
- A theme does not set density — that is a separate layer (`data-density`, see DENSITY.md), and you can combine it with any theme.
- The typeface and radii, like the shadcn variables, work when `data-brand` is on `<html>`.
