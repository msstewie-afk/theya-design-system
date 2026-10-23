import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const accountOverviewGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'An account home that lists every area — profile, security, billing, team — so nobody has to guess which menu holds a setting.',
    'Putting what needs action first, like a card about to expire or two-factor turned off.',
  ],
  whenNotToUse: [
    { text: 'Editing the settings themselves', instead: 'Preferences' },
    { text: 'Product metrics and usage', instead: 'DashboardOverview' },
    { text: 'Quick access from the top bar', instead: 'AccountMenu' },
  ],
  anatomy: [
    { part: 'Header', description: 'avatar, name, email and workspace, and since when the account exists.' },
    { part: 'Needs your attention', description: 'one row per item with a tone icon, a line of context and one action; left out when there is nothing to do.', optional: true },
    { part: 'Area card', description: 'the area as a heading link, two or three facts that show its current state, and its tasks by name.' },
  ],
  doDont: [],
  a11y: [
    'Each attention item starts with “Urgent”, “Warning” or “Note” for screen readers, so the tone icon is not the only cue.',
    'Toned facts are words, like “Off” or “On”; the color only repeats what the text says.',
    'Both sections are headed and every area title is a heading, so the page can be scanned by headings.',
  ],
};
