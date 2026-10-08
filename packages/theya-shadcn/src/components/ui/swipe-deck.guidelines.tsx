import { C, type ComponentGuidelines } from '../../docs/guidelines';

const Tile = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] px-4 py-3 font-body text-body-m text-[var(--color-text-text)]">{children}</div>
);

export const swipeDeckGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['A quick keep-or-skip pass over a short set: templates to try, suggested domains, onboarding interests.'],
  whenNotToUse: [
    { text: 'Choosing several items the user needs to compare side by side', instead: 'CheckboxGroup / OptionCard' },
    { text: 'Browsing content without a decision', instead: 'Carousel' },
    { text: 'Destructive decisions (delete, cancel)', instead: 'ConfirmDialog' },
  ],
  anatomy: [
    { part: 'Stack', description: <>the top card plus <C>depth</C> cards behind it, each lower and 5% smaller.</> },
    { part: 'Top card', description: 'follows the pointer and tilts; past a third of its width (or a quick flick) it flies out.' },
    { part: 'Skip / Keep', description: <>buttons that do the same as a swipe left / right; labels from the locale or <C>skipLabel</C> / <C>keepLabel</C>.</> },
    { part: 'Empty', description: <>what shows when every card is gone (<C>empty</C>).</>, optional: true },
  ],
  doDont: [
    {
      do: { example: <Tile>Skip · Keep buttons under the deck</Tile>, caption: 'Swipe plus buttons and arrow keys: anyone can decide.' },
      dont: { example: <Tile>Swipe only, no buttons</Tile>, caption: 'A drag as the only way out fails WCAG 2.5.7 and keyboard users.' },
    },
  ],
  a11y: [
    'The deck is one tab stop: ← skips, → keeps (mirrored in RTL).',
    'Only the top card is in the accessibility tree; the cards behind are aria-hidden and inert.',
    'After each decision a status message says what happened and how many cards are left.',
    'prefers-reduced-motion: no fly-out or spring; the next card simply appears.',
  ],
};
