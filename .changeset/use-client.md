---
"@theya/shadcn": minor
---

Works in React Server Components (Next.js App Router): every module that needs the browser — hooks, event handlers, context, Radix and other client libraries — now starts with `'use client'`, so server components can import Theya directly. `pnpm api:check` (and CI) fails when a client module is missing the directive.
