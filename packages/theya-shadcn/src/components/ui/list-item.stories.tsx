import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Check, NavArrowRight, Database, WarningCircle, CheckCircle, Globe, InfoCircle, Server, WarningTriangle, Undo, Xmark } from 'iconoir-react';
import { KebabIconVertical } from './kebab-icon';
import { cn } from '@/lib/utils';
import { ListItem } from './list-item';
import { DotSeparator } from './dot-separator';
import { Badge } from './badge';
import { StatusDot } from './status-dot';
import { Button } from './button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './dropdown-menu';

/**
 * ListItem — a single row in a vertical list: leading visual, title +
 * description, and trailing content. Presentational; pass `href` for a link
 * row or `interactive` for a selectable button row.
 */
const meta: Meta<typeof ListItem> = {
  title: 'Data Display/ListItem',
  component: ListItem,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
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
    <ul className="max-w-md divide-y divide-[var(--color-border-border-subtle)] overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]">
      <li>
        <ListItem className="rounded-none" leading={<Globe />} title="shop.seashell.dev" description="Primary domain" trailing={<Badge tone="success">Live</Badge>} />
      </li>
      <li>
        <ListItem className="rounded-none" leading={<Database />} title="acme_production" description={<>MySQL 8.0<DotSeparator />eu-west-1</>} trailing={<span className="font-mono text-body-m">2.4 GB</span>} />
      </li>
      <li>
        <ListItem
          className="rounded-none"
          leading={<Server />}
          title="web-01"
          description={<>4 vCPU<DotSeparator />8 GB</>}
          trailing={
            <span className="inline-flex items-center gap-1.5">
              <StatusDot tone="success" />
              Healthy
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
    <ul className="max-w-md divide-y divide-[var(--color-border-border-subtle)] overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]">
      {['shop.seashell.dev', 'blog.seashell.dev', 'docs.seashell.dev'].map((d) => (
        <li key={d}>
          <ListItem className="rounded-none" leading={<Globe />} title={d} description="Updated 2 days ago" href={`#${d}`} trailing={<NavArrowRight className="size-4" />} />
        </li>
      ))}
    </ul>
  ),
};

/** Selectable button rows (no href); the middle row is selected. */
export const Selectable: Story = {
  render: function SelectableExample() {
    const items = ['Overview', 'Databases', 'Backups'];
    const [active, setActive] = useState('Databases');
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
};

/** The three sizes; `default` keeps a 44px touch target. */
export const Sizes: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <ListItem key={size} size={size} leading={<Server />} title={`Size ${size}`} description="web-01" trailing={<Badge>{size}</Badge>} className="rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]" />
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
        <Button appearance="ghost" iconOnly size="md" aria-label={`Actions for ${label}`} onClick={(e) => e.stopPropagation()} leftIcon={<KebabIconVertical />} className="[&_svg]:text-[var(--color-text-text)]" />
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
    const [read, setRead] = useState<Record<string, boolean>>({ backup: false, cert: false, deploy: true });

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
          <ul className="divide-y divide-[var(--color-border-border-subtle)] overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]">
            <Row id="backup" tone="danger" title="Backup failed" description="The nightly backup for acme_prod did not complete." action="Retry backup" interactive />
            <Row id="deploy" tone="success" title="Deploy succeeded" description="shop.seashell.dev deployed to production in 42s." interactive />
          </ul>
        </div>
        <div>
          <p className="mb-2 font-body text-body-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]">Static — no row-level click</p>
          <ul className="divide-y divide-[var(--color-border-border-subtle)] overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]">
            <Row id="cert" tone="warning" title="Certificate renews soon" description="The certificate for api.seashell.dev renews in 7 days." action="Renew now" />
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
    <div className="w-[360px]">
      <ListItem
        interactive
        leading={<Server />}
        title="shop.seashell.dev"
        description={<>Production<DotSeparator />eu-west-1</>}
        trailing={<Button appearance="ghost" iconOnly size="md" aria-label="More actions" onClick={(e) => e.stopPropagation()} leftIcon={<KebabIconVertical />} className="[&_svg]:text-[var(--color-text-text)]" />}
      />
    </div>
  ),
};
