import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { CompareFlow, ComparisonTable } from './comparison';
import { DEMO_ITEMS } from './demo-data';
import { comparisonGuidelines } from './comparison.guidelines';

const meta: Meta<typeof CompareFlow> = {
  title: 'Patterns: Catalog/Comparison',
  component: CompareFlow,
  tags: ['autodocs'],
  parameters: {
    guidelines: comparisonGuidelines,
    layout: 'padded',
    // target-size off: the Compare checkbox box is 20px, but its hit area is
    // 24px (Checkbox's ::after) and the visible "Compare" label toggles it
    // too. axe measures the box only, so it reports 2.5.8 here.
    a11y: { config: { rules: [{ id: 'target-size', enabled: false }] } },
  },
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
  args: { initialSelection: ['shieldwall', 'secret-scanner', 'login-guard', 'certpilot'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('checkbox', { name: 'Compare Vault Backup' })).toBeDisabled();
    await expect(canvas.getByText("That's the maximum of 4. Remove one to add another.")).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove CertPilot from comparison' }));
    await expect(canvas.getByRole('checkbox', { name: 'Compare Vault Backup' })).toBeEnabled();
  },
};

/**
 * Removing a pick from the tray moves focus to the next pick's remove
 * button, or the previous one when it was the last; when the tray empties
 * it unmounts and focus goes to the results list instead of <body>.
 */
export const TrayRemoveFocus: Story = {
  name: 'Test: tray remove keeps focus',
  args: { initialSelection: ['shieldwall', 'secret-scanner', 'login-guard'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole('region', { name: 'Comparison' });

    // Middle one: focus moves to the next pick.
    await userEvent.click(within(bar).getByRole('button', { name: 'Remove Secret Scanner from comparison' }));
    await waitFor(() => expect(within(bar).getByRole('button', { name: 'Remove Login Guard from comparison' })).toHaveFocus());

    // Last one, by keyboard: focus moves to the previous pick.
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(within(bar).getByRole('button', { name: 'Remove Shieldwall from comparison' })).toHaveFocus());

    // Only one: the tray goes away, focus lands on the results list.
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.queryByRole('region', { name: 'Comparison' })).not.toBeInTheDocument());
    await waitFor(() => expect(canvas.getByRole('checkbox', { name: 'Compare Shieldwall' }).closest('ul')).toHaveFocus());
  },
};

/** "Clear" empties the tray; focus goes to the results list instead of <body>. */
export const ClearFocus: Story = {
  name: 'Test: clear keeps focus',
  args: { initialSelection: ['shieldwall', 'login-guard'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole('region', { name: 'Comparison' });
    await userEvent.click(within(bar).getByRole('button', { name: 'Clear' }));
    await waitFor(() => expect(canvas.queryByRole('region', { name: 'Comparison' })).not.toBeInTheDocument());
    await waitFor(() => expect(canvas.getByRole('checkbox', { name: 'Compare Shieldwall' }).closest('ul')).toHaveFocus());
    await expect(canvas.getByRole('checkbox', { name: 'Compare Shieldwall' })).not.toBeChecked();
  },
};

/**
 * Removing a column in the table moves focus to the next column's remove
 * button, or the previous one when it was the last; dropping below two
 * returns to the results with focus on "Compare".
 */
export const TableRemoveFocus: Story = {
  name: 'Test: table remove keeps focus',
  args: { initialSelection: ['shieldwall', 'secret-scanner', 'login-guard', 'certpilot'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Compare (4)' }));
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Comparing 4 extensions' })).toHaveFocus());

    // First column: focus moves to the next column's remove button.
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Shieldwall from comparison' }));
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Remove Secret Scanner from comparison' })).toHaveFocus());

    // Last column, by keyboard: focus moves to the previous column's.
    canvas.getByRole('button', { name: 'Remove CertPilot from comparison' }).focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Remove Login Guard from comparison' })).toHaveFocus());

    // Below two: back to the results, focus on "Compare".
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Compare (1)' })).toHaveFocus());
  },
};

/** The table on its own: attribute column pinned, columns scroll sideways when narrow. */
export const Table: StoryObj<typeof ComparisonTable> = {
  render: () => <ComparisonTable items={DEMO_ITEMS.filter((i) => ['vault-backup', 'snapshot-pro', 'restore-point'].includes(i.id))} />,
};
