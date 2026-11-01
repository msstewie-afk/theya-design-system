import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { InfoCircle } from 'iconoir-react';
import { HelpIcon } from './help-icon';
import { Field } from './field';
import { Label } from './label';
import { TextField } from './text-field';
import { Switch } from './switch';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
import { helpIconGuidelines } from './help-icon.guidelines';

/**
 * HelpIcon — a question-mark glyph that reveals a short hint on hover or keyboard
 * focus. Reach for it when a label, a column header, or a number needs one line
 * of explanation that would be noise as permanent help text.
 *
 * Being a tooltip, the hint is supplementary and does not open on touch — never
 * put an instruction here that the user must have to finish the task. The
 * trigger carries its own accessible name: the hint text when it is a string,
 * otherwise `label`.
 */
const meta: Meta<typeof HelpIcon> = {
  title: 'Labels/HelpIcon',
  component: HelpIcon,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "A question mark next to a label, a column header or a number that shows one line of explanation on hover, focus or tap.",
      },
    },
    guidelines: helpIconGuidelines, layout: 'centered',
  },
  argTypes: {
    children: { control: 'text', description: 'The hint text shown in the tooltip.' },
    label: {
      control: 'text',
      description: 'Accessible name for the trigger. Defaults to the hint when it is a string.',
    },
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Preferred side for the hint (collision-aware).',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Alignment against the glyph along the chosen side.',
    },
    icon: { control: false, description: 'Replace the question-mark glyph.' },
  },
  args: {
    children: 'Renewal runs 30 days before expiry.',
    side: 'top',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** The glyph on its own. Hover or focus it to read the hint. */
export const Default: Story = {
  // Keyboard: the glyph is a Tab stop; focus shows the hint, Escape hides it.
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await expect(await within(document.body).findByRole('tooltip')).toHaveTextContent('Renewal runs 30 days before expiry.');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('tooltip')).toBeNull());
  },
};

/** The usual home: beside a field label. Label is a flex row, so the glyph
 * drops in as a sibling with no extra layout — the label's own text stays
 * the accessible label of the control. */
export const OnFieldLabel: Story = {
  args: { children: 'Clients open their galleries at this address.' },
  render: (args) => (
    <Field className="w-80">
      <Label htmlFor="portal-address">
        Portal address
        <HelpIcon {...args} />
      </Label>
      <TextField id="portal-address" placeholder="selene-weddings.aether.photo" />
    </Field>
  ),
};

/** On a switch row, where the label is short and the reason for the setting is not. */
export const OnSwitchRow: Story = {
  args: {
    children: 'Adds your logo to every preview; full-size downloads stay clean.',
    side: 'right',
  },
  render: (args) => (
    <div className="flex w-80 items-center justify-between gap-4 py-2">
      <Label htmlFor="watermark-previews">
        Watermark previews
        <HelpIcon {...args} />
      </Label>
      <Switch id="watermark-previews" defaultChecked />
    </div>
  ),
};

/** In a table header, where column names have to stay short. */
export const InTableHeader: Story = {
  parameters: { layout: 'padded', controls: { exclude: ['children', 'side'] } },
  render: (args) => (
    <Table className="max-w-xl">
      <TableHeader>
        <TableRow>
          <TableHead>Gallery</TableHead>
          <TableHead>
            <span className="inline-flex items-center gap-1">
              Studio
              <HelpIcon {...args} side="bottom">
                The studio that owns the gallery. Changing it moves its files.
              </HelpIcon>
            </span>
          </TableHead>
          <TableHead className="text-right">
            <span className="inline-flex items-center gap-1">
              Downloads
              <HelpIcon {...args} side="bottom" align="end">
                Full-size downloads in the current billing period.
              </HelpIcon>
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Golden hour</TableCell>
          <TableCell className="whitespace-nowrap">Helios Studio</TableCell>
          <TableCell className="text-right">1,284</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Blue hour</TableCell>
          <TableCell className="whitespace-nowrap">Selene Weddings</TableCell>
          <TableCell className="text-right">312</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

/** Swap the glyph with `icon` when the hint explains rather than helps. Pass
 * `label` whenever the hint is not a plain string. */
export const CustomIcon: Story = {
  args: {
    icon: <InfoCircle />,
    label: 'About this quota',
    children: (
      <>
        Counted per calendar month across <em>all</em> galleries.
      </>
    ),
  },
  render: (args) => (
    <p className="inline-flex max-w-xs items-center gap-1 font-body text-body-m text-[var(--color-text-text-subtler)]">
      Includes 10,000 downloads a month
      <HelpIcon {...args} />
    </p>
  ),
};

/** Long hints wrap inside the tooltip surface. */
export const LongHint: Story = {
  args: {
    children:
      'Archive copies are kept for 14 days on the Pro plan and 30 days on Business; the retention change applies to copies made from the next run onward.',
  },
  render: (args) => (
    <div className="flex items-center gap-1 font-body text-body-m text-[var(--color-text-text)]">
      Archive retention
      <HelpIcon {...args} />
    </div>
  ),
};
