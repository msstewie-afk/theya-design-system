import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { SurfaceEffect } from './surface-effect';

const CARD = 'rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-4 text-body-m';

export const surfaceEffectGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    <>Feature and pricing cards on a landing page: a glow under the pointer (<C>spotlight</C>), a light running round the border of the plan you recommend (<C>beam</C>), a gentle <C>tilt</C>, <C>shine</C> or <C>lift</C> on hover.</>,
    <><C>Aurora</C>: a slow color field behind a hero.</>,
  ],
  whenNotToUse: [
    { text: 'Cards in product UI (lists, dashboards, settings)', instead: 'Card with its own hover' },
    { text: 'A way to say “this one is selected” or “this is clickable”', instead: 'Card selectable / action — the effect is decoration only' },
    { text: 'Several different effects on one page' },
  ],
  anatomy: [
    { part: 'Surface', description: <>wraps the card; give it the card’s radius (<C>rounded-*</C>) so the effect is clipped to it.</> },
    { part: 'Effect layer', description: 'a pseudo-element or CSS variables; no extra DOM in the card’s own content.' },
    { part: 'Aurora', description: <>separate, as the first child of a <C>relative isolate</C> section.</>, optional: true },
  ],
  doDont: [
    {
      do: { example: <SurfaceEffect effect="beam" className="w-56 rounded-[var(--size-border-radius-border-radius-2xl)]"><div className="p-4 text-body-m">Pro — recommended</div></SurfaceEffect>, caption: 'One accent on the one card that matters.' },
      dont: { example: <div className="flex gap-2"><SurfaceEffect effect="tilt" className={CARD}>Tilt</SurfaceEffect><SurfaceEffect effect="shine" className={CARD}>Shine</SurfaceEffect><SurfaceEffect effect="lift" className={CARD}>Lift</SurfaceEffect></div>, caption: 'A different effect on every card: nothing stands out any more.' },
    },
  ],
  a11y: [
    'Decoration only: no role, no focus stop, nothing announced; Aurora is aria-hidden.',
    'Pointer effects (spotlight, tilt) do nothing on touch screens, so nothing depends on them.',
    'prefers-reduced-motion: no movement; the beam becomes a plain border.',
    'Keep text over Aurora at full contrast: a solid surface under the copy, or the subtle intensity.',
  ],
};
