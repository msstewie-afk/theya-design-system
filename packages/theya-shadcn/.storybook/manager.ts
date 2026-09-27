import * as React from 'react';
import { MoonIcon, SunIcon } from '@storybook/icons';
import { IconButton } from '@storybook/components';
import { addons, types, useAddonState } from '@storybook/manager-api';
import { themes } from '@storybook/theming';

// Global light/dark toggle for the WHOLE Storybook chrome (manager UI +
// preview iframe + Docs-tab chrome) — not the per-story `theme` toolbar
// global from @storybook/addon-themes' `withThemeByDataAttribute`, which
// only ever re-themes the story currently mounted in the Canvas. This is a
// separate, addons-channel-driven mechanism of its own, so switching it
// repaints everything at once, Docs pages
// included. See overview.md open items: "Storybook Docs-page dark theme"
// and "global theme toggle for the whole Storybook, not per-story".
const ADDON_ID = 'theya/theme';
const TOOL_ID = `${ADDON_ID}/tool`;
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

// The manager chrome (sidebar + toolbar) is pinned to dark regardless of
// the toggle below — Мария wants a dark nav even while previewing
// components in light theme, so this is intentionally NOT wired to
// `theme`. Only the preview iframe + Docs container (see preview.ts)
// follow the toggle. Revert to `theme === 'dark' ? themes.dark :
// themes.light` if she wants the chrome to follow the toggle again.
function applyManagerTheme(_theme: StorybookTheme) {
  addons.setConfig({
    theme: themes.dark,
  });
}

function ThemeTool() {
  const [theme, setTheme] = useAddonState<StorybookTheme>(TOOL_ID, storedTheme());

  React.useEffect(() => {
    applyManagerTheme(theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Persistence is optional; the current session still switches correctly.
    }
    addons.getChannel().emit(THEME_CHANGED, theme);
  }, [theme]);

  return React.createElement(
    IconButton,
    {
      active: true,
      title: `${theme} theme`,
      onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
    React.createElement(theme === 'dark' ? MoonIcon : SunIcon)
  );
}

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    title: 'Theme',
    type: types.TOOL,
    match: ({ viewMode, tabId }) => Boolean(viewMode?.match(/^(story|docs)$/)) && !tabId,
    render: ThemeTool,
  });
});

applyManagerTheme(storedTheme());
