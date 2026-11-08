# Figma variable sync

Keeps the Figma variables in file `LPj5ZGhCmC2OEwXJPF7isw` (THEIA) in sync with
`src/primitive`, `src/semantic` and `src/code`. The code is the source of truth.

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
  `theme-radius/button`): collection `9. Brand`, modes `theya` / `<brand>…`. The
  variables of `4.`, `5.`, `6.` a profile overrides alias the same-named variable
  in `9.` (`@brand:`); those collections get no modes. Density (`7.`) and brand
  never drive the same variable: `figma-payload.mjs` stops if one would.

`use_figma` takes at most 50 000 characters, more than the whole payload, so the
scripts run in two parts:

```bash
npm run figma:parts   # build/figma/{check,sync}-2.js and -9-1-3-4-5-6-7.js
npm run figma:test    # the same, then a dry run against a mock variables API
```

Run `-9-…` before `-2.` on a first sync (either order works after that). `sync`
creates `9. Brand` and missing modes; before any write it probes the file's mode
limit with a throwaway collection and stops, unchanged, if the plan allows fewer
modes than `2.` needs. `check` returns `ok: false` while a collection, mode or
value is missing or differs.

## Files

- `../figma-payload.mjs` flattens the token JSON into collections `1.`–`7.` with
  modes, aliases (`@path`, `@size:`, `@typo:`, `@density:`) and normalized hex colors.
  `7. Density` comes from `src/density/*.json` (modes Default / Compact / Comfortable);
  the control sizes it overrides are aliased from `4.` (`@density:`), so a frame's
  Density mode resizes components the way its color mode switches the theme.
- `8. Breakpoint` (modes 360 / 768 / 1440) is not checked: its values are the
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
  `padding/padding--3xs`, `padding/padding--2xs`, `gap/gap--2xs`; palette steps code
  does not have — `red/red-850`, `orange/orange-850`, the `azure` ramp. Palettes are
  never trimmed: an unused step may serve another system.
- Primitives are hidden (`scopes = []`); semantic tokens are scoped by role
  (text → text fill, border → stroke, bg → frame/shape fill, focus → effect color).
