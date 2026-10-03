import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SwatchPicker, type SwatchOption } from './swatch-picker';

/**
 * SwatchPicker — choose a color, material or pattern by its look. Single
 * (radio group, form field) or multiple (filter). Unavailable variants stay
 * visible and selectable, struck through. With a `legend` the selected name
 * is spelled out next to it.
 */

const PRODUCT_COLORS: SwatchOption[] = [
  { value: 'midnight', label: 'Midnight', color: '#1d2433' },
  { value: 'navy', label: 'Navy', color: '#24365c' },
  { value: 'sage', label: 'Sage', color: '#9bab8f' },
  { value: 'sand', label: 'Sand', color: '#d9c7a7' },
  { value: 'white', label: 'Off-white', color: '#f7f5f0' },
  { value: 'rust', label: 'Rust', color: '#a4502d', unavailable: true },
];

const svgPattern = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const MATERIALS: SwatchOption[] = [
  {
    value: 'oak',
    label: 'Natural oak',
    image: svgPattern(
      '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#c89f6d"/><path d="M0 8c10 3 20-3 40 2M0 20c12 4 24-4 40 1M0 32c10 2 22-4 40 2" stroke="#a87e4c" stroke-width="2" fill="none"/></svg>',
    ),
  },
  {
    value: 'walnut',
    label: 'Walnut',
    image: svgPattern(
      '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#5b3a26"/><path d="M0 10c10 3 20-3 40 2M0 24c12 4 24-4 40 1M0 36c10 2 22-4 40 2" stroke="#432a1b" stroke-width="2" fill="none"/></svg>',
    ),
  },
  {
    value: 'linen',
    label: 'Grey linen',
    image: svgPattern(
      '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#b8b6b0"/><path d="M0 0h8M0 4h8M0 0v8M4 0v8" stroke="#a5a39c" stroke-width="1"/></svg>',
    ),
  },
  { value: 'two-tone', label: 'Black / white', colors: ['#1b1b1b', '#f4f4f4'] },
];

const LABEL_COLORS: SwatchOption[] = [
  { value: 'gray', label: 'Gray', color: '#8a8f98' },
  { value: 'red', label: 'Red', color: '#d64545' },
  { value: 'orange', label: 'Orange', color: '#e8833a' },
  { value: 'yellow', label: 'Yellow', color: '#e6c13d' },
  { value: 'green', label: 'Green', color: '#3f9c5f' },
  { value: 'teal', label: 'Teal', color: '#2e9a9a' },
  { value: 'blue', label: 'Blue', color: '#3b6fd6' },
  { value: 'purple', label: 'Purple', color: '#7d55c7' },
  { value: 'pink', label: 'Pink', color: '#d0558f' },
];

const meta = {
  title: 'Selection/SwatchPicker',
  component: SwatchPicker,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    options: { control: false, description: 'Swatches: value, label and color / colors / image; unavailable, disabled.' },
    type: { control: false, description: 'single (radio group) or multiple (pressed buttons).' },
    legend: { control: 'text', description: 'Group label; shown as "Legend: selected name".' },
    hideValueLabel: { control: 'boolean', description: 'Hides the selected name after the legend.' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'], description: 'Swatch size: 20 / 32 / 40px.' },
    shape: { control: 'inline-radio', options: ['circle', 'square'], description: 'Swatch shape.' },
    tooltips: { control: 'boolean', description: 'Shows the swatch name in a tooltip.' },
    unavailableLabel: { control: 'text', description: 'Appended to the name of unavailable swatches.' },
    max: { control: 'number', description: 'Shows the first N swatches, then a +K counter.' },
    disabled: { control: 'boolean' },
    className: { control: false },
  },
  args: {
    options: PRODUCT_COLORS,
    legend: 'Color',
    defaultValue: 'navy',
  },
} satisfies Meta<typeof SwatchPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Product variant picker: the legend spells out the selected color; Rust is out of stock. */
export const Default: Story = {};

/** Sizes: sm for product cards, md for filters, lg for the product page. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <SwatchPicker {...args} size="sm" legend="Small" />
      <SwatchPicker {...args} size="md" legend="Medium" />
      <SwatchPicker {...args} size="lg" legend="Large" />
    </div>
  ),
};

/** Square swatches with images and a two-tone split — materials and finishes. */
export const Materials: Story = {
  args: { options: MATERIALS, legend: 'Finish', defaultValue: 'oak', shape: 'square', size: 'lg' },
};

/** Multiple selection — a color facet in a catalog filter. */
export const Multiple: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['navy', 'sage']);
    return <SwatchPicker type="multiple" options={PRODUCT_COLORS} legend="Color" value={value} onValueChange={setValue} />;
  },
};

/** Label/tag color picker without a legend — needs an aria-label. */
export const LabelColor: Story = {
  name: 'Label color',
  args: { options: LABEL_COLORS, legend: undefined, defaultValue: 'blue', size: 'sm', 'aria-label': 'Label color' },
};

/** Product card: small swatches, the rest summarized as +K. */
export const WithMax: Story = {
  name: 'With max',
  args: { options: LABEL_COLORS, legend: undefined, defaultValue: 'gray', size: 'sm', max: 5, 'aria-label': 'Available colors' },
};

/** Disabled group. */
export const Disabled: Story = {
  args: { disabled: true },
};
