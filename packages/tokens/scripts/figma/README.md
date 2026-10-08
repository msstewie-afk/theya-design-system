# Figma variable sync

Keeps the Figma variables in file `nDNke2R7fqqFFCrRy1ilBy` (Theya Design System) in sync with
`src/primitive`, `src/semantic` and `src/code`. The code is the source of truth.

## Workflow

```bash
npm run figma:check   # read-only: missing / diff / extra per collection
npm run figma:sync    # update diffs, create missing variables (never deletes)
```

Each command writes `build/figma/payload.json` and then `build/figma/{check,sync}.js`.
Paste the generated JS into the Figma MCP `use_figma` tool (skill `figma-use`), or
run it in the Figma plugin console. The script returns a JSON report.

## Files

- `../figma-payload.mjs` flattens the token JSON into collections `1.`–`6.` with
  modes, aliases (`@path`, `@size:`, `@typo:`) and normalized hex colors.
- `../figma-run.mjs` concatenates payload + `lib.js` + action into one script.
- `lib.js` holds the shared helpers: slug matching (Figma groups use spaces, code uses
  dashes), alias resolution, value comparison and WEB codeSyntax names.
- `check.js` is read-only.
- `sync.js` changes values, creates missing variables (scopes copied from a
  sibling) and sets codeSyntax. It never deletes; extras are only reported.

## Conventions

- Matching is by slug: lowercase, commas/whitespace → `-`, other punctuation dropped.
- Variables under `_legacy/` are ignored and stay hidden from pickers.
- Figma-only variables kept on purpose: `icon/icon-warning-bright`, `size1`, `size2`,
  `padding/padding--3xs`, `padding/padding--2xs`, `gap/gap--2xs`.
- Primitives are hidden (`scopes = []`); semantic tokens are scoped by role
  (text → text fill, border → stroke, bg → frame/shape fill, focus → effect color).
