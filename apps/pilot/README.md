# Pilot: Theya outside the monorepo

A small Next.js (App Router, React 19) app that installs `@theya/shadcn` the
way an outside app would: from the packed tarball, not through
`workspace:*`. It is excluded from the pnpm workspace and uses npm.

The scenario is a client proofing portal on Aether (the demo theme): Rhea
opens an album from Selene Weddings, picks photos up to the album's limit,
leaves a note on a photo and sends the selection for retouching.

## Run

From `apps/pilot`:

```
npm run theya
```

builds the tokens, packs the package (its `prepack` builds `dist/`) and
installs the tarball. Then:

```
npm run build
```

```
npm run start
```

and open http://localhost:5190.

## What it checks

- No `transpilePackages`, no aliases: the compiled package works as is.
- Server components import Theya directly; each Theya module carries its
  own `'use client'`.
- One stylesheet: `@import '@theya/shadcn/styles/globals.css'` brings
  Tailwind, the tokens, the fonts and the `@source` for the package.
- Theme and density survive a reload: `<ThemeScript defaultTheme="system" />`
  in `layout.tsx` applies them before the first paint.

The findings are in the project doc `claude/pilot-2026-11-01.md`.
