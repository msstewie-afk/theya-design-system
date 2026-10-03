import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { ColorField } from './color-picker';
import { SwatchPicker } from './swatch-picker';

export const colorPickerGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['Any color, including custom: brand and theme colors, chart series, white-label setup.', <><C>ColorField</C> in forms — a text field with a swatch that opens the picker.</>],
  whenNotToUse: [
    { text: 'A fixed set of colors', instead: 'SwatchPicker' },
    { text: 'Product variants', instead: 'SwatchPicker' },
  ],
  anatomy: [
    { part: 'Tabs', description: <>Palette, From photo, Custom — choose with <C>views</C>.</> },
    { part: 'Area and sliders', description: <>saturation/brightness, hue, and opacity with <C>alpha</C>.</> },
    { part: 'Input row', description: <>format (HEX/RGB/HSL via <C>formats</C>) and channel fields.</> },
    { part: 'No color', optional: true, description: <><C>clearable</C>.</> },
  ],
  doDont: [
    {
      do: { example: <div className="w-64"><ColorField label="Brand color" defaultValue="#4f46e5" /></div>, caption: 'In a form: a field that shows and accepts the hex, the picker on demand.' },
      dont: {
        example: (
          <SwatchPicker
            aria-label="Brand color"
            shape="square"
            options={[{ value: 'a', label: 'Indigo', color: '#4f46e5' }, { value: 'b', label: 'Teal', color: '#0d9488' }]}
            defaultValue="a"
          />
        ),
        caption: 'Two presets for a brand color — the customer’s own color isn’t there.',
      },
    },
  ],
  a11y: [
    'The area and each slider are keyboard-operable (arrows, Home/End) and announce the value.',
    'Always keep the text input — it’s the precise, accessible way to set a color.',
    'Check the chosen color’s contrast where it’s used; the picker doesn’t know the context.',
  ],
};
