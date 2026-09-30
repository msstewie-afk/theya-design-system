import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Server } from 'iconoir-react';
import { DataTableCell } from './data-table-cell';
import { Table, TableBody, TableRow, TableCell } from './table';

const meta: Meta<typeof DataTableCell> = {
  title: 'Data Display/DataTableCell',
  component: DataTableCell,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The shared cell-rendering vocabulary for a DataTable: value kinds (text/mono/primary/status/badge/usage/sparkline), editable kinds (input/select/combobox/tags/date-range/…), and control kinds (selector/menu). Props are a discriminated union keyed by `kind` — each kind\'s own field set is documented on its own interface (TextCellProps, MonoCellProps, StatusCellProps, BadgeCellSingle/Multiple, UsageCellProps, SparklineCellProps, SelectorCellProps, etc. in data-table-cell.tsx), not flattened into one argTypes table here since the union would make most rows show as "-" for any single kind.',
      },
    },
  },
  argTypes: {
    kind: {
      control: 'select',
      options: ['text', 'mono', 'primary', 'status', 'badge', 'usage', 'sparkline', 'input', 'textarea', 'number', 'select', 'combobox', 'autocomplete', 'tags', 'date-range', 'switch', 'slider', 'selector', 'menu', 'custom'],
      description: 'Which cell vocabulary to render — see the per-kind interfaces for that kind\'s own props.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DataTableCell>;

/** A fortnight of requests, for the sparkline cells. */
const TRAFFIC = [8, 9, 7, 11, 10, 13, 12, 15, 14, 17, 16, 19, 21, 24];

const KIND_GRID = 'grid grid-cols-1 gap-1 border-b border-[var(--color-border-border-subtle)] py-3 sm:grid-cols-[9rem_1fr_1fr] sm:gap-4';

function KindHeader() {
  return (
    <div className={`${KIND_GRID} items-end py-2`}>
      <span className="font-mono text-body-s text-[var(--color-text-text-subtler)]">kind</span>
      <span className="font-mono text-body-s text-[var(--color-text-text-subtler)]">one line</span>
      <span className="font-mono text-body-s text-[var(--color-text-text-subtler)]">two lines</span>
    </div>
  );
}

function KindRow({ label, oneLine, twoLines }: { label: string; oneLine?: ReactNode; twoLines?: ReactNode }) {
  return (
    <div className={`${KIND_GRID} items-center last:border-b-0`}>
      <span className="font-mono text-body-s text-[var(--color-text-text-subtler)]">{label}</span>
      <div className="min-w-0 font-body text-body-m">{oneLine}</div>
      <div className="min-w-0 font-body text-body-m">{twoLines}</div>
    </div>
  );
}

const PLANS = [
  { value: 'Starter', label: 'Starter' },
  { value: 'Pro', label: 'Pro' },
  { value: 'Scale', label: 'Scale' },
];

const REGIONS = [
  { value: 'eu-west-1', label: 'eu-west-1', keywords: ['Ireland'] },
  { value: 'eu-central-1', label: 'eu-central-1', keywords: ['Frankfurt'] },
  { value: 'us-east-1', label: 'us-east-1', keywords: ['Virginia'] },
  { value: 'ap-south-1', label: 'ap-south-1', keywords: ['Mumbai'] },
];

const OWNERS = [
  { value: 'mira@seashell.dev', label: 'mira@seashell.dev' },
  { value: 'jules@seashell.dev', label: 'jules@seashell.dev' },
  { value: 'lucia@seashell.dev', label: 'lucia@seashell.dev' },
];

const TAGS = ['prod', 'staging', 'eu', 'us', 'internal'];

/** The editable kinds are controlled — the edited value lives in the story's state. */
function InputCell({ label, initial = '', lines, ...rest }: { label: string; initial?: string; lines?: 1 | 2; placeholder?: string; disabled?: boolean; invalid?: boolean; errorMessage?: string; mono?: boolean }) {
  const [value, setValue] = useState(initial);
  return <DataTableCell kind="input" value={value} onValueChange={setValue} label={label} lines={lines} {...rest} />;
}

function SelectCell({ label, initial = '', lines, ...rest }: { label: string; initial?: string; lines?: 1 | 2; placeholder?: string; disabled?: boolean; readOnly?: boolean; invalid?: boolean }) {
  const [value, setValue] = useState(initial);
  return <DataTableCell kind="select" value={value} onValueChange={setValue} options={PLANS} label={label} lines={lines} {...rest} />;
}

function NumberCell({ label, initial = null, lines, ...rest }: { label: string; initial?: number | null; lines?: 1 | 2; disabled?: boolean; invalid?: boolean; min?: number; max?: number }) {
  const [value, setValue] = useState<number | null>(initial);
  return <DataTableCell kind="number" value={value} onValueChange={setValue} label={label} lines={lines} {...rest} />;
}

function ComboboxCell({ label, initial = '', lines, ...rest }: { label: string; initial?: string; lines?: 1 | 2; placeholder?: string; disabled?: boolean; invalid?: boolean }) {
  const [value, setValue] = useState(initial);
  return <DataTableCell kind="combobox" value={value} onValueChange={setValue} options={REGIONS} label={label} lines={lines} {...rest} />;
}

function AutocompleteCell({ label, initial = '', lines, ...rest }: { label: string; initial?: string; lines?: 1 | 2; placeholder?: string; disabled?: boolean; invalid?: boolean }) {
  const [value, setValue] = useState(initial);
  return <DataTableCell kind="autocomplete" value={value} onValueChange={setValue} options={OWNERS} label={label} lines={lines} {...rest} />;
}

function TagsCell({ label, initial = [], lines, ...rest }: { label: string; initial?: string[]; lines?: 1 | 2; placeholder?: string; disabled?: boolean; invalid?: boolean }) {
  const [value, setValue] = useState<string[]>(initial);
  return <DataTableCell kind="tags" value={value} onValueChange={setValue} options={TAGS} label={label} lines={lines} {...rest} />;
}

function DateRangeCell({ label, initial, lines, ...rest }: { label: string; initial?: { from: Date; to?: Date }; lines?: 1 | 2; placeholder?: string; disabled?: boolean; readOnly?: boolean; invalid?: boolean }) {
  const [value, setValue] = useState<{ from: Date; to?: Date } | undefined>(initial);
  return <DataTableCell kind="date-range" value={value} onValueChange={(next) => setValue(next?.from ? { from: next.from, to: next.to } : undefined)} label={label} lines={lines} {...rest} />;
}

function SwitchCell({ label, initial = false, lines, ...rest }: { label: string; initial?: boolean; lines?: 1 | 2; disabled?: boolean }) {
  const [checked, setChecked] = useState(initial);
  return <DataTableCell kind="switch" checked={checked} onCheckedChange={setChecked} label={label} lines={lines} {...rest} />;
}

function SliderCell({ label, initial = 0, lines, ...rest }: { label: string; initial?: number; lines?: 1 | 2; disabled?: boolean; readOnly?: boolean }) {
  const [value, setValue] = useState(initial);
  return <DataTableCell kind="slider" value={value} onValueChange={setValue} formatValue={(percent) => `${percent}%`} label={label} lines={lines} {...rest} />;
}

function SelectorCell({ label, initial = false, disabled, lines }: { label: string; initial?: boolean | 'indeterminate'; disabled?: boolean; lines?: 1 | 2 }) {
  const [checked, setChecked] = useState<boolean | 'indeterminate'>(initial);
  return <DataTableCell kind="selector" checked={checked} onCheckedChange={setChecked} disabled={disabled} label={label} lines={lines} />;
}

/**
 * Every kind in both height groups, because the number of TEXT LINES picks
 * the row height: one line is `--wp-row-h`, two is `--wp-row-h-2`. The
 * text-bearing kinds — text/mono/primary — grow a real second line from
 * `secondary`; the rest hold no text of their own, so their two-line copy is
 * the same cell with `lines={2}` — content still centres, only the box is
 * the taller one.
 */
export const Kinds: Story = {
  args: { value: '' },
  render: () => (
    <div className="max-w-3xl">
      <KindHeader />
      <KindRow label='kind="text"' oneLine={<DataTableCell value="Frankfurt" />} twoLines={<DataTableCell value="Frankfurt" secondary="eu-central-1" secondaryMono />} />
      <KindRow label="text + mono" oneLine={<DataTableCell value="shop.seashell.dev" mono />} twoLines={<DataTableCell value="shop.seashell.dev" mono secondary="Theya Seashell storefront" />} />
      <KindRow label="text + muted" oneLine={<DataTableCell value="Updated 2 hours ago" muted />} twoLines={<DataTableCell value="Updated 2 hours ago" muted secondary="by mira@seashell.dev" />} />
      <KindRow label='kind="mono"' oneLine={<DataTableCell kind="mono" value="eu-west-1" />} twoLines={<DataTableCell kind="mono" value="eu-west-1" secondary="Frankfurt" />} />
      <KindRow label="mono + muted" oneLine={<DataTableCell kind="mono" value="v2.4.0" muted />} twoLines={<DataTableCell kind="mono" value="v2.4.0" muted secondary="Released 3 days ago" />} />
      <KindRow
        label='kind="primary"'
        oneLine={<DataTableCell kind="primary" leading={<Server width={16} height={16} />} value="shop.seashell.dev" mono />}
        twoLines={<DataTableCell kind="primary" leading={<Server width={16} height={16} />} value="shop.seashell.dev" mono secondary="Theya Seashell storefront" />}
      />
      <KindRow label='kind="status"' oneLine={<DataTableCell kind="status" tone="success" label="Running" />} twoLines={<DataTableCell kind="status" tone="success" label="Running" lines={2} />} />
      <KindRow label='kind="badge"' oneLine={<DataTableCell kind="badge" tone="primary" label="Pro" />} twoLines={<DataTableCell kind="badge" tone="primary" label="Pro" lines={2} />} />
      <KindRow
        label="badge + badges"
        oneLine={
          <DataTableCell
            kind="badge"
            badges={[
              { label: 'Expiring soon', tone: 'warning' },
              { label: 'Auto-renew', tone: 'neutral' },
              { label: 'DV', tone: 'info' },
              { label: 'Wildcard', tone: 'neutral' },
            ]}
          />
        }
        twoLines={
          <DataTableCell
            kind="badge"
            lines={2}
            badges={[
              { label: 'Expiring soon', tone: 'warning' },
              { label: 'Auto-renew', tone: 'neutral' },
              { label: 'DV', tone: 'info' },
              { label: 'Wildcard', tone: 'neutral' },
            ]}
          />
        }
      />
      <KindRow
        label='kind="usage"'
        oneLine={<DataTableCell kind="usage" value={7.2} total={10} label="7.2 GB of 10 GB" header="Storage" />}
        twoLines={<DataTableCell kind="usage" value={7.2} total={10} label="7.2 GB of 10 GB" header="Storage" lines={2} />}
      />
      <KindRow
        label='kind="sparkline"'
        oneLine={<DataTableCell kind="sparkline" data={TRAFFIC} label="1.2k" tone="success" area ariaLabel="Requests trending up over the last 14 days" />}
        twoLines={<DataTableCell kind="sparkline" data={TRAFFIC} label="1.2k" tone="success" area ariaLabel="Requests trending up over the last 14 days" lines={2} />}
      />
      <KindRow label='kind="input"' oneLine={<InputCell label="Display name for shop.seashell.dev" initial="Theya Seashell storefront" />} twoLines={<InputCell label="Display name for blog.seashell.dev" initial="Engineering blog" lines={2} />} />
      <KindRow label='kind="select"' oneLine={<SelectCell label="Plan for shop.seashell.dev" initial="Pro" />} twoLines={<SelectCell label="Plan for blog.seashell.dev" initial="Starter" lines={2} />} />
      <KindRow label='kind="number"' oneLine={<NumberCell label="Sites for shop.seashell.dev" initial={12} />} twoLines={<NumberCell label="Sites for blog.seashell.dev" initial={4} lines={2} />} />
      <KindRow label='kind="combobox"' oneLine={<ComboboxCell label="Region for shop.seashell.dev" initial="eu-west-1" />} twoLines={<ComboboxCell label="Region for blog.seashell.dev" initial="us-east-1" lines={2} />} />
      <KindRow label='kind="autocomplete"' oneLine={<AutocompleteCell label="Owner of shop.seashell.dev" initial="mira@seashell.dev" />} twoLines={<AutocompleteCell label="Owner of blog.seashell.dev" initial="" lines={2} />} />
      <KindRow label='kind="tags"' oneLine={<TagsCell label="Tags for shop.seashell.dev" initial={['prod', 'eu']} />} twoLines={<TagsCell label="Tags for blog.seashell.dev" initial={['staging']} lines={2} />} />
      <KindRow
        label='kind="date-range"'
        oneLine={<DateRangeCell label="Billing period for shop.seashell.dev" initial={{ from: new Date(2026, 8, 1), to: new Date(2026, 8, 30) }} />}
        twoLines={<DateRangeCell label="Billing period for blog.seashell.dev" initial={undefined} lines={2} />}
      />
      <KindRow label='kind="switch"' oneLine={<SwitchCell label="Backups for shop.seashell.dev" initial />} twoLines={<SwitchCell label="Backups for blog.seashell.dev" lines={2} />} />
      <KindRow label='kind="slider"' oneLine={<SliderCell label="Traffic weight for shop.seashell.dev" initial={40} />} twoLines={<SliderCell label="Traffic weight for blog.seashell.dev" initial={70} lines={2} />} />
      <KindRow label='kind="selector"' oneLine={<SelectorCell label="Select shop.seashell.dev" />} twoLines={<SelectorCell label="Select blog.seashell.dev" lines={2} />} />
      <KindRow
        label='kind="custom"'
        oneLine={
          <DataTableCell kind="custom">
            <span className="flex items-center gap-2 font-body text-body-m">
              <span className="size-5 shrink-0 rounded-full bg-[var(--color-bg-primary-bg-primary-subtle)]" aria-hidden="true" />
              Anything you render yourself
            </span>
          </DataTableCell>
        }
        twoLines={
          <DataTableCell kind="custom" lines={2}>
            <span className="flex items-center gap-2 font-body text-body-m">
              <span className="size-5 shrink-0 rounded-full bg-[var(--color-bg-primary-bg-primary-subtle)]" aria-hidden="true" />
              Anything you render yourself
            </span>
          </DataTableCell>
        }
      />
    </div>
  ),
};

const CERTIFICATE_BADGES = [
  { label: 'Expiring soon', tone: 'warning' as const },
  { label: 'Auto-renew', tone: 'neutral' as const },
  { label: 'DV', tone: 'info' as const },
  { label: 'Wildcard', tone: 'neutral' as const },
];

/**
 * `badges` sorts worst severity first and never wraps. As the column
 * narrows past what all four badges need, they collapse from the tail
 * into one trailing badge styled with the worst severity it stands
 * in for — "2 more", then "3 more" — skipping straight from 0 to 2.
 */
export const MultipleBadges: Story = {
  args: { value: '' },
  render: () => (
    <div className="flex max-w-full flex-col gap-4">
      {[420, 260, 220, 170, 90].map((width) => (
        <div key={width} className="flex items-center gap-3">
          <span className="w-16 shrink-0 font-mono text-body-s text-[var(--color-text-text-subtler)]">{width}px</span>
          <div className="shrink-0 rounded-[var(--size-border-radius-border-radius-md)] border border-dashed border-[var(--color-border-border-subtle)] p-2" style={{ width }}>
            <DataTableCell kind="badge" badges={CERTIFICATE_BADGES} />
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * The editable kinds, at rest: each field renders with its own normal
 * border and height (see the DataTableCell source note on why this
 * design system does not use a borderless "quiet" reskin — TextField
 * wraps its `<input>` in its own div, which breaks that trick).
 */
export const Editable: Story = {
  args: { value: '' },
  render: () => (
    <Table className="max-w-xl">
      <TableBody>
        <Row label='kind="input"'>
          <InputCell label="Display name for shop.seashell.dev" initial="Theya Seashell storefront" />
        </Row>
        <Row label="mono">
          <InputCell label="Domain for shop.seashell.dev" initial="shop.seashell.dev" mono />
        </Row>
        <Row label="invalid">
          <InputCell label="Domain for api.seashell.dev" initial="api acme io" invalid errorMessage="A domain cannot contain spaces" />
        </Row>
        <Row label="disabled">
          <InputCell label="Domain for docs.seashell.dev" initial="docs.seashell.dev" mono disabled />
        </Row>
        <Row label='kind="select"'>
          <SelectCell label="Plan for shop.seashell.dev" initial="Pro" />
        </Row>
        <Row label="invalid">
          <SelectCell label="Plan for api.seashell.dev" invalid />
        </Row>
        <Row label="disabled">
          <SelectCell label="Plan for docs.seashell.dev" initial="Scale" disabled />
        </Row>
        <Row label='kind="date-range"'>
          <DateRangeCell label="Billing period for shop.seashell.dev" initial={{ from: new Date(2026, 8, 1), to: new Date(2026, 8, 30) }} />
        </Row>
        <Row label="disabled">
          <DateRangeCell label="Billing period for docs.seashell.dev" initial={{ from: new Date(2026, 8, 1), to: new Date(2026, 8, 30) }} disabled />
        </Row>
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(document.body);

    // input: controlled value round-trips.
    const name = canvas.getByRole('textbox', { name: 'Display name for shop.seashell.dev' });
    await userEvent.clear(name);
    await userEvent.type(name, 'Storefront');
    await expect(name).toHaveValue('Storefront');

    // invalid: flagged and described by its message.
    const bad = canvas.getByRole('textbox', { name: 'Domain for api.seashell.dev' });
    await expect(bad).toHaveAttribute('aria-invalid', 'true');
    await expect(bad).toHaveAccessibleDescription('A domain cannot contain spaces');
    await expect(canvas.getByRole('textbox', { name: 'Domain for docs.seashell.dev' })).toBeDisabled();

    // select: keyboard open, move, pick.
    const plan = canvas.getByRole('combobox', { name: 'Plan for shop.seashell.dev' });
    await expect(plan).toHaveTextContent('Pro');
    plan.focus();
    await userEvent.keyboard('{Enter}');
    await page.findByRole('listbox');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(page.queryByRole('listbox')).toBeNull());
    await expect(plan).toHaveTextContent('Scale');

    // date-range: the range rides on the description (aria-label replaces the text).
    await expect(canvas.getByRole('button', { name: 'Billing period for shop.seashell.dev' })).toHaveAccessibleDescription('Sep 1, 2026 – Sep 30, 2026');
    await expect(canvas.getByRole('button', { name: 'Billing period for docs.seashell.dev' })).toBeDisabled();
  },
};

/**
 * `readOnly` shows the value without letting it change. A read-only select
 * stays in the tab order (so the value can be reached and read) but never
 * opens; a read-only input is a normal read-only text field.
 */
export const ReadOnly: Story = {
  name: 'Read-only',
  args: { value: '' },
  render: () => (
    <Table className="max-w-xl">
      <TableBody>
        <Row label='kind="select"'>
          <SelectCell label="Plan for shop.seashell.dev" initial="Pro" readOnly />
        </Row>
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const plan = within(canvasElement).getByRole('combobox', { name: 'Plan for shop.seashell.dev' });
    await expect(plan).toHaveAttribute('aria-readonly', 'true');
    await expect(plan).not.toHaveAttribute('tabindex', '-1');
    plan.focus();
    await expect(plan).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(plan);
    await new Promise((r) => setTimeout(r, 150));
    await expect(within(document.body).queryByRole('listbox')).toBeNull();
    await expect(plan).toHaveTextContent('Pro');
  },
};

/**
 * `loading` draws the placeholder for the cell's own kind, in the same
 * box, so the table keeps its silhouette when data lands instead of
 * redrawing into a different shape. Control kinds render nothing —
 * a checkbox or menu is chrome, and a placeholder there would promise
 * a control that isn't there yet.
 */
export const Loading: Story = {
  args: { value: '' },
  render: () => (
    <div className="max-w-3xl">
      <KindHeader />
      <KindRow label='kind="text"' oneLine={<DataTableCell value="" loading />} twoLines={<DataTableCell value="" secondary="" loading />} />
      <KindRow label='kind="mono"' oneLine={<DataTableCell kind="mono" value="" loading />} twoLines={<DataTableCell kind="mono" value="" secondary="" loading />} />
      <KindRow label='kind="primary"' oneLine={<DataTableCell kind="primary" value="" leading loading />} twoLines={<DataTableCell kind="primary" value="" leading secondary="" loading />} />
      <KindRow label='kind="status"' oneLine={<DataTableCell kind="status" label="" loading />} twoLines={<DataTableCell kind="status" label="" lines={2} loading />} />
      <KindRow label='kind="badge"' oneLine={<DataTableCell kind="badge" label="" loading />} twoLines={<DataTableCell kind="badge" label="" lines={2} loading />} />
      <KindRow label='kind="usage"' oneLine={<DataTableCell kind="usage" value={0} total={0} loading />} twoLines={<DataTableCell kind="usage" value={0} total={0} lines={2} loading />} />
      <KindRow label='kind="sparkline"' oneLine={<DataTableCell kind="sparkline" data={[]} ariaLabel="" loading />} twoLines={<DataTableCell kind="sparkline" data={[]} ariaLabel="" lines={2} loading />} />
      <KindRow label='kind="input"' oneLine={<DataTableCell kind="input" value="" label="" loading />} />
      <KindRow label='kind="select"' oneLine={<DataTableCell kind="select" value="" options={[]} label="" loading />} />
      <KindRow label='kind="slider"' oneLine={<DataTableCell kind="slider" value={0} label="" loading />} />
      <KindRow label='kind="selector"' oneLine={<DataTableCell kind="selector" checked={false} label="" loading />} />
      <KindRow label='kind="custom"' oneLine={<DataTableCell kind="custom" loading>{null}</DataTableCell>} />
    </div>
  ),
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <TableRow>
      <TableCell className="w-40 font-body text-body-m text-[var(--color-text-text-subtler)]">{label}</TableCell>
      <TableCell>{children}</TableCell>
    </TableRow>
  );
}

function Demo() {
  const [text, setText] = useState('shop.seashell.dev');
  const [selectValue, setSelectValue] = useState('active');
  const [switchOn, setSwitchOn] = useState(true);
  const [sliderVal, setSliderVal] = useState(40);

  return (
    <Table className="w-[420px]">
      <TableBody>
        <Row label="text">
          <DataTableCell value="shop.seashell.dev" />
        </Row>
        <Row label="mono">
          <DataTableCell kind="mono" value="a1b2c3d4" />
        </Row>
        <Row label="primary">
          <DataTableCell kind="primary" leading={<Server width={16} height={16} />} value="shop.seashell.dev" secondary="Production" />
        </Row>
        <Row label="status">
          <DataTableCell kind="status" tone="success" label="Running" />
        </Row>
        <Row label="badge">
          <DataTableCell kind="badge" tone="success" label="Active" />
        </Row>
        <Row label="usage">
          <DataTableCell kind="usage" value={7.2} total={10} label="7.2 GB of 10 GB" />
        </Row>
        <Row label="input">
          <DataTableCell kind="input" value={text} onValueChange={setText} label="Domain" />
        </Row>
        <Row label="select">
          <DataTableCell
            kind="select"
            value={selectValue}
            onValueChange={setSelectValue}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
            ]}
            label="Status"
          />
        </Row>
        <Row label="switch">
          <DataTableCell kind="switch" checked={switchOn} onCheckedChange={setSwitchOn} label="Enabled" />
        </Row>
        <Row label="slider">
          <DataTableCell kind="slider" value={sliderVal} onValueChange={setSliderVal} formatValue={(v) => `${v}%`} label="CPU limit" />
        </Row>
        <Row label="loading">
          <DataTableCell kind="primary" leading secondary loading />
        </Row>
      </TableBody>
    </Table>
  );
}

export const AllKinds: Story = {
  name: 'All kinds',
  render: () => <Demo />,
};
