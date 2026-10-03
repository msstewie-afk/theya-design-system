import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { ThemeToggle } from './theme-toggle';

export const themeToggleGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A quick light/dark switch in the top bar.'],
  whenNotToUse: [{ text: 'When “same as system” must be a choice too', instead: 'a radio group in the account menu or settings' }],
  anatomy: [{ part: 'Icon button', description: <>sun / moon; flips <C>data-theme</C> on the document.</> }],
  doDont: [
    {
      do: { example: <ThemeToggle />, caption: 'One place, in the top bar, next to the other global controls.' },
      dont: { example: <span className="font-body text-body-m text-[var(--color-text-text-subtle)]">A theme switch in every page header</span>, caption: 'Repeating a global setting on every page makes it look page-specific.' },
    },
  ],
  a11y: ['Its name is “Toggle theme”. Known gap: the current theme isn’t exposed to screen readers yet — it should become “Switch to dark/light theme” or aria-pressed.', 'Keyboard: a regular button, Enter or Space.'],
};
