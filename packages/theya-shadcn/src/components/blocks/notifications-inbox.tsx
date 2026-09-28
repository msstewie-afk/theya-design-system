import { useState } from 'react';
import type { ReactNode } from 'react';
import { Bell, Search, DoubleCheck, Check, Xmark, Settings } from 'iconoir-react';
import { KebabIconHorizontal } from '../ui/kebab-icon';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ListItem } from '@/components/ui/list-item';
import { StatusDot } from '@/components/ui/status-dot';
import { ToneIcon } from '@/components/ui/tone-icon';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Filter, type FilterOption } from '@/components/ui/filter';
import { EmptyState } from '@/components/ui/empty-state';
import { undoToast } from '@/components/ui/undo-toast';
import { toast } from '@/components/ui/sonner';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

/**
 * NotificationsInbox - a notifications center / inbox block composed from
 * shipped Theya primitives: `ListItem` rows (a `ToneIcon` in `leading`, an
 * unread `StatusDot` beside the title, the actions kebab in `trailing`, the
 * whole row interactive so it opens on click - see `list-item.tsx`),
 * `ToggleGroup` for All/Unread, `Filter` for Status (tone) and Object (which
 * server, searchable) side by side with it, per-row `DropdownMenu` (mark
 * read/unread, dismiss with `undoToast`), and an optional Settings action.
 * Unread items are visually distinct AND announce "Unread" (never
 * colour-alone). Both facets are configurable: hide Status entirely with
 * `showStatusFilter={false}` when every notification fed in already shares
 * one tone, and relabel/repurpose the second facet with
 * `objectFilterLabel`/`objectOptions`/`defaultObjectFilter` - it still
 * filters on `InboxNotification.object`, whatever you call it.
 *
 * Pure content, like Dialog/AlertDialog/ConfirmDialog - it owns no trigger
 * and no open/close state of its own. The caller assembles the trigger and
 * whatever panel hosts this (a `PushSheet` for a persistent side panel, a
 * `Popover` for a topbar dropdown, or a plain page section) exactly the way
 * a caller assembles `ConfirmDialog`'s own `trigger` prop rather than
 * `ConfirmDialog` reaching for one itself - see the `InPushSheet` story.
 *
 * `bordered` (default `true`) toggles the block's own rounded/bordered card
 * frame around the row list, for standalone page use. Set `false` when the
 * host already provides that frame (e.g. `PushSheetBody`) so rows reach the
 * host's own edges instead of a card inside a card - row and group dividers
 * are unaffected either way. `bordered={false}` also moves the horizontal
 * inset onto the header and filter row themselves (so they stay clear of
 * the panel's edge) while the list gets none. Pair it with a host container
 * that has no horizontal padding of its own (e.g. `<PushSheetBody
 * className="px-0">`).
 *
 * Every prop is optional and defaults to a realistic seeded inbox, so
 * `<NotificationsInbox/>` renders standalone. Pass `notifications` for real
 * data and the `on*` handlers to wire it to your API.
 */

export type NotificationTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

/** A single notification. */
export type InboxNotification = {
  id: string;
  title: string;
  description?: string;
  /** Relative display time, e.g. "2h ago" (kept as a string so it is SSR-stable). */
  time: string;
  /** Section label used to group the list (e.g. "Today", "Earlier"). */
  group?: string;
  tone?: NotificationTone;
  /** Leading icon; defaults to a tone-appropriate glyph via ToneIcon. */
  icon?: ReactNode;
  /** Whether the item has been read. Unread items lead the visual + a11y signal. */
  read?: boolean;
  /** Optional link target: the row becomes a real link and marks read on open. */
  href?: string;
  /** The server/resource this notification concerns, if any - filterable via the Object facet. */
  object?: string;
};

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'danger', label: 'Error' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Success' },
  { value: 'neutral', label: 'Neutral' },
];

const OBJECT_OPTIONS: FilterOption[] = [
  { value: 'web-01', label: 'web-01' },
  { value: 'web-02', label: 'web-02' },
  { value: 'db-prod-01', label: 'db-prod-01' },
  { value: 'db-prod-02', label: 'db-prod-02' },
  { value: 'cache-eu-1', label: 'cache-eu-1' },
  { value: 'worker-03', label: 'worker-03' },
  { value: 'api-gateway', label: 'api-gateway' },
  { value: 'edge-04', label: 'edge-04' },
];

const SEEDED: InboxNotification[] = [
  { id: 'n-1', title: 'Deploy succeeded', description: 'shop.seashell.dev deployed to production in 42s.', time: '8m ago', group: 'Today', tone: 'success', read: false, object: 'web-01' },
  { id: 'n-2', title: 'New sign-in from a new device', description: "Chrome on macOS · 203.0.113.24. If this wasn't you, review your sessions.", time: '1h ago', group: 'Today', tone: 'warning', read: false },
  { id: 'n-3', title: 'Invoice paid', description: 'Your July invoice of $79.00 was paid.', time: '3h ago', group: 'Today', tone: 'info', read: true },
  { id: 'n-4', title: 'Certificate renews soon', description: 'The certificate for api.seashell.dev renews in 7 days.', time: 'Yesterday', group: 'Earlier', tone: 'neutral', read: false, object: 'api-gateway' },
  { id: 'n-5', title: 'Backup failed', description: 'The nightly backup for acme_prod did not complete.', time: '2d ago', group: 'Earlier', tone: 'danger', read: true, object: 'db-prod-01' },
  { id: 'n-6', title: 'Teammate joined', description: 'Priya Nair accepted your invitation.', time: '3d ago', group: 'Earlier', tone: 'neutral', read: true },
];

export type NotificationsInboxProps = {
  /** Section heading (sentence case). */
  title?: string;
  /** Supporting copy under the title. */
  description?: ReactNode;
  /** The notifications, newest first. Defaults to a seeded inbox. */
  notifications?: InboxNotification[];
  /** Fired when "Mark all as read" is pressed. */
  onMarkAllRead?: () => void;
  /** Fired when a single notification is marked read (e.g. opened). */
  onNotificationRead?: (notification: InboxNotification) => void;
  /** Fired when a notification is dismissed (before the undo grace window). */
  onDismiss?: (notification: InboxNotification) => void;
  /** Fired when the settings icon is pressed. Omit to hide the action. */
  onOpenSettings?: () => void;
  /** Adds a close icon button to the header (after Settings and Mark all as read). Omit to hide it. */
  onClose?: () => void;
  /**
   * Own rounded/bordered card frame around the row list. Default `true` for
   * standalone page use. Set `false` when embedding inside a container that
   * already provides the surface/edge (e.g. `PushSheetBody`); also shifts
   * the horizontal inset onto the header/filter row and off the list itself.
   */
  bordered?: boolean;
  /** Whether the Status (tone) facet renders at all. Default `true`. */
  showStatusFilter?: boolean;
  /** Label for the second facet. Default `"Object"`. */
  objectFilterLabel?: string;
  /** Options for the second facet. Default `OBJECT_OPTIONS` (a generic server list). */
  objectOptions?: FilterOption[];
  /** Initial selection for the second facet's filter. Default none (all). */
  defaultObjectFilter?: string[];
};

export function NotificationsInbox({
  title = 'Notifications',
  description,
  notifications: notificationsProp,
  onMarkAllRead,
  onNotificationRead,
  onDismiss,
  onOpenSettings,
  onClose,
  bordered = true,
  showStatusFilter = true,
  objectFilterLabel = 'Object',
  objectOptions = OBJECT_OPTIONS,
  defaultObjectFilter,
}: NotificationsInboxProps) {
  const [items, setItems] = useState<InboxNotification[]>(notificationsProp ?? SEEDED);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [toneFilter, setToneFilter] = useState<string[]>([]);
  const [objectFilter, setObjectFilter] = useState<string[]>(defaultObjectFilter ?? []);

  const unreadCount = items.filter((n) => !n.read).length;
  const visible = items.filter((n) => {
    if (filter === 'unread' && n.read) return false;
    if (toneFilter.length > 0 && !toneFilter.includes(n.tone ?? 'neutral')) return false;
    if (objectFilter.length > 0 && (!n.object || !objectFilter.includes(n.object))) return false;
    return true;
  });

  // Preserve input order; group by section, keeping groups in first-seen order.
  const groups: { label: string; items: InboxNotification[] }[] = [];
  for (const n of visible) {
    const label = n.group ?? 'Earlier';
    let g = groups.find((x) => x.label === label);
    if (!g) {
      g = { label, items: [] };
      groups.push(g);
    }
    g.items.push(n);
  }

  const setRead = (id: string, read: boolean) => setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read } : n)));

  const markAllRead = () => {
    if (unreadCount === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    onMarkAllRead?.();
    toast.success('All notifications marked as read');
  };

  const open = (n: InboxNotification) => {
    if (!n.read) {
      setRead(n.id, true);
      onNotificationRead?.(n);
    }
  };

  const dismiss = (n: InboxNotification) => {
    const index = items.findIndex((x) => x.id === n.id);
    setItems((prev) => prev.filter((x) => x.id !== n.id));
    onDismiss?.(n);
    undoToast({
      title: 'Notification dismissed',
      description: n.title,
      icon: <Xmark width={16} height={16} />,
      onUndo: () =>
        setItems((prev) => {
          const next = [...prev];
          next.splice(Math.min(index, next.length), 0, n);
          return next;
        }),
    });
  };

  return (
    <section data-slot="notifications-inbox" className="flex flex-col gap-4">
      <header className={cn('flex flex-wrap items-start justify-between gap-3', !bordered && 'px-[1.125rem]')}>
        <div className="min-w-0">
          <p className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">{title}</p>
          {description && <p className="mt-1 max-w-2xl font-body text-body-s text-[var(--color-text-text-subtler)]">{description}</p>}
        </div>
        <div className="flex items-center gap-1">
          {onOpenSettings && (
            <Button appearance="ghost" iconOnly size="md" aria-label="Notification settings" onClick={onOpenSettings} leftIcon={<Settings />} />
          )}
          {unreadCount > 0 && (
            <Button appearance="ghost" size="md" onClick={markAllRead} leftIcon={<DoubleCheck />}>
              Mark all read
            </Button>
          )}
          {onClose && <Button appearance="ghost" iconOnly size="md" aria-label="Close" onClick={onClose} leftIcon={<Xmark />} />}
        </div>
      </header>

      {/* Two groups, 16px apart: the Status/Object selects (8px apart from each
          other), and the All/Unread toggle. */}
      <div className={cn('flex flex-wrap items-center gap-4', !bordered && 'px-[1.125rem]')}>
        <div className="flex flex-wrap items-center gap-2">
          {showStatusFilter && <Filter label="Status" options={STATUS_OPTIONS} value={toneFilter} onValueChange={setToneFilter} />}
          <Filter label={objectFilterLabel} searchable options={objectOptions} value={objectFilter} onValueChange={setObjectFilter} />
        </div>
        <ToggleGroup
          type="single"
          appearance="outlined"
          size="md"
          value={filter}
          // type="single" can clear to "" on re-press; keep a filter selected.
          onValueChange={(next) => {
            if (next) setFilter(next as 'all' | 'unread');
          }}
          aria-label="Filter notifications"
        >
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge tone="neutral" className="ml-1.5">
                {unreadCount}
              </Badge>
            )}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className={cn('w-full', bordered && 'overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]')}>
        {visible.length === 0 ? (
          items.length === 0 ? (
            <EmptyState icon={<Bell />} title="You're all caught up" titleAs="h3" description="New notifications about your account will appear here." />
          ) : (
            <EmptyState
              icon={<Search />}
              title="No notifications match these filters"
              titleAs="h3"
              description="Try a different status, object, or switch back to All."
              action={
                <Button
                  appearance="outlined"
                  tone="secondary"
                  onClick={() => {
                    setFilter('all');
                    setToneFilter([]);
                    setObjectFilter([]);
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          )
        ) : (
          groups.map((group, gi) => (
            <div key={group.label}>
              <p
                className={cn(
                  'bg-[var(--color-bg-neutral-bg-neutral-subtle)] px-[1.125rem] py-2 font-body text-body-xs font-medium tracking-wide text-[var(--color-text-text-subtler)] uppercase',
                  gi > 0 && 'border-t border-solid border-[var(--color-border-border-subtle)]',
                )}
              >
                {group.label}
              </p>
              <ul role="list" aria-label={`${group.label} notifications`} className="flex flex-col divide-y divide-[var(--color-border-border-subtle)]">
                {group.items.map((n) => (
                  <NotificationRow key={n.id} notification={n} onOpen={open} onToggleRead={(read) => setRead(n.id, read)} onDismiss={dismiss} />
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* A single notification row - a ListItem: tone icon in leading, unread dot   */
/* beside the title, the actions kebab in trailing.                          */
/* -------------------------------------------------------------------------- */
function NotificationRow({
  notification: n,
  onOpen,
  onToggleRead,
  onDismiss,
}: {
  notification: InboxNotification;
  onOpen: (n: InboxNotification) => void;
  onToggleRead: (read: boolean) => void;
  onDismiss: (n: InboxNotification) => void;
}) {
  const tone = n.tone ?? 'neutral';
  const unread = !n.read;

  return (
    <li>
      <ListItem
        className="rounded-none"
        interactive={n.href == null}
        href={n.href}
        onClick={() => onOpen(n)}
        leading={<ToneIcon tone={tone} icon={n.icon} size="sm" />}
        title={
          <span className="flex flex-wrap items-center gap-2">
            {n.title}
            {unread && (
              <>
                <StatusDot tone="primary" />
                <span className="sr-only">Unread</span>
              </>
            )}
          </span>
        }
        // ListItem's own title/description now default to body-m/body-s
        // (Sep 2026 ListItem sizing pass), which is exactly this row's
        // desired scale, so no font-size override is needed here anymore.
        description={n.description}
        trailing={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                appearance="ghost"
                iconOnly
                size="md"
                aria-label={`Actions for ${n.title}`}
                onClick={(e) => e.stopPropagation()}
                leftIcon={<KebabIconHorizontal />}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {unread ? (
                <DropdownMenuItem onClick={() => onToggleRead(true)}>
                  <Check />
                  Mark as read
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onToggleRead(false)}>Mark as unread</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem tone="danger" onClick={() => onDismiss(n)}>
                <Xmark />
                Dismiss
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      >
        <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">{n.time}</span>
      </ListItem>
    </li>
  );
}
