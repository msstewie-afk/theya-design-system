import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { SearchBox } from './search-box';
import { DEMO_INDEX, DEMO_RECENT } from './demo-data';

const meta: Meta<typeof SearchBox> = {
  title: 'Patterns: Search/SearchBox',
  component: SearchBox,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { index: DEMO_INDEX, defaultRecent: DEMO_RECENT, onSearch: fn(), onNavigate: fn() },
  // Room for the open list inside the story frame.
  decorators: [(Story) => <div className="min-h-[34rem] max-w-xl">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof SearchBox>;

/** Recent searches on focus; completions and direct matches while typing; Enter searches what's typed. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Search' });
    await userEvent.click(input);
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('option', { name: 'backup schedule' })).toBeVisible();

    await userEvent.type(input, 'back');
    await expect(canvas.getByRole('group', { name: 'Suggestions' })).toBeVisible();
    await expect(canvas.getByRole('group', { name: 'Go to' })).toBeVisible();
    await userEvent.keyboard('{ArrowDown}');
    const first = canvas.getAllByRole('option')[0];
    await expect(input).toHaveAttribute('aria-activedescendant', first.id);
    await userEvent.keyboard('{Enter}');
    await expect(args.onSearch).toHaveBeenCalledWith('backup schedule');
    await expect(input).toHaveAttribute('aria-expanded', 'false');

    await userEvent.clear(input);
    await userEvent.type(input, 'northwind_app');
    await userEvent.click(canvas.getByRole('option', { name: /^northwind_app/ }));
    await expect(args.onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: 'db4' }));

    await userEvent.clear(input);
    await userEvent.type(input, 'dkim{Enter}');
    await expect(args.onSearch).toHaveBeenLastCalledWith('dkim');
  },
};

/** Escape closes the list first, then clears the field; "/" focuses it from anywhere. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Search' });
    await userEvent.keyboard('/');
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.type(input, 'mail');
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toHaveValue('mail');
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('');
  },
};

/** "Clear recent searches" empties the list. */
export const ClearRecent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox', { name: 'Search' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Clear recent searches' }));
    await expect(canvas.queryByRole('option')).not.toBeInTheDocument();
  },
};
