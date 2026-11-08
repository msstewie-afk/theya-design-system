import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Button } from './button';
import { TextField } from './text-field';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { DensityToggle } from './density-toggle';
import type { Density } from './use-density';
import { densityToggleGuidelines } from './density-toggle.guidelines';
import { resetFocus, tabTo } from '../../test/keyboard';
import { testOnly } from '../../lib/test-only';

// Notes moved from the Docs description (the page now shows a reader-facing
// summary):
//   Compact / default / comfortable. Uncontrolled it sets data-density on
//   <html>; controlled (value + onValueChange) it only reports the choice, for
//   one region. Density resizes controls one step along the size ramp, table
//   rows and menu items — see DENSITY.md.
const meta: Meta<typeof DensityToggle> = {
  title: 'Actions/DensityToggle',
  component: DensityToggle,
  tags: ['autodocs'],
  parameters: {
    guidelines: densityToggleGuidelines,
    docs: {
      description: {
        component:
          "Lets people choose how tight the interface is: compact, default or comfortable. One option is always on.",
      },
    },
  },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md'], description: 'sm (32px) for a toolbar, md (40px) for a settings form.' },
    value: { control: false },
    onValueChange: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof DensityToggle>;

const ROWS = [
  { portal: 'l4.aether.photo', owner: 'Thea Marlow', plan: 'Business' },
  { portal: 'eos.aether.photo', owner: 'Dawn Ellery', plan: 'Pro' },
  { portal: 'lab.aether.photo', owner: 'Phoebe Lark', plan: 'Free' },
];

function Sample({ label = 'Client portals' }: { label?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <TextField label="Portal address" placeholder="studio.aether.photo" className="w-48" />
        <Button>Add portal</Button>
      </div>
      <Table containerLabel={label}>
        <TableHeader>
          <TableRow>
            <TableHead>Portal</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Plan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.map((row) => (
            <TableRow key={row.portal}>
              <TableCell>{row.portal}</TableCell>
              <TableCell>{row.owner}</TableCell>
              <TableCell>{row.plan}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** The interactive example: each option sets the density of the whole page and one is always on; `size` in the Controls below switches between toolbar and form height. */
export const Playground: Story = {
  // Page-wide: each press moves <html data-density>, "Default" removes it.
  // Ends on Default so the page is left as it was.
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const html = document.documentElement;
    await userEvent.click(canvas.getByRole('radio', { name: 'Compact' }));
    await waitFor(() => expect(html.getAttribute('data-density')).toBe('compact'));
    await expect(canvas.getByRole('radio', { name: 'Compact' })).toHaveAttribute('aria-checked', 'true');
    // Pressing the active option again keeps it on (never zero options).
    await userEvent.click(canvas.getByRole('radio', { name: 'Compact' }));
    await expect(html.getAttribute('data-density')).toBe('compact');
    await userEvent.click(canvas.getByRole('radio', { name: 'Comfortable' }));
    await waitFor(() => expect(html.getAttribute('data-density')).toBe('comfortable'));
    await userEvent.click(canvas.getByRole('radio', { name: 'Default' }));
    await waitFor(() => expect(html.hasAttribute('data-density')).toBe(false));

    // Keyboard: one tab stop on the selected option; arrows move, Space picks.
    resetFocus();
    await tabTo(canvas.getByRole('radio', { name: 'Default' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: 'Comfortable' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await waitFor(() => expect(html.getAttribute('data-density')).toBe('comfortable'));
    await userEvent.keyboard('{ArrowLeft} ');
    await waitFor(() => expect(html.hasAttribute('data-density')).toBe(false));
  }),
};

/** The same form and table in all three modes, side by side. Each column is a `data-density` region. */
export const AllDensities: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid gap-6 lg:grid-cols-3">
      {(['compact', 'default', 'comfortable'] as const).map((density) => (
        <section key={density} data-density={density} aria-labelledby={`density-${density}`} className="flex min-w-0 flex-col gap-2">
          <h2 id={`density-${density}`} className="font-heading text-heading-2xs uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]">{density}</h2>
          <Sample label={`Client portals, ${density}`} />
        </section>
      ))}
    </div>
  ),
};

/** Controlled: the toggle drives one region only — a dense table on an otherwise regular page. */
export const ControlledRegion: Story = {
  parameters: { layout: 'padded' },
  render: function Render() {
    const [density, setDensity] = useState<Density>('compact');
    return (
      <div className="flex max-w-xl flex-col gap-3">
        <DensityToggle value={density} onValueChange={setDensity} />
        <div data-density={density}>
          <Sample />
        </div>
      </div>
    );
  },
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvasElement.querySelector('[data-density]')!;
    await expect(region).toHaveAttribute('data-density', 'compact');
    await userEvent.click(canvas.getByRole('radio', { name: 'Comfortable' }));
    await waitFor(() => expect(region).toHaveAttribute('data-density', 'comfortable'));
    // Controlled: <html> is left alone.
    await expect(document.documentElement.getAttribute('data-density')).not.toBe('comfortable');
  }),
};
