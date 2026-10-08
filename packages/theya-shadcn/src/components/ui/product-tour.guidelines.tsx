import { useState } from 'react';
import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Button } from './button';
import { ProductTour, type TourStep } from './product-tour';

function Tour({ label, steps }: { label: string; steps: TourStep[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button appearance="outlined" tone="secondary" size="md" onClick={() => setOpen(true)}>{label}</Button>
      <ProductTour steps={steps} open={open} onOpenChange={setOpen} />
    </>
  );
}

const SHORT: TourStep[] = [
  { title: 'Welcome to the new Sites page', content: 'Two things changed — this takes 20 seconds.' },
  { title: 'Search everything', content: 'Sites, domains and databases from one field.' },
  { title: 'That’s it', content: 'Replay this tour from Help anytime.' },
];
const LONG: TourStep[] = ['Welcome', 'Search', 'Filters', 'Sort', 'Cards', 'Badges', 'Menu', 'Billing', 'Team', 'Settings', 'Help', 'Done'].map((t) => ({
  title: t,
  content: `This is the ${t.toLowerCase()} area.`,
}));

export const productTourGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['Introducing what changed on a redesigned screen, once, in 2–5 steps.', <>Teaching one action by doing it (an <C>interactive</C> step).</>],
  whenNotToUse: [
    { text: 'Explaining a whole product', instead: 'docs, or an empty state with guidance' },
    { text: 'A single hint', instead: 'Tooltip or a callout' },
    { text: 'Anything people need later', instead: 'Help content they can come back to' },
  ],
  anatomy: [
    { part: 'Spotlight', description: <>the target cut out of a dim; a step without <C>target</C> is a centered card.</> },
    { part: 'Card', description: 'title, text, optional media, Back / Next, “2 of 4”, Skip.' },
  ],
  doDont: [
    {
      do: { example: <Tour label="Start 3-step tour" steps={SHORT} />, caption: 'Three steps about what’s new: easy to finish, easy to skip.' },
      dont: { example: <Tour label="Start 12-step tour" steps={LONG} />, caption: 'Twelve steps pointing at everything: people skip on step 2 and learn nothing.' },
    },
  ],
  a11y: [
    'Focus moves into the card on every step; ←/→ move between steps, Escape skips.',
    'The page under the dim is inert unless a step is interactive.',
    <>Store “seen” in <C>onComplete</C>/<C>onSkip</C> — don’t show it again on every visit.</>,
  ],
};
