import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Button } from './button';
import { BellAnimated, SettingsAnimated, TrashAnimated } from './animated-icon';

export const animatedIconGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'A small cue that answers an action: Copy turns into a tick, a menu button folds into ×, a refresh arrow turns.',
    'A hint on hover for a few key icon buttons (notifications, settings, delete).',
  ],
  whenNotToUse: [
    { text: 'Every icon on the screen — motion stops meaning anything', instead: 'static iconoir icons' },
    { text: 'Long loading', instead: 'Spinner / Progress' },
    { text: 'The only signal of a state change', instead: 'a label, toast or aria-live text as well' },
  ],
  anatomy: [
    { part: 'Icon', description: <>iconoir 7.12.1 geometry, 24-unit grid, stroke 1.5, <C>currentColor</C>.</> },
    { part: 'trigger', description: <><C>hover</C> (button / link ancestor hovered or focused), <C>active</C> (second state), <C>loop</C> (busy).</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <Button appearance="ghost" tone="neutral" iconOnly aria-label="Notifications" leftIcon={<BellAnimated />} />
        ),
        caption: 'One animated icon on the button it belongs to; it plays on hover and keyboard focus.',
      },
      dont: {
        example: (
          <span className="flex gap-2">
            <BellAnimated trigger="loop" />
            <SettingsAnimated trigger="loop" />
            <TrashAnimated trigger="loop" />
          </span>
        ),
        caption: 'Several icons moving on their own: nothing to look at first.',
      },
    },
  ],
  a11y: [
    'Decorative: aria-hidden. Name the button, not the icon (aria-label="Copy").',
    'prefers-reduced-motion: no motion; active states still switch, instantly.',
    'Loops only while something is busy (WCAG 2.2.2 — nothing moves for more than 5 s unasked).',
  ],
};
