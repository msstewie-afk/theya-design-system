**English** · [Русский](GETTING-STARTED.ru.md)

# Getting started

How to use Theya in a React app. The smallest working example is [`apps/sandbox`](apps/sandbox): one CSS line, a few imports, nothing else.

## Requirements

- React 18.3 or 19 (a peer dependency: the app provides it).
- Tailwind CSS v4. Theya's stylesheet imports Tailwind itself and tells it to scan the components (`@source`), so the app does not configure Tailwind for Theya.
- A bundler that understands package `exports`: Vite, Next.js, or anything modern. Components carry `'use client'`, so they work in the Next.js App Router as client components.
- Node 22 and pnpm for the repository itself.

The packages are not on npm yet. An app inside this repository (`apps/*`) depends on them through the workspace:

```json
{ "dependencies": { "@theya/shadcn": "workspace:*" } }
```

## 1. Styles

One line in the app's CSS:

```css
@import '@theya/shadcn/styles/globals.css';
```

It brings Tailwind, the tokens (light, dark, product themes, density), the fonts (Geologica, Fira Code; Onest and Manrope load only when their theme is active) and the component styles. Without it, components render unstyled.

With Vite, add `@tailwindcss/vite` and keep a single copy of React:

```ts
// vite.config.ts
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default {
  plugins: [react(), tailwindcss()],
  resolve: { dedupe: ['react', 'react-dom'] },
};
```

## 2. Components

Every component has its own import path:

```tsx
import { Button } from '@theya/shadcn/ui/button';
import { TextField } from '@theya/shadcn/ui/text-field';
import { Toaster, toast } from '@theya/shadcn/ui/sonner';
import { WorkspaceLayout } from '@theya/shadcn/blocks/workspace-layout';
```

- `ui/*` — components (Button, TextField, DataTable…);
- `blocks/*` — page patterns (layouts, settings, commerce, catalog…);
- `lib/*` — helpers: dictionaries (`lib/i18n`, `lib/locale-ru`…), `cn`.

Which component to pick and how to use it is on its Docs page in Storybook: when to use it, what to use instead, anatomy, accessibility, do / don't, props. The same, as JSON, is in `packages/theya-shadcn/spec/` (see [AI.md](AI.md)).

```tsx
import { useState } from 'react';

export function AddSite() {
  const [domain, setDomain] = useState('');
  return (
    <>
      <TextField label="Domain" placeholder="example.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
      <Button onClick={() => toast.success(`${domain} added`)}>Add site</Button>
      <Toaster />
    </>
  );
}
```

Mount `<Toaster />` once, near the root; `toast()` works anywhere after that.

## 3. Page background and text

Give the page the base surface and text color, so dark mode switches everything:

```tsx
<body className="bg-[var(--color-bg-surface-bg-surface-base)] font-body text-[var(--color-text-text)]">
```

Use tokens for your own layout too: `var(--color-…)`, `var(--size-…)`. A hex color in app code doesn't follow the theme. All tokens are listed on the Design System / Foundations pages in Storybook.

## 4. Light and dark

The theme is an attribute on `<html>`:

```html
<html data-theme="dark">
```

- `ThemeToggle` (`ui/theme-toggle`) is a ready-made switch.
- `useTheme()` (`ui/use-theme`) reads and sets it from your own code: `const { resolvedTheme, setTheme } = useTheme()`.
- Theya does not remember the choice. Store it in your product (user setting, cookie) and set the attribute again on load, before the first paint, so the page doesn't flash light.

## 5. Product theme and density

Two more attributes, combinable with each other and with `data-theme`:

```html
<html data-brand="iris" data-density="compact">
```

- `data-brand`: `iris` or `lime` instead of Theya's own look; or your own theme ([PROFILES.md](PROFILES.md)). Put it on `<html>`.
- `data-density`: `compact`, `default` (no attribute) or `comfortable` — on `<html>` or on one region, such as a dense table ([DENSITY.md](DENSITY.md)). `DensityToggle` and `useDensity()` work like their theme counterparts.

## 6. Language

Components have built-in strings (screen-reader labels, placeholders, announcements). English without a provider; for another language, wrap the app once:

```tsx
import { TheyaLocaleProvider } from '@theya/shadcn/lib/i18n';
import { ruLocale } from '@theya/shadcn/lib/locale-ru';

<TheyaLocaleProvider {...ruLocale} syncDocument>
  <App />
</TheyaLocaleProvider>
```

Ready: English, Russian, German, Arabic (right-to-left), Chinese. Details and how to add a string: [LOCALIZATION.md](LOCALIZATION.md).

## 7. TypeScript

The app type-checks Theya's sources too. Add `@types/node` and `"types": ["node"]`: the components guard dev-only warnings with `process.env.NODE_ENV`, which every bundler replaces at build time.

## Checklist

- [ ] `@import '@theya/shadcn/styles/globals.css'` in the app's CSS
- [ ] Tailwind v4 plugin in the bundler; one copy of React
- [ ] page background and text from tokens
- [ ] `<Toaster />` once, near the root (if you use toasts)
- [ ] `data-theme` set from the stored choice before the first paint
- [ ] `TheyaLocaleProvider` with `syncDocument` for a language other than English
- [ ] texts follow [WRITING.md](WRITING.md)

## Where to go next

| | |
|---|---|
| Storybook (`cd packages/theya-shadcn && pnpm storybook`) | every component, its guidelines, props and accessibility status |
| [WRITING.md](WRITING.md) | how to write labels, errors and empty states |
| [PROFILES.md](PROFILES.md) | product themes, and how to make one |
| [DENSITY.md](DENSITY.md), [LOCALIZATION.md](LOCALIZATION.md) | density modes; languages |
| [CONTRIBUTING.md](CONTRIBUTING.md) | changing Theya itself |
