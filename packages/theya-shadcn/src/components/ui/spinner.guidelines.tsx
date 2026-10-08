import { type ComponentGuidelines } from '../../docs/guidelines';
import { Spinner } from './spinner';

export const spinnerGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'A short wait inside a control or a small area: a button that is saving, a list that is loading, a file being read.',
  ],
  whenNotToUse: [
    { text: 'A whole page or a layout that is loading', instead: 'Skeleton' },
    { text: 'Work with a known amount done', instead: 'Progress' },
    { text: 'A button’s own loading state', instead: 'Button loading (it already uses Spinner)' },
  ],
  anatomy: [
    { part: 'Track', description: 'a faint ring.' },
    { part: 'Arc', description: 'grows and shrinks while the ring turns.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <p className="flex items-center gap-2 font-body text-body-m text-[var(--color-text-text-subtle)]">
            <Spinner className="size-4 text-[var(--color-icon-icon-primary)]" />
            Loading domains…
          </p>
        ),
        caption: 'Next to text that says what is loading.',
      },
      dont: {
        example: (
          <p className="flex items-center gap-2">
            <Spinner className="size-4" />
            <Spinner className="size-4" />
            <Spinner className="size-4" />
          </p>
        ),
        caption: 'Several spinners at once — show one for the area that is waiting.',
      },
    },
  ],
  a11y: [
    'Decorative (aria-hidden). Mark the waiting region aria-busy, or add a role="status" text such as “Loading domains”.',
    'With reduced motion the arc stops and the spinner slowly fades in and out.',
  ],
};
