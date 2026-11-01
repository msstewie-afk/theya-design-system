---
'@theya/shadcn': minor
---

The package can now be installed outside the monorepo. `pnpm pack` / `pnpm publish` build `dist/` (one JS + `.d.ts` file per module, each keeping its `'use client'`) and swap `exports` for `publishConfig.exports`, which point there. `@theya/shadcn/styles/globals.css` in the tarball carries the token CSS and fonts itself and tells the app's Tailwind to scan `dist/`. `tailwindcss ^4` is now a peer dependency. Inside the workspace nothing changes: `exports` still point at the sources.
