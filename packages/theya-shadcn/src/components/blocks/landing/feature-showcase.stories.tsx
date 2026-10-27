import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { DEMO_FEATURES, DemoFeatureVisual } from './demo-data';
import { FeatureShowcase } from './feature-showcase';
import { featureShowcaseGuidelines } from './feature-showcase.guidelines';

const meta: Meta<typeof FeatureShowcase> = {
  title: 'Patterns: Landing/FeatureShowcase',
  component: FeatureShowcase,
  tags: ['autodocs'],
  parameters: { guidelines: featureShowcaseGuidelines, layout: 'fullscreen' },
  argTypes: { items: { control: false } },
};
export default meta;
type Story = StoryObj<typeof FeatureShowcase>;

const ITEMS = DEMO_FEATURES.map((f) => ({ id: f.id, title: f.title, description: f.description, media: <DemoFeatureVisual id={f.id} /> }));
const SHORT = ['Import', 'Folders', 'Search', 'Duplicates'];

/** The features as a list; the open one shows its visual beside it (GitHub). On phones the visual sits inside the open item. */
export const Accordion: Story = {
  render: () => (
    <FeatureShowcase
      variant="accordion"
      eyebrow="Features"
      title="Everything you saved, in order"
      description="Four things that keep a collection of thousands of links usable."
      items={ITEMS}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The first item is open; opening another swaps the visual.
    await expect(canvas.getByRole('button', { name: DEMO_FEATURES[0].title })).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(canvas.getByRole('button', { name: DEMO_FEATURES[2].title }));
    await expect(canvas.getByRole('button', { name: DEMO_FEATURES[2].title })).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', { name: DEMO_FEATURES[0].title })).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getAllByRole('img', { name: /Searching “attention”/ }).length).toBeGreaterThan(0);
  },
};

/** Chips above one panel with the text and a bigger visual (Miro): the табочипсы pattern. */
export const Chips: Story = {
  render: () => (
    <FeatureShowcase
      variant="chips"
      title="One place for every link"
      items={ITEMS.map((i, n) => ({ ...i, title: SHORT[n] }))}
      defaultValue="folders"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('tab', { name: 'Folders' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(canvas.getByRole('tab', { name: 'Duplicates' }));
    await expect(canvas.getByRole('img', { name: /Three duplicates found/ })).toBeVisible();
  },
};
