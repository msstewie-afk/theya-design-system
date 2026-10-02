import type { Meta, StoryObj } from '@storybook/react';
import { InfoCircle } from 'iconoir-react';
import { HelpIcon } from './help-icon';
import { Field } from './field';
import { Label } from './label';
import { TextField } from './text-field';
import { Switch } from './switch';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';

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
  parameters: { layout: 'centered' },
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
export const Default: Story = {};

/** The usual home: beside a field label. Label is a flex row, so the glyph
 * drops in as a sibling with no extra layout — the label's own text stays
 * the accessible label of the control. */
export const OnFieldLabel: Story = {
  args: { children: 'Used as the mail HELO name and in TLS certificates.' },
  render: (args) => (
    <Field className="w-80">
      <Label htmlFor="hostname">
        Hostname
        <HelpIcon {...args} />
      </Label>
      <TextField id="hostname" placeholder="shop.seashell.dev" />
    </Field>
  ),
};

/** On a switch row, where the label is short and the reason for the setting is not. */
export const OnSwitchRow: Story = {
  args: {
    children: 'Redirects every http:// request to https:// with a 301.',
    side: 'right',
  },
  render: (args) => (
    <div className="flex w-80 items-center justify-between gap-4 py-2">
      <Label htmlFor="force-https">
        Force HTTPS
        <HelpIcon {...args} />
      </Label>
      <Switch id="force-https" defaultChecked />
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
          <TableHead>Site</TableHead>
          <TableHead>
            <span className="inline-flex items-center gap-1">
              Region
              <HelpIcon {...args} side="bottom">
                Where the site is served from. Changing it re-deploys.
              </HelpIcon>
            </span>
          </TableHead>
          <TableHead className="text-right">
            <span className="inline-flex items-center gap-1">
              Bandwidth
              <HelpIcon {...args} side="bottom" align="end">
                Outbound traffic in the current billing period.
              </HelpIcon>
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-mono">shop.seashell.dev</TableCell>
          <TableCell className="font-mono">eu-west-1</TableCell>
          <TableCell className="text-right">7.2 GB</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-mono">docs.seashell.dev</TableCell>
          <TableCell className="font-mono">us-east-1</TableCell>
          <TableCell className="text-right">1.4 GB</TableCell>
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
        Counted per calendar month for <span className="font-mono">eu-west-1</span>.
      </>
    ),
  },
  render: (args) => (
    <p className="inline-flex max-w-xs items-center gap-1 font-body text-body-m text-[var(--color-text-text-subtler)]">
      Included bandwidth is 10 GB
      <HelpIcon {...args} />
    </p>
  ),
};

/** Long hints wrap inside the tooltip surface. */
export const LongHint: Story = {
  args: {
    children:
      'Backups are kept for 14 days on the Pro plan and 30 days on Scale; the retention change applies to snapshots taken from the next run onward.',
  },
  render: (args) => (
    <div className="flex items-center gap-1 font-body text-body-m text-[var(--color-text-text)]">
      Backup retention
      <HelpIcon {...args} />
    </div>
  ),
};
