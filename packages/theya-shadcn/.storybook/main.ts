import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';

/**
 * Storybook for the shadcn-based source, plus:
 * - @tailwindcss/vite so Tailwind v4 actually processes globals.css
 *
 * No `@` → `src` alias any more (2026-10-04): source files import each
 * other by relative path, so they resolve the same way when an app in
 * apps/* imports them through the package's exports. An alias here would
 * let new `@/` imports work in Storybook and then break in every app.
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
    // Components carry 'use client' for Next.js App Router apps; a plain
    // Vite bundle ignores it and Rollup warns once per file. Drop that
    // one warning so real ones stay visible in build logs.
    viteConfig.build ??= {};
    viteConfig.build.rollupOptions ??= {};
    const onwarn = viteConfig.build.rollupOptions.onwarn;
    viteConfig.build.rollupOptions.onwarn = (warning, warn) => {
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) return;
      if (onwarn) onwarn(warning, warn);
      else warn(warning);
    };
    return viteConfig;
  },
};

export default config;
