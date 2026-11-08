import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { MediaImage } from 'iconoir-react';
import { DataTableCell } from './data-table-cell';
import { Table, TableBody, TableRow, TableCell } from './table';
import { dataTableCellGuidelines } from './data-table-cell.guidelines';
import { testOnly } from '../../lib/test-only';

// Notes moved from the Docs description (the page now shows a reader-facing
// summary):
//   The shared cell-rendering vocabulary for a DataTable: value kinds
//   (text/mono/primary/status/badge/usage/sparkline), editable kinds
//   (input/select/combobox/tags/date-range/…), and control kinds
//   (selector/menu). Props are a discriminated union keyed by `kind` — each
//   kind's own field set is documented on its own interface (TextCellProps,
//   MonoCellProps, StatusCellProps, BadgeCellSingle/Multiple, UsageCellProps,
//   SparklineCellProps, SelectorCellProps, etc. in data-table-cell.tsx), not
//   flattened into one argTypes table here since the union would make most
//   rows show as "-" for any single kind.
const meta: Meta<typeof DataTableCell> = {
  title: 'Data/DataTableCell',
  component: DataTableCell,
  tags: ['autodocs'],
  parameters: {
    guidelines: dataTableCellGuidelines,
    docs: {
      description: {
        component:
          "The cells of a DataTable, one kind per type of content — text, status, usage, a sparkline — plus editable cells for changing a value right in the table.",
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

/** A fortnight of downloads, for the sparkline cells. */
const DOWNLOADS = [8, 9, 7, 11, 10, 13, 12, 15, 14, 17, 16, 19, 21, 24];

const KIND_GRID = 'grid grid-cols-1 gap-1 border-b border-[var(--color-border-border)] py-3 sm:grid-cols-[9rem_1fr_1fr] sm:gap-4';

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

/** Usage rights for a gallery. Order matters: the Editable play test moves Web -> Print. */
const LICENSES = [
  { value: 'Personal', label: 'Personal' },
  { value: 'Web', label: 'Web' },
  { value: 'Print', label: 'Print' },
];

const STUDIOS = [
  { value: 'Helios Studio', label: 'Helios Studio', keywords: ['Commercial', 'Product'] },
  { value: 'Selene Weddings', label: 'Selene Weddings', keywords: ['Weddings', 'Night'] },
  { value: 'Eos Portraits', label: 'Eos Portraits', keywords: ['Portraits', 'Morning'] },
  { value: 'Othrys Lodge', label: 'Othrys Lodge', keywords: ['Location'] },
];

const PHOTOGRAPHERS = [
  { value: 'thea@aether.photo', label: 'thea@aether.photo' },
  { value: 'elio@aether.photo', label: 'elio@aether.photo' },
  { value: 'selin@aether.photo', label: 'selin@aether.photo' },
];

/** License badges for the multi-badge examples: rights, renewal and expiry. */
const LICENSE_BADGES = [
  { label: 'Expiring soon', tone: 'warning' as const },
  { label: 'Auto-renew', tone: 'neutral' as const },
  { label: 'Print', tone: 'info' as const },
  { label: 'Editorial', tone: 'neutral' as const },
];

const TAGS = ['portrait', 'wedding', 'print', 'web', 'raw', 'client pick'];

/** The editable kinds are controlled — the edited value lives in the story's state. */
function InputCell({ label, initial = '', lines, ...rest }: { label: string; initial?: string; lines?: 1 | 2; placeholder?: string; disabled?: boolean; invalid?: boolean; errorMessage?: string; mono?: boolean }) {
  const [value, setValue] = useState(initial);
  return <DataTableCell kind="input" value={value} onValueChange={setValue} label={label} lines={lines} {...rest} />;
}

function SelectCell({ label, initial = '', lines, ...rest }: { label: string; initial?: string; lines?: 1 | 2; placeholder?: string; disabled?: boolean; readOnly?: boolean; invalid?: boolean; errorMessage?: string }) {
  const [value, setValue] = useState(initial);
  return <DataTableCell kind="select" value={value} onValueChange={setValue} options={LICENSES} label={label} lines={lines} {...rest} />;
}

function NumberCell({ label, initial = null, lines, ...rest }: { label: string; initial?: number | null; lines?: 1 | 2; disabled?: boolean; invalid?: boolean; min?: number; max?: number }) {
  const [value, setValue] = useState<number | null>(initial);
  return <DataTableCell kind="number" value={value} onValueChange={setValue} label={label} lines={lines} {...rest} />;
}

function ComboboxCell({ label, initial = '', lines, ...rest }: { label: string; initial?: string; lines?: 1 | 2; placeholder?: string; disabled?: boolean; invalid?: boolean }) {
  const [value, setValue] = useState(initial);
  return <DataTableCell kind="combobox" value={value} onValueChange={setValue} options={STUDIOS} label={label} lines={lines} {...rest} />;
}

function AutocompleteCell({ label, initial = '', lines, ...rest }: { label: string; initial?: string; lines?: 1 | 2; placeholder?: string; disabled?: boolean; invalid?: boolean }) {
  const [value, setValue] = useState(initial);
  return <DataTableCell kind="autocomplete" value={value} onValueChange={setValue} options={PHOTOGRAPHERS} label={label} lines={lines} {...rest} />;
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
 * the row height: one line is `--dt-row-h`, two is `--dt-row-h-2`. The
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
      <KindRow label='kind="text"' oneLine={<DataTableCell value="Helios Studio" />} twoLines={<DataTableCell value="Helios Studio" secondary="helios.aether.photo" secondaryMono />} />
      <KindRow label="text + mono" oneLine={<DataTableCell value="DAWN_0412.jpg" mono />} twoLines={<DataTableCell value="DAWN_0412.jpg" mono secondary="First light · 24 MB" />} />
      <KindRow label="text + muted" oneLine={<DataTableCell value="Updated 2 hours ago" muted />} twoLines={<DataTableCell value="Updated 2 hours ago" muted secondary="by thea@aether.photo" />} />
      <KindRow label='kind="mono"' oneLine={<DataTableCell kind="mono" value="GOLDEN_0907.tif" />} twoLines={<DataTableCell kind="mono" value="GOLDEN_0907.tif" secondary="Golden hour" />} />
      <KindRow label="mono + muted" oneLine={<DataTableCell kind="mono" value="L4_moonrise.raw" muted />} twoLines={<DataTableCell kind="mono" value="L4_moonrise.raw" muted secondary="Uploaded 3 days ago" />} />
      <KindRow
        label='kind="primary"'
        oneLine={<DataTableCell kind="primary" leading={<MediaImage width={16} height={16} />} value="Golden hour" />}
        twoLines={<DataTableCell kind="primary" leading={<MediaImage width={16} height={16} />} value="Golden hour" secondary="Helios Studio" />}
      />
      <KindRow label='kind="status"' oneLine={<DataTableCell kind="status" tone="success" label="Active" />} twoLines={<DataTableCell kind="status" tone="success" label="Active" lines={2} />} />
      <KindRow label='kind="badge"' oneLine={<DataTableCell kind="badge" tone="primary" label="Pro" />} twoLines={<DataTableCell kind="badge" tone="primary" label="Pro" lines={2} />} />
      <KindRow
        label="badge + badges"
        oneLine={<DataTableCell kind="badge" badges={LICENSE_BADGES} />}
        twoLines={<DataTableCell kind="badge" lines={2} badges={LICENSE_BADGES} />}
      />
      <KindRow
        label='kind="usage"'
        oneLine={<DataTableCell kind="usage" value={7.2} total={10} label="7.2 GB of 10 GB" header="Storage" />}
        twoLines={<DataTableCell kind="usage" value={7.2} total={10} label="7.2 GB of 10 GB" header="Storage" lines={2} />}
      />
      <KindRow
        label='kind="sparkline"'
        oneLine={<DataTableCell kind="sparkline" data={DOWNLOADS} label="1.2k" tone="success" area ariaLabel="Downloads trending up over the last 14 days" />}
        twoLines={<DataTableCell kind="sparkline" data={DOWNLOADS} label="1.2k" tone="success" area ariaLabel="Downloads trending up over the last 14 days" lines={2} />}
      />
      <KindRow label='kind="input"' oneLine={<InputCell label="Title for Golden hour" initial="Golden hour at the lake" />} twoLines={<InputCell label="Title for Blue hour" initial="Blue hour, Selene and Rhea" lines={2} />} />
      <KindRow label='kind="select"' oneLine={<SelectCell label="License for Golden hour" initial="Web" />} twoLines={<SelectCell label="License for Blue hour" initial="Personal" lines={2} />} />
      <KindRow label='kind="number"' oneLine={<NumberCell label="Photos in Golden hour" initial={248} />} twoLines={<NumberCell label="Photos in Blue hour" initial={186} lines={2} />} />
      <KindRow label='kind="combobox"' oneLine={<ComboboxCell label="Studio for Golden hour" initial="Helios Studio" />} twoLines={<ComboboxCell label="Studio for Blue hour" initial="Selene Weddings" lines={2} />} />
      <KindRow label='kind="autocomplete"' oneLine={<AutocompleteCell label="Photographer for Golden hour" initial="thea@aether.photo" />} twoLines={<AutocompleteCell label="Photographer for Blue hour" initial="" lines={2} />} />
      <KindRow label='kind="tags"' oneLine={<TagsCell label="Tags for Golden hour" initial={['raw', 'web']} />} twoLines={<TagsCell label="Tags for Blue hour" initial={['wedding']} lines={2} />} />
      <KindRow
        label='kind="date-range"'
        oneLine={<DateRangeCell label="Proofing period for Golden hour" initial={{ from: new Date(2026, 8, 1), to: new Date(2026, 8, 30) }} />}
        twoLines={<DateRangeCell label="Proofing period for Blue hour" initial={undefined} lines={2} />}
      />
      <KindRow label='kind="switch"' oneLine={<SwitchCell label="Downloads for Golden hour" initial />} twoLines={<SwitchCell label="Downloads for Blue hour" lines={2} />} />
      <KindRow label='kind="slider"' oneLine={<SliderCell label="Watermark opacity for Golden hour" initial={40} />} twoLines={<SliderCell label="Watermark opacity for Blue hour" initial={70} lines={2} />} />
      <KindRow label='kind="selector"' oneLine={<SelectorCell label="Select Golden hour" />} twoLines={<SelectorCell label="Select Blue hour" lines={2} />} />
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


/**
 * `badges` sorts worst severity first and never wraps. As the column
 * narrows past what all four badges need, they collapse from the tail
 * into one trailing badge styled with the worst severity it stands
 * in for — "2 more", then "3 more" — skipping straight from 0 to 2.
 */
export const MultipleBadges: Story = {
  // Demonstrates fixed cell widths (up to 480px) on purpose — not a mobile layout.
  parameters: { mobile: { skipOverflow: true } },
  args: { value: '' },
  render: () => (
    // The widths are the point of the demo, so on a phone the wide rows scroll
    // instead of pushing the page sideways.
    <div tabIndex={0} role="region" aria-label="Cell widths" className="flex max-w-full flex-col gap-4 overflow-x-auto rounded-[var(--size-border-radius-border-radius-md)] outline-none focus-visible:focus-ring">
      {[420, 260, 220, 170, 90].map((width) => (
        <div key={width} className="flex items-center gap-3">
          <span className="w-16 shrink-0 font-mono text-body-s text-[var(--color-text-text-subtler)]">{width}px</span>
          <div className="shrink-0 rounded-[var(--size-border-radius-border-radius-md)] border border-dashed border-[var(--color-border-border)] p-2" style={{ width }}>
            <DataTableCell kind="badge" badges={LICENSE_BADGES} />
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
          <InputCell label="Title for Golden hour" initial="Golden hour at the lake" />
        </Row>
        <Row label="mono">
          <InputCell label="Client portal for Golden hour" initial="helios.aether.photo" mono />
        </Row>
        <Row label="invalid">
          <InputCell label="Client portal for Blue hour" initial="selene weddings" invalid errorMessage="A portal address cannot contain spaces" />
        </Row>
        <Row label="disabled">
          <InputCell label="Client portal for First light" initial="eos-portraits.aether.photo" mono disabled />
        </Row>
        <Row label='kind="select"'>
          <SelectCell label="License for Golden hour" initial="Web" />
        </Row>
        <Row label="invalid">
          <SelectCell label="License for Blue hour" invalid errorMessage="Choose a license" />
        </Row>
        <Row label="disabled">
          <SelectCell label="License for First light" initial="Print" disabled />
        </Row>
        <Row label='kind="date-range"'>
          <DateRangeCell label="Proofing period for Golden hour" initial={{ from: new Date(2026, 8, 1), to: new Date(2026, 8, 30) }} />
        </Row>
        <Row label="disabled">
          <DateRangeCell label="Proofing period for First light" initial={{ from: new Date(2026, 8, 1), to: new Date(2026, 8, 30) }} disabled />
        </Row>
      </TableBody>
    </Table>
  ),
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(document.body);

    // input: controlled value round-trips.
    const name = canvas.getByRole('textbox', { name: 'Title for Golden hour' });
    await userEvent.clear(name);
    await userEvent.type(name, 'Lakeside');
    await expect(name).toHaveValue('Lakeside');

    // invalid: flagged and described by its message.
    const bad = canvas.getByRole('textbox', { name: 'Client portal for Blue hour' });
    await expect(bad).toHaveAttribute('aria-invalid', 'true');
    await expect(bad).toHaveAccessibleDescription('A portal address cannot contain spaces');
    await expect(canvas.getByRole('textbox', { name: 'Client portal for First light' })).toBeDisabled();
    // Every editable kind shows its message, not just input/textarea (WCAG 3.3.1).
    const badLicense = canvas.getByRole('combobox', { name: 'License for Blue hour' });
    await expect(badLicense).toHaveAttribute('aria-invalid', 'true');
    await expect(badLicense).toHaveAccessibleDescription('Choose a license');
    await expect(canvas.getByText('Choose a license')).toBeVisible();

    // select: keyboard open, move, pick.
    const license = canvas.getByRole('combobox', { name: 'License for Golden hour' });
    await expect(license).toHaveTextContent('Web');
    license.focus();
    await userEvent.keyboard('{Enter}');
    await page.findByRole('listbox');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(page.queryByRole('listbox')).toBeNull());
    await expect(license).toHaveTextContent('Print');

    // date-range: the range rides on the description (aria-label replaces the text).
    await expect(canvas.getByRole('button', { name: 'Proofing period for Golden hour' })).toHaveAccessibleDescription('Sep 1, 2026 – Sep 30, 2026');
    await expect(canvas.getByRole('button', { name: 'Proofing period for First light' })).toBeDisabled();
  }),
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
          <SelectCell label="License for Golden hour" initial="Web" readOnly />
        </Row>
      </TableBody>
    </Table>
  ),
  play: testOnly(async ({ canvasElement }) => {
    const license = within(canvasElement).getByRole('combobox', { name: 'License for Golden hour' });
    await expect(license).toHaveAttribute('aria-readonly', 'true');
    await expect(license).not.toHaveAttribute('tabindex', '-1');
    license.focus();
    await expect(license).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(license);
    await new Promise((r) => setTimeout(r, 150));
    await expect(within(document.body).queryByRole('listbox')).toBeNull();
    await expect(license).toHaveTextContent('Web');
  }),
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
      {/* A row header, so each value is read with its kind (a table needs headers, WCAG 1.3.1). */}
      <th scope="row" className="w-40 px-4 py-[calc((var(--size-density-density-row)_-_1.25rem)_/_2)] text-start align-middle font-body text-body-m font-normal text-[var(--color-text-text-subtler)]">
        {label}
      </th>
      <TableCell>{children}</TableCell>
    </TableRow>
  );
}

function Demo() {
  const [text, setText] = useState('Golden hour');
  const [selectValue, setSelectValue] = useState('active');
  const [switchOn, setSwitchOn] = useState(true);
  const [sliderVal, setSliderVal] = useState(40);

  return (
    <Table className="w-full max-w-[420px]">
      <TableBody>
        <Row label="text">
          <DataTableCell value="Golden hour" />
        </Row>
        <Row label="mono">
          <DataTableCell kind="mono" value="a1b2c3d4" />
        </Row>
        <Row label="primary">
          <DataTableCell kind="primary" leading={<MediaImage width={16} height={16} />} value="Golden hour" secondary="Helios Studio" />
        </Row>
        <Row label="status">
          <DataTableCell kind="status" tone="success" label="Active" />
        </Row>
        <Row label="badge">
          <DataTableCell kind="badge" tone="success" label="Active" />
        </Row>
        <Row label="usage">
          <DataTableCell kind="usage" value={7.2} total={10} label="7.2 GB of 10 GB" />
        </Row>
        <Row label="input">
          <DataTableCell kind="input" value={text} onValueChange={setText} label="Gallery" />
        </Row>
        <Row label="select">
          <DataTableCell
            kind="select"
            value={selectValue}
            onValueChange={setSelectValue}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'paused', label: 'Paused' },
            ]}
            label="Status"
          />
        </Row>
        <Row label="switch">
          <DataTableCell kind="switch" checked={switchOn} onCheckedChange={setSwitchOn} label="Downloads" />
        </Row>
        <Row label="slider">
          <DataTableCell kind="slider" value={sliderVal} onValueChange={setSliderVal} formatValue={(v) => `${v}%`} label="Watermark opacity" />
        </Row>
        <Row label="loading">
          <DataTableCell kind="primary" leading secondary loading />
        </Row>
      </TableBody>
    </Table>
  );
}

/** Every `kind` in one table: text, mono, primary, status, badge and usage, the editable input, select, switch and slider, and the loading placeholder. */
export const AllKinds: Story = {
  name: 'All kinds',
  render: () => <Demo />,
};
