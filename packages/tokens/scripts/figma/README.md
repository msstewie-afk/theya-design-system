# Figma variable sync

Keeps the Figma variables in file `LPj5ZGhCmC2OEwXJPF7isw` (THEIA) in sync with
`src/primitive`, `src/semantic` and `src/code`. The code is the source of truth.

Collections are named without numbers since 2026-11-14 (Color Primitive
Variables, Theme, Size Primitive Variables, Size Semantic Variables, Primitive
Typography, Semantic Typography Variables, Density, Breakpoint). The scripts and
`figma-run --only` still use the short keys `1.` … `7.` (`payload.collectionNames`
maps them; `2.` is Theme); a collection still named `<key> <name>` is found as
well. There is no Brand collection any more (see below).

## Workflow

```bash
npm run figma:check   # read-only: missing / diff / extra per collection
npm run figma:sync    # update diffs, create missing variables (never deletes)
```

Each command writes `build/figma/payload.json` and then `build/figma/{check,sync}.js`.
Paste the generated JS into the Figma MCP `use_figma` tool (skill `figma-use`), or
run it in the Figma plugin console. The script returns a JSON report.

## Brand themes

Brands (`src/profiles/*.json`) reach Figma as modes, from the built values in
`build/css/profiles.json`:

- colors: modes of `2.` — `<brand>` and `<brand> dark` beside `default` / `dark`.
  A mode a profile leaves alone is not in the payload; `want()` in `lib.js` falls
  back to Theya's value in the same theme.
- radii, font families, weights and the radius roles (`theme-radius/field`,
  `theme-radius/button`): in Theme too, as `brand/<name>` (since 2026-11-14;
  before that a separate collection "9. Brand"), so one mode switch (ember,
  ember dark…) changes colours, fonts and radii together. Theya's value sits in
  `default` and `dark`, a brand's in `<brand>` and `<brand> dark`. The variables
  of `4.`, `5.`, `6.` a profile overrides alias `brand/<same name>` (`@brand:` in
  the payload); those collections get no modes. `payload.brandMoved` lists them
  (Theme also has the colours `brand/brand` and `brand/values-panel`, which are
  not brand variables). Density (`7.`) and brand never drive the same variable:
  `figma-payload.mjs` stops if one would.
- component text steps (`componentText` in a profile, e.g. Ember's drawer
  description in body M): `brand/theme-text/<part>/size` and `/line-height`,
  Theya's value the part's own step; the component's text node binds them, so
  the text style stays and the size follows the mode.

## Shadows

Effect styles have no modes, so each layer of `--elevation-xs … xl, edge-up`
gets a colour variable `elevation/<step>/layer-<n>` in `2.` (scope effect
colour), and the effect style `Elevation/<step>` binds each layer's colour to it.
The tint follows the mode: indigo slate in Theya, warm in Ember (the profile's
`shadow` re-hue), black and the white ring in dark. A layer's geometry (offset,
blur, spread) cannot change per mode, so a step has the union of its light and
dark layers, and a layer one theme lacks is transparent there (`md`: dark adds a
1px ring). `sync` rebuilds a style whose layers or bindings differ; `check`
lists them under `effects`. Both do this only in the part that holds `2.`.

`use_figma` takes at most 50 000 characters, more than the whole payload, so the
scripts run in two parts:

```bash
npm run figma:parts   # build/figma/{check,sync}-2-brand.js, -2-not-brand.js, -1-3-4-5-6-7.js
npm run figma:test    # the same, then a dry run against a mock variables API
```

Theme is over the 50 000-character limit as one script, so it runs in two parts
(`--vars=brand/` and `--vars=!brand/`; a part does not report the other part's
variables as extra). On a first sync run `-2-brand` before `-1-3-4-5-6-7`, whose
aliases point into it. `sync` adds missing modes; before any write it probes the file's mode
limit with a throwaway collection and stops, unchanged, if the plan allows fewer
modes than `2.` needs. `check` returns `ok: false` while a collection, mode or
value is missing or differs.

## Files

- `../figma-payload.mjs` flattens the token JSON into collections `1.`–`7.` with
  modes, aliases (`@path`, `@size:`, `@typo:`, `@density:`) and normalized hex colors.
  `Density` comes from `src/density/*.json` (modes Default / Compact / Comfortable);
  the control sizes it overrides are aliased from `4.` (`@density:`), so a frame's
  Density mode resizes components the way its color mode switches the theme.
- `Breakpoint` (modes 360 / 768 / 1440) is not checked: its values are the
  `clamp()` results of `packages/theya-shadcn/src/styles/display-scale.css`, which
  is not a token file yet. Change both together.
- `../figma-run.mjs` concatenates payload + `lib.js` + action into one script.
- `lib.js` holds the shared helpers: slug matching (Figma groups use spaces, code uses
  dashes), alias resolution, value comparison and WEB codeSyntax names.
- `check.js` is read-only.
- `sync.js` changes values, creates missing variables (scopes copied from a
  sibling) and sets codeSyntax. It never deletes; extras are only reported.
- Figma-only variables kept on purpose are listed in `figmaOnly` in
  `../figma-payload.mjs` (negative spacing for overlaps). The reports show them
  under `figmaOnly`, not `extra`, so a clean file reads 0 / 0 / 0.

## Conventions

- Matching is by slug: lowercase, commas/whitespace → `-`, other punctuation dropped.
- Variables under `_legacy/` are ignored and stay hidden from pickers.
- Figma-only variables kept on purpose: `icon/icon-warning-bright`, `size1`, `size2`,
  `padding/padding--3xs`, `padding/padding--2xs`, `gap/gap--2xs`.
- Palettes are never trimmed, in code or in Figma: an unused step may serve another
  system (Maria, 2026-11-08). A step missing from code is added to code, not marked
  Figma-only.
- Primitives are hidden (`scopes = []`); semantic tokens are scoped by role
  (text → text fill, border → stroke, bg → frame/shape fill, focus → effect color).
