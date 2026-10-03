import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
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

const PALETTE = [
  '#111214', '#23262b', '#363a41', '#4b5059', '#6b717c', '#9aa0aa', '#e3e5e8', '#0f1b33', '#14305c', '#1f3f8f',
  '#2f62d1', '#5d86e8', '#9bb5f2', '#e3eafb', '#1c1838', '#2d1f5c', '#4a2a9e', '#7c3aed', '#7357e6', '#a48cf0',
  '#c9bbf7', '#ece8fc', '#3b1328', '#5c1c3a', '#8f2550', '#c2457e', '#e84d97', '#ea86b6', '#f4bcd6', '#fbe4ef',
  '#8e2a2a', '#c74242', '#ef4444', '#e87272', '#f2b0b0', '#fce4e4', '#3d1d0b', '#6b2f12', '#9a3f15', '#f2701a',
  '#d96b35', '#f3a46e', '#f8cba8', '#fdeee3', '#3d2f0b', '#5c4712', '#8a6a1c', '#e7b211', '#ccab52', '#ead37e',
  '#f4e4b0', '#fdf6e3', '#12291f', '#1f4a36', '#2e7a55', '#4cb07f', '#22c55e', '#7ed6a6', '#bfecd2', '#e8f8ef',
  '#0f3a33', '#145a52', '#1f7a6f', '#2bb8a8', '#6dd9cc', '#b3eee7', '#e6f9f7', '#0f2e3d', '#164e63', '#1e7b8c',
  '#2196a8', '#2fb8d1', '#7adbe8', '#bdeef5', '#000000', '#ffffff',
];

// A small landscape as an inline SVG, so the photo view works offline.
const PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="260" viewBox="0 0 600 260">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6b38a"/><stop offset="1" stop-color="#f7e2c4"/></linearGradient></defs>
    <rect width="600" height="260" fill="url(#sky)"/>
    <circle cx="430" cy="110" r="42" fill="#fbe9a8"/>
    <path d="M0 170 L120 110 L230 160 L340 95 L470 165 L600 120 L600 260 L0 260Z" fill="#7a5c86"/>
    <path d="M0 200 L150 160 L300 205 L450 170 L600 200 L600 260 L0 260Z" fill="#4a3d63"/>
    <path d="M0 235 L600 222 L600 260 L0 260Z" fill="#2c2a3f"/>
  </svg>`,
)}`;

const meta = {
  title: 'Selection/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  parameters: { layout: 'padded', guidelines: colorPickerGuidelines },
  argTypes: {
    value: { control: 'color', description: 'Hex color (#rrggbb, or #rrggbbaa with alpha).' },
    defaultValue: { control: 'text', description: 'Initial color when uncontrolled.' },
    alpha: { control: 'boolean', description: 'Adds the opacity slider and a % field.' },
    formats: { control: 'check', options: ['hex', 'rgb', 'hsl'], description: 'Formats offered in the input row.' },
    defaultFormat: { control: 'inline-radio', options: ['hex', 'rgb', 'hsl'] },
    swatches: { control: false, description: 'Preset colors for the Palette view.' },
    views: { control: 'check', options: ['palette', 'photo', 'custom'], description: 'Sources offered; more than one renders tabs.' },
    defaultView: { control: 'inline-radio', options: ['palette', 'photo', 'custom'] },
    clearable: { control: 'boolean', description: 'Adds a "No color" swatch; picking it sets the value to an empty string.' },
    photo: { control: false, description: 'Initial image for the From photo view.' },
    viewLabels: { control: false, description: 'Tab names.' },
    eyeDropper: { control: 'boolean', description: 'Shows the EyeDropper button where supported.' },
    onValueChange: { control: false, description: 'Fires while dragging and on each commit.' },
    onValueCommit: { control: false, description: 'Fires when a drag ends or an input commits.' },
    className: { control: false },
  },
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three sources as tabs: a preset palette (with "No color"), colors from a photo, and the custom picker. */
export const Default: Story = {
  args: { views: ['palette', 'photo', 'custom'], defaultView: 'custom', swatches: PALETTE, clearable: true, photo: PHOTO, alpha: true, defaultFormat: 'rgb' },
  render: (args) => (
    <Card className="w-fit p-4">
      <ColorPicker {...args} />
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Palette' }));
    const palette = canvas.getByRole('radiogroup', { name: 'Palette colors' });
    // Picking a swatch sets the color (RGB fields follow) and marks it selected.
    await userEvent.click(within(palette).getByRole('radio', { name: '#2F62D1' }));
    await expect(within(palette).getByRole('radio', { name: '#2F62D1' })).toBeChecked();
    await expect(canvas.getByRole('textbox', { name: 'Red' })).toHaveValue('47');
    // "No color" empties the fields.
    await userEvent.click(within(palette).getByRole('radio', { name: 'No color' }));
    await expect(within(palette).getByRole('radio', { name: 'No color' })).toBeChecked();
    await expect(canvas.getByRole('textbox', { name: 'Red' })).toHaveValue('');
  },
};

/** Custom only — the single-view panel without tabs. */
export const CustomOnly: Story = {
  name: 'Custom only',
  render: Default.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hex = canvas.getByRole('textbox', { name: 'Hex' });
    const hue = canvas.getByRole('slider', { name: 'Hue' });
    const area = canvas.getByRole('slider', { name: 'Saturation and brightness' });

    // A typed hex drives the sliders.
    await userEvent.clear(hex);
    await userEvent.type(hex, 'ff0000{Enter}');
    await expect(hue).toHaveAttribute('aria-valuenow', '0');
    await expect(area).toHaveAttribute('aria-valuetext', 'Saturation 100%, brightness 100%');

    // An invalid hex reverts on commit.
    await userEvent.clear(hex);
    await userEvent.type(hex, 'zzz{Enter}');
    await expect(hex).toHaveValue('#FF0000');

    // Keyboard: arrows by 1, Shift+arrows by 10; the hex follows.
    hue.focus();
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}{ArrowRight}');
    await expect(hue).toHaveAttribute('aria-valuenow', '11');
    await expect(hex).not.toHaveValue('#FF0000');
    area.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(area).toHaveAttribute('aria-valuetext', 'Saturation 100%, brightness 99%');
  },
};

/** With opacity: slider over a checkerboard and a % field; the value becomes #rrggbbaa. */
export const WithAlpha: Story = {
  name: 'With opacity',
  args: { alpha: true, defaultValue: '#3b6fd6b3', defaultFormat: 'rgb' },
  render: Default.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const opacityField = canvas.getByRole('textbox', { name: 'Opacity, percent' });
    const opacity = canvas.getByRole('slider', { name: 'Opacity' });
    await expect(opacityField).toHaveValue('70%');
    await expect(canvas.getByRole('textbox', { name: 'Red' })).toHaveValue('59');
    // Typing a percentage moves the slider; out-of-range values clamp.
    await userEvent.clear(opacityField);
    await userEvent.type(opacityField, '50{Enter}');
    await expect(opacity).toHaveAttribute('aria-valuenow', '50');
    await userEvent.clear(opacityField);
    await userEvent.type(opacityField, '180{Enter}');
    await expect(opacityField).toHaveValue('100%');
  },
};

/** Upload flow: the From photo view starts empty. */
export const FromPhoto: Story = {
  name: 'From photo',
  args: { views: ['photo', 'custom'] },
  render: Default.render,
};

/** Brand presets: passing `swatches` adds a Palette tab next to Custom. */
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dd = (term: string) => canvas.getByText(term, { selector: 'dt' }).nextElementSibling as HTMLElement;
    const hue = canvas.getByRole('slider', { name: 'Hue' });
    // Holding a key changes the live value; the commit lands on key up, matching it.
    hue.focus();
    await userEvent.keyboard('{ArrowRight>3/}');
    await waitFor(() => expect(dd('Committed').textContent).toBe(dd('Live').textContent));
    await expect(dd('Live')).not.toHaveTextContent('#e8833a');
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const input = canvas.getByLabelText('Primary color');
    // A typed hex (with or without #) is normalized on Enter; garbage is discarded.
    await userEvent.clear(input);
    await userEvent.type(input, 'e8833a{Enter}');
    await expect(input).toHaveValue('#E8833A');
    await userEvent.clear(input);
    await userEvent.type(input, 'nope{Enter}');
    await expect(input).toHaveValue('#E8833A');
    // The swatch opens the picker; Esc closes it and returns focus to the swatch.
    const trigger = canvas.getAllByRole('button', { name: 'Open color picker' })[0];
    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', { name: 'Color picker' });
    // With brand swatches the picker opens on Palette, Custom one tab away.
    await expect(within(dialog).getByRole('tab', { name: 'Palette', selected: true })).toBeInTheDocument();
    await expect(within(dialog).getByRole('tab', { name: 'Custom' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog', { name: 'Color picker' })).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

/** HEX only — the simplest input row. */
export const HexOnly: Story = {
  name: 'Hex only',
  args: { formats: ['hex'] },
  render: Default.render,
};
