import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Reveal } from './reveal';

export const revealGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'Landing and marketing pages: feature blocks, cards, a pricing row easing in as the reader scrolls down.',
    <>A group of similar items (<C>RevealGroup</C>) — they arrive one after another, 90ms apart.</>,
  ],
  whenNotToUse: [
    { text: 'Product UI — dashboards, forms, tables, settings', instead: 'no motion: content should just be there' },
    { text: 'The only copy of something essential above the fold (it stays hidden until the page script runs)' },
    { text: 'Something appearing because of a user action', instead: 'Collapsible, Dialog or the component’s own transition' },
  ],
  anatomy: [
    { part: 'Trigger', description: <>the element entering the viewport (<C>threshold</C>, <C>once</C>).</> },
    { part: 'Effect', description: <><C>rise</C> (default), <C>fade</C>, <C>scale</C>, <C>blur</C> — <C>duration-slower</C> on <C>ease-glide</C>.</> },
    { part: 'Stagger', description: <><C>RevealGroup</C> delays each direct child by <C>stagger</C> ms.</>, optional: true },
  ],
  doDont: [
    {
      do: { example: <Reveal className="rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] p-4 text-body-m">Feature block rises in once.</Reveal>, caption: 'One quiet entrance per block, the first time it’s seen.' },
      dont: { example: <Reveal once={false} effect="blur" className="rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] p-4 text-body-m">Blurs in every time it scrolls past.</Reveal>, caption: 'Replaying on every scroll, mixing effects on one page: motion turns into noise.' },
    },
  ],
  a11y: [
    'prefers-reduced-motion: content shows at once, with no transition and no waiting for the scroll position.',
    'Only opacity and transform change, so the layout never moves and nothing is announced twice.',
    'Hidden content is still in the accessibility tree; don’t hide anything from screen readers with it.',
  ],
};
