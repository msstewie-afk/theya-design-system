import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { useState } from 'react';
import { Slider } from './slider';

function ConcurrencyExample() {
  const [value, setValue] = useState([8]);
  return (
    <div className="flex w-64 flex-col gap-3">
      <div className="flex justify-between">
        <span className="font-body text-body-m font-medium text-[var(--color-text-text)]">Worker concurrency</span>
        <span className="font-body text-body-m tabular-nums text-[var(--color-text-text-subtle)]">{value[0]}</span>
      </div>
      <Slider aria-label="Worker concurrency" min={1} max={32} value={value} onValueChange={setValue} />
    </div>
  );
}

export const sliderGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A value where roughly right is good enough and seeing the position helps: volume, concurrency, a budget.', 'Two thumbs for a range, when the exact numbers matter less than the span.'],
  whenNotToUse: [
    { text: 'An exact number', instead: 'NumberField' },
    { text: 'A range people also want to type', instead: 'RangeField' },
    { text: 'A handful of named steps', instead: 'RadioGroup or ToggleGroup' },
  ],
  anatomy: [
    { part: 'Track and range', description: 'the filled part shows the value.' },
    { part: 'Thumb', description: <>one per value; <C>defaultValue</C> is an array.</> },
    { part: 'Value text', description: <>show the number next to it; <C>formatValue</C> is also what screen readers hear.</> },
  ],
  doDont: [
    {
      do: {
        example: <ConcurrencyExample />,
        caption: 'A rough value with the number shown.',
      },
      dont: {
        example: (
          <div className="flex w-64 flex-col gap-3">
            <span className="font-body text-body-m font-medium text-[var(--color-text-text)]">Port</span>
            <Slider aria-label="Port" min={1} max={65535} defaultValue={[8080]} />
          </div>
        ),
        caption: 'An exact number on a 65 535-step track, no value shown — nobody hits 8080 by dragging.',
      },
    },
  ],
  a11y: [
    <>Each thumb is a <C>slider</C>: arrows step, Page Up/Down take bigger steps, Home/End jump to the ends.</>,
    <>Every thumb needs a name — <C>aria-label</C>, and for a range say which end (“Minimum budget”).</>,
    <>Pass <C>formatValue</C> when the number has a unit, so it’s read as “$40”, not “40”.</>,
  ],
};
