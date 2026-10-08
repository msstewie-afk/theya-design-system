import { createElement, Fragment, useEffect, useRef, useState } from 'react';
import type { Preview } from '@storybook/react-vite';
import { addons } from '@storybook/preview-api';
import { GLOBALS_UPDATED, SET_GLOBALS } from 'storybook/internal/core-events';
import { create, themes } from '@storybook/theming';
import { DocsContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks';
import { Toaster } from '../src/components/ui/sonner';
import { DocsPage } from './docs-page';
import { configure } from '@storybook/test';
import { TheyaLocaleProvider, pseudoLocalize, en, type TheyaLocaleBundle } from '../src/lib/i18n';
import { ruLocale } from '../src/lib/locale-ru';
import { deLocale } from '../src/lib/locale-de';
import { arLocale } from '../src/lib/locale-ar';
import { zhLocale } from '../src/lib/locale-zh';
import '../src/styles/globals.css';
import './preview.css';

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

// waitFor/findBy in play tests give up after 5 s instead of 1 s. Passing
// tests don't wait any longer; slow ones stop failing at random on a loaded
// CI runner (first CI runs: a different 2–3 of 951 stories timed out each
// time — focus, scroll and effect-driven values settling after 1 s).
configure({ asyncUtilTimeout: 5000 });

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
// Light/dark theme: the `theme` global (toolbar switch, see globalTypes
// below). Storybook sends the current globals on load (SET_GLOBALS) and
// again whenever they change or a story with its own globals is selected
// (GLOBALS_UPDATED); both arrive here before the story renders. Listening
// at module level, not in a decorator, covers every view the same way:
// story canvas, autodocs and MDX-only pages that render no story at all.
// globals.css keys off `[data-theme="dark"]` on <html>; the Docs page's own
// chrome (headings, prose, Controls table) is themed separately by
// ThemedDocsContainer below. A story can pin a theme with
// `globals: { theme: 'dark' }`.
type ThemeName = 'light' | 'dark';

let currentTheme: ThemeName = 'light';
const themeSubscribers = new Set<(theme: ThemeName) => void>();

function applyTheme(value: unknown) {
  const theme: ThemeName = value === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
  if (theme === currentTheme) return;
  currentTheme = theme;
  themeSubscribers.forEach((notify) => notify(theme));
}

if (typeof document !== 'undefined') {
  const channel = addons.getChannel();
  const onGlobals = ({ globals }: { globals: Record<string, unknown> }) => applyTheme(globals.theme);
  channel.on(SET_GLOBALS, onGlobals);
  channel.on(GLOBALS_UPDATED, onGlobals);
}

// Docs page + story preview blocks sit on our own surface-base token, not
// Storybook's built-in content color (#1b1c1d in its dark theme, so in
// dark mode every component was previewed on a background it never ships
// on). Docs render inside the preview iframe, where the token CSS vars are
// defined, so the theme can reference them directly.
const SURFACE = 'var(--color-bg-surface-bg-surface-base)';
const docsThemes = {
  light: create({ ...themes.light, base: 'light', appContentBg: SURFACE, appPreviewBg: SURFACE }),
  dark: create({ ...themes.dark, base: 'dark', appContentBg: SURFACE, appPreviewBg: SURFACE }),
};

function ThemedDocsContainer({ children, context }: DocsContainerProps) {
  const [theme, setTheme] = useState<ThemeName>(currentTheme);

  useEffect(() => {
    setTheme(currentTheme);
    themeSubscribers.add(setTheme);
    return () => {
      themeSubscribers.delete(setTheme);
    };
  }, []);

  return createElement(DocsContainer, { context, theme: docsThemes[theme] }, children);
}

// Toolbar control for the global Toaster's surface. Sonner only delivers a
// `toast()` call to the MOST RECENTLY MOUNTED `<Toaster/>` when more than one
// is mounted at once — so a per-story local `<Toaster dark/>` never actually
// wins over this global one (mounted after every Story in the Fragment
// below), it just silently eats the toast() calls meant for it. The dark/
// light choice has to live here, on the one global instance, not in
// individual stories. A story can still force one side deterministically
// (e.g. for a "Dark" demo story or for VRT) via `parameters: { toastTheme:
// 'dark' }`. There is no toolbar switch for it: next to the real light/dark
// theme toggle it read as a second theme switch.
// Language of the strings components render themselves (see src/lib/i18n.ts).
// Pseudo makes every built-in string longer and accented — anything still
// plain English is hard-coded; anything cut off doesn't survive translation.
// Arabic also flips the page to right-to-left.
const LOCALES: Record<string, TheyaLocaleBundle> = {
  en: { locale: 'en-US', messages: en, dir: 'ltr' },
  ru: ruLocale,
  de: deLocale,
  ar: arLocale,
  zh: zhLocale,
  pseudo: { locale: 'en-US', messages: pseudoLocalize(en), dir: 'ltr' },
};

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Light or dark theme for components and Docs pages',
    defaultValue: 'light',
    toolbar: {
      icon: 'mirror',
      dynamicTitle: true,
      items: [
        { value: 'light', icon: 'sun', title: 'Light' },
        { value: 'dark', icon: 'moon', title: 'Dark' },
      ],
    },
  },
  locale: {
    name: 'Language',
    description: 'Language of the built-in component strings',
    defaultValue: 'en',
    toolbar: {
      icon: 'globe',
      dynamicTitle: true,
      items: [
        { value: 'en', title: 'English' },
        { value: 'ru', title: 'Русский' },
        { value: 'de', title: 'Deutsch' },
        { value: 'ar', title: 'العربية (RTL)' },
        { value: 'zh', title: '中文' },
        { value: 'pseudo', title: 'Pseudo [Éñĝļîšĥ ~~]' },
      ],
    },
  },
  // Product profile (packages/tokens/src/profiles/*.json → profiles.css):
  // recolors the primary ramp via <html data-brand>, see THEMING.md.
  brand: {
    name: 'Brand',
    description: 'Theme: Theya, Iris or Lime',
    defaultValue: 'theya',
    toolbar: {
      icon: 'paintbrush',
      dynamicTitle: true,
      items: [
        { value: 'theya', title: 'Theya' },
        { value: 'iris', title: 'Iris' },
        { value: 'lime', title: 'Lime' },
      ],
    },
  },
  // Density mode (packages/tokens/src/density → density.css) via
  // <html data-density>, see DENSITY.md.
  density: {
    name: 'Density',
    description: 'Size of controls, table rows and menu items',
    defaultValue: 'default',
    toolbar: {
      icon: 'component',
      dynamicTitle: true,
      items: [
        { value: 'compact', title: 'Compact' },
        { value: 'default', title: 'Default density' },
        { value: 'comfortable', title: 'Comfortable' },
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
  const idRef = useRef<number | undefined>(undefined);
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
  // `dark` comes from the story's `parameters.toastTheme` (default light).
  (Story, context) => {
    const dark = context.parameters.toastTheme === 'dark';
    const bundle = LOCALES[context.globals.locale as string] ?? LOCALES.en;
    if (typeof document !== 'undefined') {
      document.documentElement.lang = bundle.locale;
      document.documentElement.dir = bundle.dir;
      const brand = context.globals.brand as string | undefined;
      if (brand && brand !== 'theya') document.documentElement.dataset.brand = brand;
      else delete document.documentElement.dataset.brand;
      const density = context.globals.density as string | undefined;
      if (density && density !== 'default') document.documentElement.dataset.density = density;
      else delete document.documentElement.dataset.density;
    }
    return createElement(
      TheyaLocaleProvider,
      bundle,
      createElement(Fragment, null, createElement(Story), createElement(SingletonToaster, { dark })),
    );
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
    // Viewport tool in the toolbar: the two mobile widths Theya targets
    // (same as THEYA_VIEWPORT in the test runner), plus tablet/desktop.
    viewport: {
      viewports: {
        android360: { name: 'Android · 360', styles: { width: '360px', height: '800px' }, type: 'mobile' },
        iphone375: { name: 'iPhone · 375', styles: { width: '375px', height: '812px' }, type: 'mobile' },
        tablet768: { name: 'Tablet · 768', styles: { width: '768px', height: '1024px' }, type: 'tablet' },
        desktop1280: { name: 'Desktop · 1280', styles: { width: '1280px', height: '800px' }, type: 'desktop' },
      },
    },
    docs: {
      container: ThemedDocsContainer,
      // Standard autodocs blocks + use-guidelines (parameters.guidelines).
      page: DocsPage,
    },
    options: {
      // A function (not the plain `{ order: [...] }` object form) so a
      // component's own Docs entry can be pinned first within its group —
      // the object form has no hook for that. Category order and
      // alphabetical-by-component sorting are reimplemented by hand here to
      // match what the object form gave us before. "Design System" is
      // first so Foundations (overview: tokens/typography/color/spacing
      // docs, not a component) sits at the very top of the sidebar, above
      // every component category.
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
