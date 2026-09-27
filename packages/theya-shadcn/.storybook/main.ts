import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

/**
 * Mirrors the old @theya/components Storybook setup (same framework,
 * same addons) — just pointed at the new shadcn-based source, plus:
 * - @tailwindcss/vite so Tailwind v4 actually processes globals.css
 * - a `@` → `src` alias, since button.tsx (and everything after it)
 *   imports via `@/lib/utils` per shadcn convention
 */
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)', '../src/**/*.mdx'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-essentials',
    // Interaction/play-function testing infra (2026-09-26) — mechanism
    // only for now: no play functions written yet, this just makes the
    // addon panel + play-fn runtime available for the next pass to use.
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(viteConfig) {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: {
        ...(viteConfig.resolve?.alias ?? {}),
        '@': fileURLToPath(new URL('../src', import.meta.url)),
      },
    };
    return viteConfig;
  },
};

export default config;
