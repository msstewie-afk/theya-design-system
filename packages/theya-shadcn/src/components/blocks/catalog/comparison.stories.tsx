import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { CompareFlow, ComparisonTable } from './comparison';
import { DEMO_ITEMS } from './demo-data';

const meta: Meta<typeof CompareFlow> = {
  title: 'Patterns: Catalog/Comparison',
  component: CompareFlow,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { items: DEMO_ITEMS.slice(0, 9), getHref: (i) => `#${i.id}` },
  decorators: [(Story) => <div className="max-w-6xl">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof CompareFlow>;

/** Tick "Compare" on cards, the tray collects them, "Compare (n)" opens the table. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Compare Shieldwall' }));
    const bar = canvas.getByRole('region', { name: 'Comparison' });
    const go = within(bar).getByRole('button', { name: 'Compare (1)' });
    await expect(go).toHaveAccessibleDescription('Pick at least 2 to compare.');
    await userEvent.click(go);
    await expect(canvas.queryByRole('heading', { name: /Comparing/ })).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Compare Login Guard' }));
    await userEvent.click(within(bar).getByRole('button', { name: 'Compare (2)' }));
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Comparing 2 extensions' })).toHaveFocus());

    // Both are Security: the row goes away with "Only differences".
    await expect(canvas.getByRole('rowheader', { name: 'Category' })).toBeVisible();
    await userEvent.click(canvas.getByRole('switch', { name: 'Only differences' }));
    await expect(canvas.queryByRole('rowheader', { name: 'Category' })).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Back to results' }));
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Compare (2)' })).toHaveFocus());
    await expect(canvas.getByRole('checkbox', { name: 'Compare Login Guard' })).toBeChecked();
  },
};

/** At the limit, the other cards can't be added and the tray says why. */
export const Full: Story = {
  args: { initialSelection: ['shieldwall', 'malware-sweep', 'login-guard', 'certpilot'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('checkbox', { name: 'Compare Vault Backup' })).toBeDisabled();
    await expect(canvas.getByText("That's the maximum of 4. Remove one to add another.")).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove CertPilot from comparison' }));
    await expect(canvas.getByRole('checkbox', { name: 'Compare Vault Backup' })).toBeEnabled();
  },
};

/** The table on its own: attribute column pinned, columns scroll sideways when narrow. */
export const Table: StoryObj<typeof ComparisonTable> = {
  render: () => <ComparisonTable items={DEMO_ITEMS.filter((i) => ['vault-backup', 'snapshot-pro', 'restore-point'].includes(i.id))} />,
};
