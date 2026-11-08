import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Archive, Building, Check, NavArrowRight, WarningCircle, CheckCircle, Globe, InfoCircle, MediaImageFolder, WarningTriangle, Undo, Xmark } from 'iconoir-react';
import { KebabIconVertical } from './kebab-icon';
import { cn } from '../../lib/utils';
import { ListItem } from './list-item';
import { DotSeparator } from './dot-separator';
import { Badge } from './badge';
import { StatusDot } from './status-dot';
import { Button } from './button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './dropdown-menu';
import { listItemGuidelines } from './list-item.guidelines';
import { resetFocus, tabTo } from '../../test/keyboard';
import { testOnly } from '../../lib/test-only';

/**
 * ListItem — a single row in a vertical list: leading visual, title +
 * description, and trailing content. Presentational; pass `href` for a link
 * row or `interactive` for a selectable button row.
 */
const meta: Meta<typeof ListItem> = {
  title: 'Data/ListItem',
  component: ListItem,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "One row of a list lighter than a table: settings sections, notifications, a resource picker. The whole row can be a link or a selectable item.",
      },
    },
    layout: 'padded', guidelines: listItemGuidelines,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'], description: 'Row size.' },
    title: { control: 'text', description: 'Primary label.' },
    description: { control: 'text', description: 'Secondary line under the title.' },
    leading: { control: false, description: 'Leading visual: an icon, Avatar, or a tone-colored status glyph.' },
    trailing: { control: false, description: 'Trailing content — meta text, a Badge, a kebab menu. Stays outside the link/button region.' },
    href: { control: false, description: "Renders the row's text region as a link." },
    interactive: { control: 'boolean', description: 'Renders the text region as a selectable, whole-row-clickable region.' },
    selected: { control: 'boolean', description: 'Marks the row as selected.' },
    disabled: { control: 'boolean', description: 'Disables interaction on the row.' },
  },
};

export default meta;
type Story = StoryObj<typeof ListItem>;

/** A plain list of records inside a bordered container. */
export const Default: Story = {
  render: () => (
    // overflow-hidden clips every row's own square corners to this container's
    // rounded-lg silhouette — rows stay flush/square against each other, only
    // the true top/bottom edge reads as rounded.
    <ul className="max-w-md divide-y divide-[var(--color-border-border-subtler)] overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]">
      <li>
        <ListItem className="rounded-none" leading={<Globe />} title="selene-weddings.aether.photo" description="Client portal" trailing={<Badge tone="success">Live</Badge>} />
      </li>
      <li>
        <ListItem className="rounded-none" leading={<Archive />} title="Mnemosyne" description={<>Archive<DotSeparator />4,512 photos</>} trailing={<span className="font-mono text-body-m">212 GB</span>} />
      </li>
      <li>
        <ListItem
          className="rounded-none"
          leading={<Building />}
          title="Helios Studio"
          description={<>3 photographers<DotSeparator />12 galleries</>}
          trailing={
            <span className="inline-flex items-center gap-1">
              <StatusDot tone="success" />
              Active
            </span>
          }
        />
      </li>
    </ul>
  ),
};

/** Link rows: the text region is the anchor; the trailing chevron sits outside it. */
export const LinkRows: Story = {
  name: 'Link rows',
  render: () => (
    <ul className="max-w-md divide-y divide-[var(--color-border-border-subtler)] overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]">
      {['helios.aether.photo', 'selene-weddings.aether.photo', 'eos-portraits.aether.photo'].map((d) => (
        <li key={d}>
          <ListItem className="rounded-none" leading={<Globe />} title={d} description="Updated 2 days ago" href={`#${d}`} trailing={<NavArrowRight className="size-4" />} />
        </li>
      ))}
    </ul>
  ),
  play: testOnly(async ({ canvasElement }) => {
    const links = within(canvasElement).getAllByRole('link');
    await expect(links[0]).toHaveAttribute('href', '#helios.aether.photo');
    // Keyboard: each row is one tab stop, in order.
    resetFocus();
    await tabTo(links[0]);
    await userEvent.tab();
    await expect(links[1]).toHaveFocus();
  }),
};

/** Selectable button rows (no href); the middle row is selected. */
export const Selectable: Story = {
  render: function SelectableExample() {
    const items = ['Overview', 'Galleries', 'Archive'];
    const [active, setActive] = useState('Galleries');
    return (
      <ul className="max-w-xs rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] p-1">
        {items.map((label) => (
          <li key={label}>
            <ListItem interactive selected={active === label} title={label} onClick={() => setActive(label)} />
          </li>
        ))}
      </ul>
    );
  },
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Every row in a selectable list reads as a toggle, not just the selected one.
    await expect(canvas.getByRole('button', { name: 'Galleries' })).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-pressed', 'false');
    // Keyboard: Tab to a row, Enter selects it.
    resetFocus();
    await tabTo(canvas.getByRole('button', { name: 'Archive' }));
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('button', { name: 'Archive' })).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByRole('button', { name: 'Galleries' })).toHaveAttribute('aria-pressed', 'false');
  }),
};

/** The three sizes; `md` keeps a 44px touch target. */
export const Sizes: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <ListItem key={size} size={size} leading={<Building />} title={`Size ${size}`} description="Helios Studio" trailing={<Badge>{size}</Badge>} className="rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]" />
      ))}
    </div>
  ),
};

/* -------------------------------------------------------------------------- */
/* Notification row: leading tone icon, unread dot, kebab, action button.     */
/* -------------------------------------------------------------------------- */

type NotificationTone = 'danger' | 'warning' | 'info' | 'success';

const TONE_ICON: Record<NotificationTone, React.ReactNode> = {
  danger: <WarningCircle />,
  warning: <WarningTriangle />,
  info: <InfoCircle />,
  success: <CheckCircle />,
};

const TONE_CIRCLE: Record<NotificationTone, string> = {
  danger: 'bg-[var(--color-bg-danger-bg-danger-subtle)] text-[var(--color-icon-icon-danger)]',
  warning: 'bg-[var(--color-bg-warning-bg-warning-subtle)] text-[var(--color-icon-icon-warning)]',
  info: 'bg-[var(--color-bg-info-bg-info-subtle)] text-[var(--color-icon-icon-info)]',
  success: 'bg-[var(--color-bg-success-bg-success-subtle)] text-[var(--color-icon-icon-success)]',
};

/** A tone-colored icon glyph for `leading` — the severity cue, distinct from the (unrelated) unread dot next to the title. */
function ToneIcon({ tone }: { tone: NotificationTone }) {
  return (
    <span aria-hidden="true" className={cn('grid size-8 shrink-0 place-content-center rounded-full [&_svg]:size-4', TONE_CIRCLE[tone])}>
      {TONE_ICON[tone]}
    </span>
  );
}

/** The trailing kebab: mark read/unread + dismiss. Every handler stops propagation so pressing a menu action never also fires the row's own `onClick`. */
function NotificationActions({ label, read, onToggleRead, onDismiss }: { label: string; read: boolean; onToggleRead: () => void; onDismiss: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button appearance="ghost" iconOnly size="md" aria-label={`Actions for ${label}`} onClick={(e) => e.stopPropagation()} leftIcon={<KebabIconVertical />} className="[&_svg]:text-[var(--color-icon-icon)]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {read ? (
          <DropdownMenuItem onClick={onToggleRead}>
            <Undo />
            Mark as unread
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={onToggleRead}>
            <Check />
            Mark as read
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem tone="danger" onClick={onDismiss}>
          <Xmark />
          Dismiss
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * A notification composed from ListItem + a tone icon + StatusDot + a kebab —
 * no dedicated Notification component needed. The first group is
 * `interactive` (the row opens something and highlights on hover); the
 * second is static (no `interactive`/`href` — no hover change at all). Both
 * groups can still carry an action button under the description (passed as
 * `children`) and the kebab menu — every nested control stops propagation so
 * it never also fires the row's own click.
 */
export const Notification: Story = {
  render: function NotificationExample() {
    const [read, setRead] = useState<Record<string, boolean>>({ sync: false, license: false, export: true });

    const toggleRead = (id: string) => setRead((prev) => ({ ...prev, [id]: !prev[id] }));

    const Row = ({
      id,
      tone,
      title,
      description,
      action,
      interactive,
    }: {
      id: string;
      tone: NotificationTone;
      title: string;
      description: string;
      action?: string;
      interactive?: boolean;
    }) => {
      const unread = !read[id];
      return (
        <li>
          <ListItem
            // ListItem itself switches leading/content alignment to
            // items-start whenever `children` is passed (see list-item.tsx),
            // so the ToneIcon stays pinned to the title/description text
            // regardless of the action button rendered below it here.
            className="rounded-none"
            interactive={interactive}
            leading={<ToneIcon tone={tone} />}
            title={
              <span className="flex flex-wrap items-center gap-2">
                {title}
                {unread && (
                  <>
                    <StatusDot tone="primary" />
                    <span className="sr-only">Unread</span>
                  </>
                )}
              </span>
            }
            description={description}
            onClick={interactive ? () => setRead((p) => ({ ...p, [id]: true })) : undefined}
            trailing={<NotificationActions label={title} read={read[id] ?? false} onToggleRead={() => toggleRead(id)} onDismiss={() => {}} />}
          >
            {action && (
              // mt-2 (was mt-1): nudged 4px further down from the description
              // per Мария's review, so it doesn't crowd the line above it.
              <Button appearance="tonal" tone="secondary" size="md" className="mt-2 self-start" onClick={(e) => e.stopPropagation()}>
                {action}
              </Button>
            )}
          </ListItem>
        </li>
      );
    };

    return (
      <div className="flex max-w-md flex-col gap-6">
        <div>
          <p className="mb-2 font-body text-body-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]">Interactive — row opens on click</p>
          <ul className="divide-y divide-[var(--color-border-border-subtler)] overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]">
            <Row id="sync" tone="danger" title="Archive sync failed" description="The nightly sync of Golden hour to Mnemosyne did not complete." action="Retry sync" interactive />
            <Row id="export" tone="success" title="Export ready" description="Moonrise over Othrys: 248 photos are ready for Selin Arda to deliver." interactive />
          </ul>
        </div>
        <div>
          <p className="mb-2 font-body text-body-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]">Static — no row-level click</p>
          <ul className="divide-y divide-[var(--color-border-border-subtler)] overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]">
            <Row id="license" tone="warning" title="License expires soon" description="The print license for GOLDEN_0907.tif expires in 7 days." action="Renew license" />
          </ul>
        </div>
      </div>
    );
  },
};

/** A whole-row interactive item with a trailing action that must stop propagation, or clicking it would also fire the row's own click. */
export const InteractiveWithAction: Story = {
  name: 'Interactive with action',
  render: () => (
    <div className="w-full max-w-[360px]">
      <ListItem
        interactive
        leading={<MediaImageFolder />}
        title="Golden hour"
        description={<>Selene Weddings<DotSeparator />248 photos</>}
        trailing={<Button appearance="ghost" iconOnly size="md" aria-label="More actions" onClick={(e) => e.stopPropagation()} leftIcon={<KebabIconVertical />} className="[&_svg]:text-[var(--color-icon-icon)]" />}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // An action row (no `selected`) is a plain button, described by its second line.
    const row = canvas.getByRole('button', { name: 'Golden hour' });
    await expect(row).not.toHaveAttribute('aria-pressed');
    await expect(row).toHaveAccessibleDescription(/Selene Weddings/);
    // The trailing action is its own control.
    await expect(canvas.getByRole('button', { name: 'More actions' })).toBeInTheDocument();
  },
};
