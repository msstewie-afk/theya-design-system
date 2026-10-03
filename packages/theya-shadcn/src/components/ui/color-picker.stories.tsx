import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ColorField, ColorPicker } from './color-picker';
import { Card } from './card';
import { colorPickerGuidelines } from './color-picker.guidelines';

/**
 * ColorPicker — saturation/brightness area, hue and alpha sliders, HEX/RGB/HSL
 * inputs, EyeDropper (Chromium only) and optional presets. ColorField puts it
 * in a popover behind a text field where the hex can also be typed.
 *
 * Keyboard: arrows move the area thumb and sliders by 1, Shift+arrows by 10.
 */

const BRAND_PRESETS = ['#1d2433', '#3b6fd6', '#2e9a9a', '#3f9c5f', '#e6c13d', '#e8833a', '#d64545', '#7d55c7', '#f7f5f0'];

const meta = {
  title: 'Selection/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  parameters: { layout: 'padded', guidelines: colorPickerGuidelines },
  argTypes: {
    value: { control: 'color', description: 'Hex color (#rrggbb, or #rrggbbaa with alpha).' },
    defaultValue: { control: 'text', description: 'Initial color when uncontrolled.' },
    alpha: { control: 'boolean', description: 'Adds the alpha slider and an A field.' },
    formats: { control: 'check', options: ['hex', 'rgb', 'hsl'], description: 'Formats offered in the input row.' },
    defaultFormat: { control: 'inline-radio', options: ['hex', 'rgb', 'hsl'] },
    swatches: { control: false, description: 'Preset colors under the controls.' },
    eyeDropper: { control: 'boolean', description: 'Shows the EyeDropper button where supported.' },
    onValueChange: { control: false, description: 'Fires while dragging and on each commit.' },
    onValueCommit: { control: false, description: 'Fires when a drag ends or an input commits.' },
    className: { control: false },
  },
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Inline panel, e.g. inside a settings card. */
export const Default: Story = {
  render: (args) => (
    <Card className="w-fit p-4">
      <ColorPicker {...args} />
    </Card>
  ),
};

/** With alpha: slider over a checkerboard and an A field; the value becomes #rrggbbaa. */
export const WithAlpha: Story = {
  name: 'With alpha',
  args: { alpha: true, defaultValue: '#3b6fd6b3' },
  render: Default.render,
};

/** Brand presets under the controls. */
export const WithPresets: Story = {
  name: 'With presets',
  args: { swatches: BRAND_PRESETS, defaultValue: '#2e9a9a' },
  render: Default.render,
};

/** Controlled, showing the live value and the committed one (what you'd save). */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('#e8833a');
    const [saved, setSaved] = useState('#e8833a');
    return (
      <div className="flex items-start gap-6">
        <Card className="w-fit p-4">
          <ColorPicker value={value} onValueChange={setValue} onValueCommit={setSaved} />
        </Card>
        <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-1 text-body-m">
          <dt className="text-[var(--color-text-text-subtle)]">Live</dt>
          <dd className="font-code">{value}</dd>
          <dt className="text-[var(--color-text-text-subtle)]">Committed</dt>
          <dd className="font-code">{saved}</dd>
        </dl>
      </div>
    );
  },
};

/** ColorField: type a hex or open the picker from the swatch. */
export const Field: Story = {
  render: () => {
    const [primary, setPrimary] = useState('#3b6fd6');
    return (
      <div className="flex w-64 flex-col gap-4">
        <ColorField label="Primary color" value={primary} onValueChange={setPrimary} swatches={BRAND_PRESETS} description="Used for buttons and links." />
        <ColorField label="Overlay" alpha defaultValue="#1d243380" />
        <ColorField label="Small" heightSize="sm" defaultValue="#3f9c5f" />
      </div>
    );
  },
};

/** HEX only — the simplest input row. */
export const HexOnly: Story = {
  name: 'Hex only',
  args: { formats: ['hex'] },
  render: Default.render,
};
