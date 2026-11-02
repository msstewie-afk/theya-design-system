import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ExpandingPanels } from './expanding-panels';
import { expandingPanelsGuidelines } from './expanding-panels.guidelines';
import { Link } from './link';

const ITEMS = [
  { title: 'Reading list', media: <img src="/asset-examples/login-carousel-01.jpg" alt="" />, content: <>Long reads you saved for the weekend, newest first. <Link href="#reading">Open the folder</Link></> },
  { title: 'Design inspiration', media: <img src="/asset-examples/login-carousel-02.jpg" alt="" />, content: 'Sites, posters and type specimens, with a copy of each page kept in case it disappears.' },
  { title: 'Research', media: <img src="/asset-examples/login-carousel-03.jpg" alt="" />, content: 'Papers and sources for the thesis, searchable by any word inside them.' },
  { title: 'Recipes', media: <img src="/asset-examples/nova-web.jpg" alt="" />, content: 'Dinner ideas from twelve sites, without the life stories above the ingredients.' },
];

/** ExpandingPanels — a row of tall panels, one open; hover or focus a strip to open it (landing pages). */
const meta = {
  title: 'Motion/ExpandingPanels',
  component: ExpandingPanels,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'A row of tall picture panels, one open: the open one takes most of the width and shows its text, the others are narrow strips with the title running up the side. An accordion underneath.' } },
    layout: 'padded',
    guidelines: expandingPanelsGuidelines,
  },
  argTypes: {
    items: { control: false, description: 'Panels: title, media (a picture), content (a line or two and at most one link).' },
    defaultIndex: { control: 'number', description: 'The panel open at first.' },
    height: { control: 'text', description: 'Row height on wide screens.' },
    titleAs: { control: 'inline-radio', options: ['h2', 'h3', 'h4'], description: 'Heading level of the titles.' },
    onChange: { control: false, description: 'Called with the index of the panel that opens.' },
  },
  args: { items: ITEMS, defaultIndex: 0, height: '28rem' },
} satisfies Meta<typeof ExpandingPanels>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Four folders; hover a strip (or Tab to it) and it opens. */
export const Default: Story = {
  render: (args) => <ExpandingPanels {...args} className="mx-auto max-w-6xl" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('button', { name: 'Reading list' });
    const third = canvas.getByRole('button', { name: 'Research' });
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(third).toHaveAttribute('aria-expanded', 'false');
    // Collapsed text is out of reach; the open panel's link is in reach.
    await expect(canvas.getByRole('link', { name: 'Open the folder' })).toBeInTheDocument();
    await userEvent.click(third);
    await expect(third).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByRole('region', { name: 'Research' })).toHaveTextContent(/thesis/);
    await expect(canvas.queryByRole('link', { name: 'Open the folder' })).toBeNull();
  },
};
