import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { StoreButtons } from './store-buttons';
import { storeButtonsGuidelines } from './store-buttons.guidelines';

const meta: Meta<typeof StoreButtons> = {
  title: 'Patterns: Landing/StoreButtons',
  component: StoreButtons,
  tags: ['autodocs'],
  parameters: { guidelines: storeButtonsGuidelines, layout: 'centered' },
  args: { appStore: '#app-store', googlePlay: '#google-play' },
};
export default meta;
type Story = StoryObj<typeof StoreButtons>;

/** A computer: both stores. */
export const Computer: Story = {
  args: { device: 'other' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('link')).toHaveLength(2);
  },
};

/** An iPhone or iPad: the App Store only. */
export const IPhone: Story = {
  args: { device: 'ios' },
  play: async ({ canvasElement }) => {
    const links = within(canvasElement).getAllByRole('link');
    await expect(links).toHaveLength(1);
    await expect(links[0]).toHaveAccessibleName('Download on the App Store');
  },
};

/** An Android phone: Google Play only. */
export const Android: Story = {
  args: { device: 'android' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link')).toHaveAccessibleName('Get it on Google Play');
  },
};

/** `show="both"` keeps both, whatever the device; `size="md"` is 40px. */
export const BothSmall: Story = {
  args: { device: 'ios', show: 'both', size: 'md' },
};
