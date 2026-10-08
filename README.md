# Theya

A React design system built on [shadcn/ui](https://ui.shadcn.com) — Radix primitives and Tailwind CSS v4 — with its own tokens, guidelines and tests.

- **156 components** in 18 categories, plus **48 page patterns** (layouts, lists, settings, commerce, catalog, search, account, navigation)
- **Tokens** from a primitive → semantic pipeline, exported to CSS, JS, Tailwind and W3C Design Tokens
- **Theming** with one attribute each: light/dark, three brand themes, three density modes
- **Accessibility** checked on every story in both themes, with a WCAG 2.2 AA matrix per component
- **Five languages** for the components' built-in strings, including right-to-left Arabic
- **Machine-readable docs** for coding agents: JSON spec, `llms.txt` and an MCP server

Designed and built by Maria Matsko as a personal project.

## What's in the repo

| Package | What it is |
|---|---|
| [`packages/tokens`](packages/tokens) | Design tokens (Style Dictionary v4): primitive palette and scales, semantic layer, light and dark themes, brand profiles, density |
| [`packages/theya-shadcn`](packages/theya-shadcn) | `@theya/shadcn`: components, patterns, styles, Storybook, tests, generated spec and API report |
| [`apps/sandbox`](apps/sandbox) | A small Vite app that uses the package from source, to check it works outside Storybook |

## Getting started

Requires Node 22 and pnpm (CI uses pnpm 11).

```bash
pnpm install
pnpm build:tokens
git config core.hooksPath .githooks   # quality gate on every commit

cd packages/theya-shadcn
pnpm storybook                        # http://localhost:6008
```

Use it in an app (see `apps/sandbox`):

```css
/* Tailwind, tokens, fonts and component styles in one import */
@import '@theya/shadcn/styles/globals.css';
```

```tsx
import { Button } from '@theya/shadcn/ui/button';
import { TextField } from '@theya/shadcn/ui/text-field';
import { WorkspaceLayout } from '@theya/shadcn/blocks/workspace-layout';
```

The packages are not on npm yet; apps in `apps/*` take them from source through the pnpm workspace.

## Foundations

**Tokens.** Every semantic token is a reference to a primitive (`{color.blue.blue-500}`), never a copied value. One source builds CSS custom properties, JS/TS, a Tailwind theme, and W3C DTCG / Tokens Studio files for Figma Variables. A build check confirms that every DTCG value matches its CSS counterpart.

**Theming.** Everything switches by attribute on `<html>` or any container, with no component changes:

```html
<html data-theme="dark" data-brand="iris" data-density="compact">
```

- `data-theme` — light or dark
- `data-brand` — Theya (default), Iris or Lime: primary color, neutrals, surfaces, typeface and radii, separately tuned for light and dark ([PROFILES.md](PROFILES.md))
- `data-density` — compact, default or comfortable: controls, table rows, menu items and spacing ([DENSITY.md](DENSITY.md))

**Components.** Actions, text input, selection, date and time, files, form structure, search and filter, navigation, menus, overlays, status and feedback, labels, data, charts, code, AI and chat, layout, motion. Each component ships with guidelines — when to use it, when to use something else instead, anatomy, accessibility notes and do/don't pairs — shown on its Docs page in Storybook.

## Accessibility

- Every one of the 1,000+ stories runs axe in light and dark themes; play tests cover keyboard paths and focus management.
- An accessibility matrix maps the 55 WCAG 2.2 AA criteria to each component: automated coverage, keyboard tests, reduced motion, High Contrast mode, screen-reader checks and accepted exceptions. It is generated from the tests and code, not written by hand, and shown on each component's Docs page.
- Reduced motion and High Contrast: motion has `prefers-reduced-motion` fallbacks, components that need it have `forced-colors` styles, and visual tests have a separate High Contrast run.

## Localization

Built-in strings (screen-reader labels, placeholders, announcements) come from a dictionary: English, Russian, German, Arabic (right-to-left) and Chinese, plus a pseudo-locale for catching hard-coded and truncated text. Details in [LOCALIZATION.md](LOCALIZATION.md).

## For coding agents

Generated from the sources on every change:

- `spec/` — one JSON record per component: import path, guidelines, props with types and defaults, do/don't examples, story links
- `public/llms.txt` and `llms-full.txt`
- an MCP server (`packages/theya-shadcn/mcp/server.mjs`, zero dependencies) that lets an agent find the right component, read its guidelines and props, and look up tokens; wired up in `.mcp.json`

More in [AI.md](AI.md).

## Quality

- **Pre-commit gate** (`.githooks/pre-commit`): type check, no raw hex colors in components, generated spec up to date
- **Tests** ([TESTING.md](TESTING.md)): play + axe in both themes, visual regression in both themes and at phone widths, React 18 and 19
- **CI** (GitHub Actions): checks on every push; Storybook tests and visual regression on pull requests and weekly
- **Public API report** (`packages/theya-shadcn/api/`): every exported type and default, so API changes show up in review
- **Versioning** with Changesets, 0.x semver ([RELEASING.md](RELEASING.md))

## Docs

| Guide | Topic | Русский |
|---|---|---|
| [TESTING.md](TESTING.md) | Running behaviour, accessibility and visual tests | [TESTING.ru.md](TESTING.ru.md) |
| [PROFILES.md](PROFILES.md) | Brand themes and how to add one | [PROFILES.ru.md](PROFILES.ru.md) |
| [DENSITY.md](DENSITY.md) | Density modes | [DENSITY.ru.md](DENSITY.ru.md) |
| [LOCALIZATION.md](LOCALIZATION.md) | Built-in strings and locales | [LOCALIZATION.ru.md](LOCALIZATION.ru.md) |
| [TOKENS-EXPORT.md](TOKENS-EXPORT.md) | DTCG and Tokens Studio export | [TOKENS-EXPORT.ru.md](TOKENS-EXPORT.ru.md) |
| [AI.md](AI.md) | Spec, llms.txt and the MCP server | [AI.ru.md](AI.ru.md) |
| [RELEASING.md](RELEASING.md) | Versioning and changelogs | [RELEASING.ru.md](RELEASING.ru.md) |

Every guide is in English and Russian.

## License

All rights reserved — the repository is public for viewing, not for reuse. See [LICENSE](LICENSE). Parts adapted from open-source projects keep their own licenses ([third-party notices](packages/theya-shadcn/THIRD-PARTY-NOTICES.md)).
