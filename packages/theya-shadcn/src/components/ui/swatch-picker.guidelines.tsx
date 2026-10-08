import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { SwatchPicker } from './swatch-picker';

const COLORS = [
  { value: 'midnight', label: 'Midnight', color: '#1f2a44' },
  { value: 'sand', label: 'Sand', color: '#d9c7a7' },
  { value: 'sage', label: 'Sage', color: '#9bb59a' },
  { value: 'coral', label: 'Coral', color: '#e8735a', unavailable: true },
];

export const swatchPickerGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Choosing by look: product color or material, a label color, a color facet in a filter.', <><C>type="multiple"</C> for filters (“Blue or Green”).</>],
  whenNotToUse: [
    { text: 'Any color, including custom ones', instead: 'ColorPicker / ColorField' },
    { text: 'Options that aren’t visual', instead: 'RadioGroup or Select' },
  ],
  anatomy: [
    { part: 'Legend', optional: true, description: 'shows the selected name — “Color: Midnight”.' },
    { part: 'Swatch', description: <>color, two-tone <C>colors</C> or an <C>image</C>; circle or square; sm/md/lg.</> },
    { part: 'Unavailable', optional: true, description: 'struck through but still selectable — the variant exists, it’s out of stock.' },
  ],
  doDont: [
    {
      do: { example: <SwatchPicker options={COLORS} legend="Color" defaultValue="midnight" />, caption: 'The legend names the selected shade; out-of-stock is struck through, not hidden.' },
      dont: { example: <SwatchPicker options={COLORS} defaultValue="midnight" aria-label="Color" hideValueLabel />, caption: 'No name: is that navy, midnight or black?' },
    },
  ],
  a11y: [
    'Single: a radio group, arrows move. Multiple: toggle buttons, each its own tab stop.',
    <>Every option has a <C>label</C> — it’s the swatch’s name and tooltip.</>,
    <>“Unavailable” is announced, not only drawn (<C>unavailableLabel</C>).</>,
    <>Without a <C>legend</C> pass <C>aria-label</C>.</>,
  ],
};
