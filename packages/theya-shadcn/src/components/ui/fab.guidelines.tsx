import { Plus } from 'iconoir-react';
import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Fab } from './fab';

export const fabGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['The one main action of a screen that must stay reachable while scrolling, mostly on mobile: “New message”, “Add site”.', <>Extended (with <C>label</C>) when the icon alone isn’t obvious.</>],
  whenNotToUse: [
    { text: 'Secondary or destructive actions' },
    { text: 'Screens with more than one equally important action', instead: 'Button in the page header or StickyActionBar' },
    { text: 'Desktop pages where the action fits in the header', instead: 'Button' },
  ],
  anatomy: [
    { part: 'Container', description: <>pill (extended) or circle; <C>size</C> sm/md/lg, <C>tone</C>, <C>appearance</C>.</> },
    { part: 'Icon', description: 'always shown.' },
    { part: 'Label', optional: true, description: <>makes it extended; with <C>collapseOnScroll</C> it folds while scrolling down.</> },
  ],
  doDont: [
    {
      do: { example: <Fab position="none" icon={<Plus />} label="New site" />, caption: 'One FAB, the screen’s main action, with a label.' },
      dont: {
        example: (
          <div className="flex gap-3">
            <Fab position="none" icon={<Plus />} aria-label="Add" />
            <Fab position="none" icon={<Plus />} aria-label="Import" tone="secondary" />
          </div>
        ),
        caption: 'Two FABs compete, and two plus icons say nothing.',
      },
    },
  ],
  a11y: [
    <>Icon-only needs <C>aria-label</C>. When it collapses on scroll the label stays in the DOM, so the name doesn’t change.</>,
    'It floats over content: keep the bottom of the page reachable (pad the content by the FAB’s height).',
    'Tab order follows the DOM, not the position on screen — place it where it makes sense to reach it.',
  ],
};
