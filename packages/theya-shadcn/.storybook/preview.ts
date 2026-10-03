import { createElement, Fragment, useEffect, useRef, useState } from 'react';
import type { Preview } from '@storybook/react-vite';
import { addons } from '@storybook/preview-api';
import { create, themes } from '@storybook/theming';
import { DocsContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks';
import { Toaster } from '../src/components/ui/sonner';
import '../src/styles/globals.css';

// Preload Geologica's Latin and Cyrillic files (one variable file each
// covers every weight) so the real font is already in the browser's
// cache by the time any story first renders text. Without this, the
// `font-display: swap` fallback-then-swap can land WHILE a Radix Popper
// menu is already open (autoUpdate's ResizeObserver sees the trigger's/
// content's text reflow and repositions), which is what caused the
// first-open jump. `?url` lets Vite resolve the real dev/build path
// instead of hand-guessing it.
import geologicaLatinUrl from '@theya/tokens/fonts/geologica/geologica-latin-wght-normal.woff2?url';
import geologicaCyrillicUrl from '@theya/tokens/fonts/geologica/geologica-cyrillic-wght-normal.woff2?url';
// Fira Code too: DropdownMenu/ContextMenu/Command shortcuts are the first
// font-mono text most stories render, so without a preload the face loads
// on the first menu open, the menu re-measures when it lands, and the open
// menu shifts by ~0.5px once (measured 02.10: y 53.5 -> 54 exactly when
// document.fonts went from loading to loaded). Products should preload it
// the same way.
import firaCodeUrl from '@fontsource/fira-code/files/fira-code-latin-400-normal.woff2?url';

if (typeof document !== 'undefined') {
  for (const href of [geologicaLatinUrl, geologicaCyrillicUrl, firaCodeUrl]) {
    if (document.head.querySelector(`link[rel="preload"][href="${href}"]`)) continue;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = href;
    document.head.appendChild(link);
  }
}

// ---------------------------------------------------------------------------
// Global light/dark theme, driven by the "Theme" toolbar tool registered in
// manager.ts (a whole-Storybook toggle, NOT the old per-story
// `withThemeByDataAttribute` decorator, which only ever re-themed the single
// story mounted in the Canvas and left the Docs-tab's own chrome — headings,
// prose, the Controls table — stuck light). manager.ts emits `theya/theme-
// changed` on the addons channel whenever it flips; this file listens on
// that same channel to (a) set `data-theme` on <html> for every view (story
// canvas, autodocs, MDX-only pages), which is what globals.css's
// `[data-theme="dark"]` selector actually keys off, and (b) re-theme the
// Docs container's own styled-components chrome via `ThemedDocsContainer`
// below, since that's a separate theming system from `data-theme`. See
// overview.md's "Storybook Docs-page dark theme" / "global theme toggle"
// open items for background on this approach.
const THEME_CHANGED = 'theya/theme-changed';
const THEME_STORAGE_KEY = 'theya-storybook-theme';
type StorybookTheme = 'light' | 'dark';

function storedTheme(): StorybookTheme {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function applyPreviewTheme(theme: StorybookTheme) {
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
}

if (typeof document !== 'undefined') {
  const channel = addons.getChannel();
  applyPreviewTheme(storedTheme());
  channel.on(THEME_CHANGED, (theme: StorybookTheme) => applyPreviewTheme(theme));
}

// Docs page + story preview blocks sit on our own surface-base token, not
// Storybook's built-in content color (#1b1c1d in its dark theme, so in
// dark mode every component was previewed on a background it never ships
// on). Docs render inside the preview iframe, where the token CSS vars are
// defined, so the theme can reference them directly — an earlier attempt
// set this from manager.ts, which has no access to the tokens.
const SURFACE = 'var(--color-bg-surface-bg-surface-base)';
const docsThemes = {
  light: create({ ...themes.light, base: 'light', appContentBg: SURFACE, appPreviewBg: SURFACE }),
  dark: create({ ...themes.dark, base: 'dark', appContentBg: SURFACE, appPreviewBg: SURFACE }),
};

function ThemedDocsContainer({ children, context }: DocsContainerProps) {
  const [theme, setTheme] = useState<StorybookTheme>(storedTheme);

  useEffect(() => {
    const update = (next: StorybookTheme) => setTheme(next);
    context.channel.on(THEME_CHANGED, update);
    return () => {
      context.channel.off(THEME_CHANGED, update);
    };
  }, [context]);

  return createElement(
    DocsContainer,
    { context, theme: theme === 'dark' ? docsThemes.dark : docsThemes.light },
    children
  );
}

// Toolbar control for the global Toaster's surface. Sonner only delivers a
// `toast()` call to the MOST RECENTLY MOUNTED `<Toaster/>` when more than one
// is mounted at once — so a per-story local `<Toaster dark/>` never actually
// wins over this global one (mounted after every Story in the Fragment
// below), it just silently eats the toast() calls meant for it. The dark/
// light choice has to live here, on the one global instance, not in
// individual stories. A story can still force one side deterministically
// (e.g. for a "Dark" demo story or for VRT) via `parameters: { toastTheme:
// 'dark' }`, which takes priority over the toolbar value below.
export const globalTypes = {
  toastTheme: {
    name: 'Toast theme',
    description: "Force the global Toaster onto the dark overlay surface (Tooltip's -on-dark tokens) instead of the theme-reactive light surface",
    defaultValue: 'light',
    toolbar: {
      icon: 'contrast',
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
      ],
    },
  },
};

// Autodocs pages render every exported story from a file together, each
// wrapped through this same decorator chain — so a naive `createElement(
// Toaster, ...)` here mounted one Toaster PER STORY on that combined page,
// giving axe N duplicate `<section aria-label="Notifications ...">`
// landmarks (landmark-unique, 2026-09-27). SingletonToaster below makes
// only the first-mounted instance on a given page actually render; if it
// later unmounts (navigating away), the guard resets so the next page's
// first instance can take over. A single story canvas (only one instance
// mounted) behaves exactly as before.
let activeToasterId = 0;
let nextToasterId = 0;

function SingletonToaster({ dark }: { dark: boolean }) {
  const idRef = useRef<number>();
  if (idRef.current === undefined) idRef.current = ++nextToasterId;
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const id = idRef.current!;
    if (activeToasterId === 0) {
      activeToasterId = id;
      setIsActive(true);
    }
    return () => {
      if (activeToasterId === id) {
        activeToasterId = 0;
      }
    };
  }, []);

  return isActive ? createElement(Toaster, { dark }) : null;
}

export const decorators = [
  // Mounted once globally so any story that fires `toast(...)` (SecretField's
  // copy confirmation, etc.) actually renders it. Individual stories should
  // NOT mount their own `<Toaster/>` any more — see the globalTypes comment
  // above for why a second instance doesn't do what it looks like it does.
  // `dark` comes from the toolbar control, overridable per-story via
  // `parameters.toastTheme`.
  (Story, context) => {
    const dark = (context.parameters.toastTheme ?? context.globals.toastTheme) === 'dark';
    return createElement(Fragment, null, createElement(Story), createElement(SingletonToaster, { dark }));
  },
];

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      container: ThemedDocsContainer,
    },
    options: {
      // A function (not the plain `{ order: [...] }` object form) so a
      // component's own Docs entry can be pinned first within its group —
      // the object form has no hook for that. Category order and
      // alphabetical-by-component sorting are reimplemented by hand here to
      // match what the object form gave us before. "Design System" is
      // first so Foundations (overview: tokens/typography/color/spacing
      // docs, not a component) sits at the very top of the sidebar, above
      // every component category — matches how a reference Storybook we looked at pins
      // its own "Foundations" group first.
      storySort: (a, b) => {
        const CATEGORY_ORDER = [
          'Design System',
          'Actions',
          'Text Input',
          'Selection',
          'Date & Time',
          'Files',
          'Form Structure',
          'Search & Filter',
          'Navigation',
          'Menus',
          'Overlays',
          'Status & Feedback',
          'Labels',
          'Data',
          'Charts',
          'Code',
          'AI & Chat',
          'Layout',
          'Patterns',
          'Patterns: Commerce',
          'Patterns: Catalog',
          'Patterns: Search',
          'Patterns: Account',
          'Patterns: Navigation',
        ];
        const [categoryA, componentA] = a.title.split('/');
        const [categoryB, componentB] = b.title.split('/');

        if (categoryA !== categoryB) {
          const ia = CATEGORY_ORDER.indexOf(categoryA);
          const ib = CATEGORY_ORDER.indexOf(categoryB);
          if (ia !== -1 && ib !== -1) return ia - ib;
          if (ia !== -1) return -1;
          if (ib !== -1) return 1;
          return categoryA.localeCompare(categoryB);
        }

        if (componentA !== componentB) {
          return componentA.localeCompare(componentB);
        }

        // Same component group: Docs first, everything else in natural
        // (file/export) order.
        const isDocsA = a.tags?.includes('docs') || a.name === 'Docs';
        const isDocsB = b.tags?.includes('docs') || b.name === 'Docs';
        if (isDocsA && !isDocsB) return -1;
        if (!isDocsA && isDocsB) return 1;
        return 0;
      },
    },
  },
};

export default preview;
