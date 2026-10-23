import type { ComponentGuidelines } from '../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const workspaceLayoutGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'The shell of an app: navigation on the left, a top bar with page context and actions, the page in between.',
  ],
  whenNotToUse: [
    { text: 'A marketing or content site', instead: 'NavigationMenu' },
    { text: 'Just the side navigation', instead: 'Sidebar' },
  ],
  anatomy: [
    { part: 'Sidebar', description: 'brand, grouped navigation and the signed-in user; collapses to an icon rail.' },
    { part: 'Top bar', description: 'breadcrumbs, search and actions.' },
    { part: 'Content', description: 'the page.' },
  ],
  doDont: [],
  a11y: [
    'A skip link is the first Tab stop and jumps straight to the content.',
    'Both navigation landmarks are named, so they can be told apart.',
    'Below md the sidebar becomes a slide-over panel; a long breadcrumb never makes the page scroll sideways.',
  ],
};
