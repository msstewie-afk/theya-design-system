import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Rating } from './rating';

// Radix RadioGroup checks the newly focused radio only while the arrow key
// is still held (same helper as Radio's stories).
async function pressArrow(key: 'ArrowRight' | 'ArrowLeft', target: () => HTMLElement) {
  await userEvent.keyboard(`{${key}>}`);
  await waitFor(() => expect(target()).toHaveFocus());
  await userEvent.keyboard(`{/${key}}`);
}

const meta: Meta<typeof Rating> = {
  title: 'Selection/Rating',
  component: Rating,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Star rating. As input it is a radio group (arrows, Home/End, one Tab stop); `readOnly` draws fractional values and is announced as one image ("4.5 of 5"). Empty stars are outlines, filled ones solid, so the state never depends on color alone.',
      },
    },
  },
  args: { 'aria-label': 'Rate this host', defaultValue: 3 },
  argTypes: {
    value: { control: 'number', description: 'Controlled value, 0 = no rating.', table: { category: 'State' } },
    defaultValue: { control: 'number', description: 'Uncontrolled initial value.', table: { category: 'State' } },
    max: { control: 'number', description: 'Number of stars. Default 5.', table: { category: 'Content' } },
    size: { control: 'inline-radio', options: ['sm', 'md'], description: 'Star size: sm 16px, md 24px. Hit areas stay ≥ 24px.', table: { category: 'Appearance' } },
    readOnly: { control: 'boolean', description: 'Display only; fractional values allowed.', table: { category: 'State' } },
    clearable: { control: 'boolean', description: 'Clicking the selected star resets to 0.', table: { category: 'Behavior' } },
    disabled: { control: 'boolean', description: 'Disables input.', table: { category: 'State' } },
    formatLabel: { control: false, description: 'Accessible text for a value, e.g. (v, max) => `${v} из ${max}`.', table: { category: 'Content' } },
    onValueChange: { control: false, description: 'Fires with the new value.', table: { category: 'Behavior' } },
  },
};

export default meta;
type Story = StoryObj<typeof Rating>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Rate this host' });
    const radio = (n: number) => within(group).getByRole('radio', { name: `${n} of 5` });
    await expect(radio(3)).toBeChecked();
    // Click sets the value.
    await userEvent.click(radio(5));
    await expect(radio(5)).toBeChecked();
    // Arrows move and select, one star at a time.
    radio(5).focus();
    await pressArrow('ArrowLeft', () => radio(4));
    await expect(radio(4)).toBeChecked();
  },
};

/** Display only: fractional values are drawn as partial stars and announced exactly. */
export const ReadOnly: Story = {
  name: 'Read-only',
  render: () => (
    <div className="flex flex-col gap-3">
      <Rating readOnly value={4.5} aria-label="Average rating" />
      <Rating readOnly value={3.2} size="sm" aria-label="Support" />
      <Rating readOnly value={0} size="sm" aria-label="Not rated yet" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: 'Average rating: 4.5 of 5' })).toBeInTheDocument();
    await expect(canvas.getByRole('img', { name: 'Support: 3.2 of 5' })).toBeInTheDocument();
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Rating size="sm" defaultValue={4} aria-label="Small rating" />
      <Rating size="md" defaultValue={4} aria-label="Medium rating" />
    </div>
  ),
};

/** `clearable`: clicking the selected star again removes the rating. */
export const Clearable: Story = {
  args: { clearable: true, defaultValue: 2, 'aria-label': 'Clearable rating' },
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('radiogroup', { name: 'Clearable rating' });
    const second = within(group).getByRole('radio', { name: '2 of 5' });
    await userEvent.click(second);
    await waitFor(() => expect(within(group).queryAllByRole('radio', { checked: true })).toHaveLength(0));
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 4, 'aria-label': 'Disabled rating' },
};

/** Controlled, with a localized accessible label and the value shown next to it. */
export const Controlled: Story = {
  render: function ControlledRating() {
    const [value, setValue] = useState(0);
    return (
      <div className="flex items-center gap-3">
        <Rating value={value} onValueChange={setValue} aria-label="Оцените поддержку" formatLabel={(v, max) => `${v} из ${max}`} />
        <span className="font-body text-body-s text-[var(--color-text-text-subtler)]" aria-live="polite">
          {value > 0 ? `${value} из 5` : 'Без оценки'}
        </span>
      </div>
    );
  },
};
