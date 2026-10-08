import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { RangeField } from './range-field';
import { Slider } from './slider';

export const rangeFieldGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A numeric range people set roughly and sometimes exactly: price filter, size, response time.', <>Filters that fetch — <C>onValueCommit</C> fires once per finished change.</>],
  whenNotToUse: [
    { text: 'A single value', instead: 'Slider or NumberField' },
    { text: 'A date span', instead: 'DateRangePicker' },
  ],
  anatomy: [
    { part: 'Label', description: <><C>label</C>, with the unit.</> },
    { part: 'Histogram', optional: true, description: <><C>histogram</C> — how many items fall in each bucket.</> },
    { part: 'Two-thumb slider', description: 'for a quick rough pick.' },
    { part: 'From / To fields', description: 'NumberFields for exact bounds; they can’t cross.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="w-72">
            <RangeField label="Price, $" min={0} max={500} step={10} defaultValue={[50, 300]} histogram={[2, 5, 9, 14, 11, 7, 4, 3, 2, 1]} />
          </div>
        ),
        caption: 'Drag for a rough span, type for an exact one; the histogram shows where items are.',
      },
      dont: {
        example: (
          <div className="w-72">
            <Slider aria-label="Price" min={0} max={500} defaultValue={[50, 300]} />
          </div>
        ),
        caption: 'A bare two-thumb slider: no values shown, no way to type $120.',
      },
    },
  ],
  a11y: [
    'Thumbs are named “From” and “To” with the label; the fields repeat them for typing.',
    <>Change <C>fromLabel</C>/<C>toLabel</C> together with the slider names if the bounds have other words (“Min”, “Max”).</>,
    'Results updated by the filter should be announced in a live region by the page, not by the field.',
  ],
};
