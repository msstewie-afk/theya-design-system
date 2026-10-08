import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { ProgressRing } from './progress-ring';

export const progressRingGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['A single completion figure on a card or a landing bento: setup 75% done, 3 of 4 steps.'],
  whenNotToUse: [
    { text: 'A value that updates live (upload, CPU)', instead: 'Progress / Meter' },
    { text: 'Several values to compare', instead: 'DonutChart / UsageBar' },
  ],
  anatomy: [
    { part: 'Track', description: 'bg-neutral-subtle circle.' },
    { part: 'Fill', description: <>rounded stroke in the <C>tone</C>, fills clockwise (counter-clockwise in RTL) when it scrolls into view.</> },
    { part: 'Middle', description: <>the percentage counting up, or your own content (<C>children</C>).</>, optional: true },
  ],
  doDont: [
    {
      do: { example: <ProgressRing value={75} label="Setup" size={72} thickness={7} />, caption: 'One figure with a clear meaning.' },
      dont: { example: <ProgressRing value={33} label="CPU" size={72} thickness={7} tone="danger" />, caption: 'A live system value: the count-up shows numbers that were never true.' },
    },
  ],
  a11y: [
    <>role="progressbar" with <C>label</C>; the value is the final one from the start, the counting digits are hidden.</>,
    'Tone is never the only signal — the number is always there (or put it in children).',
    'prefers-reduced-motion: drawn full at once.',
  ],
};
