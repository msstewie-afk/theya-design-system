import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from './table';
import { DataTableCell } from './data-table-cell';
import type { BadgeTone } from './badge';
import { tableGuidelines } from './table.guidelines';

/**
 * Table — semantic HTML table primitives (Table, TableHeader, TableBody,
 * TableRow, TableHead, TableCell, TableCaption) wrapped in a bordered,
 * horizontally scrollable container. The header sits on
 * bg-neutral-bg-neutral-subtle with a hairline; rows hover to
 * bg-neutral-bg-neutral-subtle. Compose the parts yourself — for
 * sorting, pagination, selection or a loading state, reach for
 * DataTable instead.
 *
 * Conventions: add `text-right tabular-nums` to numeric head + cell,
 * `font-mono` for identifiers, and never signal status by color alone
 * (a text label, not a bare colored dot).
 */
const meta: Meta<typeof Table> = {
  title: 'Data/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: { layout: 'padded', guidelines: tableGuidelines },
  argTypes: {
    containerLabel: {
      control: 'text',
      description:
        'Optional accessible name for the scroll container. When set, the container becomes a role="region" landmark with this label, and is always keyboard-focusable so a table wider than the viewport can be scrolled without a mouse (WCAG 2.1.1).',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[680px] max-w-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Table>;

type SiteStatus = 'running' | 'suspended' | 'error';
interface Site {
  domain: string;
  status: SiteStatus;
  plan: string;
  requests: number;
}

const SITES: Site[] = [
  { domain: 'shop.seashell.dev', status: 'running', plan: 'Pro', requests: 184_320 },
  { domain: 'blog.seashell.dev', status: 'running', plan: 'Starter', requests: 42_180 },
  { domain: 'api.seashell.dev', status: 'error', plan: 'Scale', requests: 902_540 },
  { domain: 'staging.seashell.dev', status: 'suspended', plan: 'Pro', requests: 3_210 },
  { domain: 'docs.seashell.dev', status: 'running', plan: 'Starter', requests: 28_990 },
];

const STATUS_LABEL: Record<SiteStatus, string> = {
  running: 'Running',
  suspended: 'Suspended',
  error: 'Error',
};

const STATUS_TONE: Record<SiteStatus, BadgeTone> = {
  running: 'success',
  suspended: 'warning',
  error: 'danger',
};

/**
 * A basic table: `scope="col"` header cells so assistive tech associates
 * each column with its data, identifiers in `font-mono`, and a numeric
 * column right-aligned with `tabular-nums`. Status is a real Badge (via
 * DataTableCell's `kind="badge"`, Badge's own default `sm` size) rather
 * than plain text, reusing the same component DataTable itself renders
 * status/badge cells with.
 *
 * On a phone (narrow the viewport) the rows stack: the first column is
 * each item's title, the others label/value pairs labelled from the
 * column headers — nothing scrolls sideways.
 */
export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Domain</TableHead>
          <TableHead scope="col">Status</TableHead>
          <TableHead scope="col">Plan</TableHead>
          <TableHead scope="col" className="text-right tabular-nums">
            Requests / day
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SITES.map((site) => (
          <TableRow key={site.domain}>
            <TableCell className="font-mono">{site.domain}</TableCell>
            {/* p-0: DataTableCell supplies its own px-4 padding (and a fixed
            height off --dt-row-h/--dt-cell-h), same reason DataTable's own
            body cells zero TableCell's padding in bodyCellAttrs() — left in,
            the two paddings stack into a doubled 32px inset. */}
            <TableCell className="p-0">
              <DataTableCell kind="badge" tone={STATUS_TONE[site.status]} label={STATUS_LABEL[site.status]} />
            </TableCell>
            <TableCell>{site.plan}</TableCell>
            <TableCell className="text-right tabular-nums">{site.requests.toLocaleString('en-US')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** TableCaption describes the table for screen readers and sighted users. Renders below the table by default. */
export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>Sites in the eu-west-1 region, refreshed every 60s.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Domain</TableHead>
          <TableHead scope="col">Plan</TableHead>
          <TableHead scope="col" className="text-right tabular-nums">
            Requests / day
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SITES.map((site) => (
          <TableRow key={site.domain}>
            <TableCell className="font-mono">{site.domain}</TableCell>
            <TableCell>{site.plan}</TableCell>
            <TableCell className="text-right tabular-nums">{site.requests.toLocaleString('en-US')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/**
 * Mark a row selected with `data-state="selected"` — it tints to
 * bg-primary-subtle (bg-primary-subtler on hover), same as DataTable. Always mirror selection in an
 * accessible control (e.g. a checkbox), not color alone; here the
 * selected row also carries `aria-selected`.
 */
export const SelectedRow: Story = {
  name: 'Selected row',
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Domain</TableHead>
          <TableHead scope="col">Plan</TableHead>
          <TableHead scope="col" className="text-right tabular-nums">
            Requests / day
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SITES.map((site, i) => (
          <TableRow key={site.domain} data-state={i === 0 ? 'selected' : undefined} aria-selected={i === 0}>
            <TableCell className="font-mono">{site.domain}</TableCell>
            <TableCell>{site.plan}</TableCell>
            <TableCell className="text-right tabular-nums">{site.requests.toLocaleString('en-US')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** The zero-data case: a single full-width cell (`colSpan`) that explains the empty result. For a richer onboarding state, reach for an EmptyState component instead. */
export const Empty: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Domain</TableHead>
          <TableHead scope="col">Status</TableHead>
          <TableHead scope="col" className="text-right tabular-nums">
            Requests / day
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={3} className="py-10 text-center text-[var(--color-text-text-subtler)]">
            No sites yet. Create your first site to get started.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

/** Wide tables scroll inside the built-in overflow-x-auto container — never the page — so this stays usable at 320px. The wrapper here is intentionally narrow to demonstrate the inner scroll. */
export const HorizontalScroll: Story = {
  name: 'Horizontal scroll',
  decorators: [
    (Story) => (
      <div className="w-[320px] max-w-full">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Table mobileLayout="scroll">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Domain</TableHead>
          <TableHead scope="col">Region</TableHead>
          <TableHead scope="col">Version</TableHead>
          <TableHead scope="col">Status</TableHead>
          <TableHead scope="col" className="text-right tabular-nums">
            Requests / day
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SITES.map((site) => (
          <TableRow key={site.domain}>
            <TableCell className="font-mono">{site.domain}</TableCell>
            <TableCell className="font-mono">eu-west-1</TableCell>
            <TableCell className="font-mono">v2.4.0</TableCell>
            <TableCell>{STATUS_LABEL[site.status]}</TableCell>
            <TableCell className="text-right tabular-nums">{site.requests.toLocaleString('en-US')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/**
 * The scroll container is keyboard-reachable (WCAG 2.1.1 / axe
 * scrollable-region-focusable): Tab lands on the container and arrow
 * keys scroll it.
 *
 * To check by hand: click into the page, press Tab until this table's
 * container gets a visible focus ring, then confirm the arrow keys
 * scroll it.
 */
export const KeyboardScroll: Story = {
  name: 'Keyboard scroll',
  decorators: [
    (Story) => (
      <div className="w-[320px] max-w-full">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Table containerLabel="Sites table" mobileLayout="scroll">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Domain</TableHead>
          <TableHead scope="col">Region</TableHead>
          <TableHead scope="col">Version</TableHead>
          <TableHead scope="col">Status</TableHead>
          <TableHead scope="col" className="text-right tabular-nums">
            Requests / day
          </TableHead>
          <TableHead scope="col">Owner</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SITES.map((site) => (
          <TableRow key={site.domain}>
            <TableCell className="font-mono">{site.domain}</TableCell>
            <TableCell className="font-mono">eu-west-1</TableCell>
            <TableCell className="font-mono">v2.4.0</TableCell>
            <TableCell>{STATUS_LABEL[site.status]}</TableCell>
            <TableCell className="text-right tabular-nums">{site.requests.toLocaleString('en-US')}</TableCell>
            <TableCell className="font-mono">ada@seashell.dev</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** Header labels truncate when a fixed table layout gives the column a bounded width. Keep the complete label in `title` so pointer users can reveal it. */
export const TruncatedHeader: Story = {
  name: 'Truncated header',
  render: () => (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead scope="col" className="w-40" title="Primary production domain and deployment destination">
            Primary production domain and deployment destination
          </TableHead>
          <TableHead scope="col">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="truncate font-mono">shop.seashell.dev</TableCell>
          <TableCell>Running</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

const PLANS = ['Starter', 'Pro', 'Scale', 'Enterprise'] as const;
const PLAN_ROWS: { feature: string; values: [string, string, string, string] }[] = [
  { feature: 'Sites', values: ['1', '5', '25', 'Unlimited'] },
  { feature: 'Storage', values: ['10 GB', '50 GB', '250 GB', '1 TB'] },
  { feature: 'Backups', values: ['Weekly', 'Daily', 'Hourly', 'Hourly'] },
  { feature: 'Staging', values: ['—', '1', '5', 'Unlimited'] },
  { feature: 'Support', values: ['Email', 'Email', 'Chat', 'Phone'] },
];

/**
 * `mobileLayout="paged"` for a comparison, where a row reads across the
 * columns and stacking would split it apart. On a phone the first column
 * stays and the plans show `columnsPerPage` (2) at a time; the dots and a
 * swipe page through them. Each dot is named by the columns it shows.
 */
export const PagedColumns: Story = {
  name: 'Paged columns (comparison)',
  render: () => (
    <Table mobileLayout="paged" containerLabel="Plan comparison">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Feature</TableHead>
          {PLANS.map((plan) => (
            <TableHead key={plan} scope="col">
              {plan}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {PLAN_ROWS.map((row) => (
          <TableRow key={row.feature}>
            <TableCell className="font-medium">{row.feature}</TableCell>
            {row.values.map((value, i) => (
              <TableCell key={PLANS[i]} className="tabular-nums">
                {value}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The dots exist on a phone only; on a wide screen every column shows.
    if (window.innerWidth >= 640) {
      await expect(canvas.queryByRole('group', { name: 'Table columns' })).toBeNull();
      return;
    }
    // Off-page columns are display:none, so out of the accessibility tree too.
    const scale = canvas.getByText('Scale', { selector: 'th' });
    await expect(scale).not.toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Show columns 4–5 of 5' }));
    await expect(scale).toBeVisible();
    await expect(canvas.getByText('Starter', { selector: 'th' })).not.toBeVisible();
  },
};

/**
 * `stickyFirstColumn` keeps the first column in place while the rest
 * scrolls sideways — with `mobileLayout="scroll"`, or on any screen too
 * narrow for a wide table. The frozen column follows the row's hover and
 * selected fill.
 */
export const StickyFirstColumn: Story = {
  name: 'Sticky first column',
  decorators: [
    (Story) => (
      <div className="w-[320px] max-w-full">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Table mobileLayout="scroll" stickyFirstColumn containerLabel="Sites table, first column frozen" className="whitespace-nowrap">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Domain</TableHead>
          <TableHead scope="col">Region</TableHead>
          <TableHead scope="col">Version</TableHead>
          <TableHead scope="col">Status</TableHead>
          <TableHead scope="col" className="text-right tabular-nums">
            Requests / day
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SITES.map((site, i) => (
          <TableRow key={site.domain} data-state={i === 1 ? 'selected' : undefined}>
            <TableCell className="font-mono whitespace-nowrap">{site.domain}</TableCell>
            <TableCell className="font-mono">eu-west-1</TableCell>
            <TableCell className="font-mono">v2.4.0</TableCell>
            <TableCell>{STATUS_LABEL[site.status]}</TableCell>
            <TableCell className="text-right tabular-nums">{site.requests.toLocaleString('en-US')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
