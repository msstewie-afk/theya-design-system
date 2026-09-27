import type { Meta, StoryObj } from '@storybook/react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from './table';
import { DataTableCell } from './data-table-cell';
import type { BadgeTone } from './badge';

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
  title: 'Data Display/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    containerLabel: {
      control: 'text',
      description:
        'Optional accessible name for the scroll container. When set, the container becomes a role="region" landmark with this label, and is always keyboard-focusable so a table wider than the viewport can be scrolled without a mouse (WCAG 2.1.1).',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[680px] max-w-full">
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

const STATUS_BADGE: Record<SiteStatus, BadgeTone> = {
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
            height off --wp-row-h/--wp-cell-h), same reason DataTable's own
            body cells zero TableCell's padding in bodyCellAttrs() — left in,
            the two paddings stack into a doubled 32px inset. */}
            <TableCell className="p-0">
              <DataTableCell kind="badge" tone={STATUS_BADGE[site.status]} label={STATUS_LABEL[site.status]} />
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
    <Table>
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
 * keys scroll it — this is the fix ported in from the corp reference;
 * Theya's Table previously had no tab stop on this container at all.
 *
 * No play function here (unlike the corp reference) — that needed
 * `storybook/test`, which broke the dynamic import in this Storybook
 * setup (package not present/named differently here). To check by hand
 * instead: click into the page, press Tab until this table's container
 * gets a visible focus ring, then confirm the arrow keys scroll it.
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
    <Table containerLabel="Sites table">
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
