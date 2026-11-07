import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { TruncatedText } from './truncated-text';
import { truncatedTextGuidelines } from './truncated-text.guidelines';

/**
 * TruncatedText — one line that ends in an ellipsis when it doesn't fit and
 * shows the whole text in a tooltip, only while it is actually cut. Used
 * inside DataTableCell, ListItem, Select, DatePicker, Metric and Scheduler.
 */
const meta = {
  title: 'Labels/TruncatedText',
  component: TruncatedText,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'One line of long user data (a file name, a portal address, a description) that ends in an ellipsis when it doesn’t fit and shows the whole text in a tooltip on hover and keyboard focus. Short interface labels wrap instead.',
      },
    },
    guidelines: truncatedTextGuidelines,
    layout: 'centered',
  },
  argTypes: {
    children: { control: 'text', description: 'The text. Shown in full in the tooltip while it is cut.' },
    asChild: { control: false, description: 'Render onto your own element (e.g. a heading) instead of a span.' },
  },
  args: { children: 'selene-weddings.aether.photo/galleries/moonrise-over-othrys' },
} satisfies Meta<typeof TruncatedText>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Cut text with nothing focusable around it is a tab stop; the tooltip opens on focus. */
export const Default: Story = {
  render: (args) => (
    <div className="w-56 font-body text-body-m">
      <TruncatedText {...args} />
    </div>
  ),
};

/** Text that fits: no tooltip, no tab stop. */
export const Fits: Story = {
  args: { children: 'Golden hour' },
  render: (args) => (
    <div className="w-56 font-body text-body-m">
      <TruncatedText {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText('Golden hour');
    await expect(text).not.toHaveAttribute('data-truncated');
    await expect(text).not.toHaveAttribute('tabindex');
  },
};

/** Inside a link: the link keeps the only tab stop, and its focus opens the tooltip. */
export const InsideALink: Story = {
  name: 'Inside a link',
  render: (args) => (
    <a href="#gallery" className="block w-56 rounded-[var(--size-border-radius-border-radius-sm)] font-body text-body-m outline-none focus-visible:focus-ring">
      <TruncatedText {...args} />
    </a>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link');
    const text = within(canvasElement).getByText(/selene-weddings/);
    await waitFor(() => expect(text).toHaveAttribute('data-truncated'));
    await expect(text).not.toHaveAttribute('tabindex');
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await waitFor(() => expect(text.getAttribute('data-state') ?? '').toMatch(/open/));
  },
};

/** Two lines before the ellipsis, for a description under a title (Kanban cards). */
export const TwoLines: Story = {
  name: 'Two lines',
  args: { lines: 2, children: 'Redirect old gallery links to the new client portal, then email clients the new address with a short note from the studio' },
  render: (args) => (
    <div className="w-56 font-body text-body-s">
      <TruncatedText {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText(/Redirect old gallery links/);
    await waitFor(() => expect(text).toHaveAttribute('data-truncated'));
  },
};

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText(/selene-weddings/);
    await waitFor(() => expect(text).toHaveAttribute('data-truncated'));
    await userEvent.tab();
    await expect(text).toHaveFocus();
    await waitFor(() => expect(document.querySelector('[data-slot=truncated-text][data-state$=open]')).not.toBeNull());
  },
};
