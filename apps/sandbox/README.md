# @theya/sandbox

A playground app that uses `@theya/shadcn` straight from source through the pnpm workspace. Changes in the DS show up here immediately.

```
pnpm install
pnpm --filter @theya/sandbox dev
```

Opens on http://localhost:5180.

## How an app uses the DS

- Dependency: `"@theya/shadcn": "workspace:*"`.
- Components: `import { Button } from '@theya/shadcn/ui/button'`; blocks from `@theya/shadcn/blocks/...`, helpers from `@theya/shadcn/lib/...`.
- Styles: one line in the app's CSS — `@import '@theya/shadcn/styles/globals.css';`. It brings Tailwind, tokens, fonts and tells Tailwind to scan the DS sources (`@source`).
- Vite: `@vitejs/plugin-react`, `@tailwindcss/vite`, and `resolve.dedupe: ['react', 'react-dom']`.
- React is a peer dependency of the DS: the app provides it.
- TypeScript: the app type-checks DS sources too, so it needs `@types/node` and `"types": ["node"]` — the DS guards dev-only warnings with `process.env.NODE_ENV`, which every bundler replaces at build time.
