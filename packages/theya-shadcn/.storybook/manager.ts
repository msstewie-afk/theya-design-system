import { addons } from '@storybook/manager-api';
import { themes } from '@storybook/theming';

// The Storybook chrome (sidebar, toolbar) stays dark whatever theme the
// components are previewed in. The light/dark switch for components and
// Docs pages is the `theme` global in preview.ts.
addons.setConfig({ theme: themes.dark });
