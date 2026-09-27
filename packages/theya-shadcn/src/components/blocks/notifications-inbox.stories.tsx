import type { Meta, StoryObj } from '@storybook/react';
import { NotificationsInbox, type InboxNotification } from './notifications-inbox';
import { Toaster, toast } from '@/components/ui/sonner';
import type { FilterOption } from '@/components/ui/filter';

/**
 * NotificationsInbox - a notifications center / inbox block composed from
 * shipped primitives (ListItem, ToggleGroup, Filter, Tooltip-free icon
 * buttons, StatusDot, DropdownMenu, EmptyState, undoToast). An All/Unread
 * toggle plus Status (tone) and Object (server, searchable) Filters lead a
 * grouped list of ListItem rows; unread items are visually distinct and
 * announce "Unread" (never color-alone). Per-item menu marks read/unread or
 * dismisses (with undo); header icon actions (Settings, Mark all as read)
 * are icon-only ghost buttons.
 *
 * Pure content - no Bell trigger, no open/close state of its own. See the
 * `Notifications` story on `Overlays/Push sheet` for how a caller assembles
 * the trigger + panel around it.
 */
const meta: Meta<typeof NotificationsInbox> = {
  title: 'Patterns/Notifications inbox',
  component: NotificationsInbox,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    title: { control: 'text', description: 'Section heading (sentence case).', table: { category: 'Content' } },
    description: { control: 'text', description: 'Supporting copy under the title.', table: { category: 'Content' } },
    notifications: { control: false, description: 'The notifications, newest first. Defaults to a seeded inbox.', table: { category: 'Content' } },
    onMarkAllRead: { control: false, description: 'Fired when "Mark all as read" is pressed.', table: { category: 'Events' } },
    onNotificationRead: { control: false, description: 'Fired when a single notification is marked read (e.g. opened).', table: { category: 'Events' } },
    onDismiss: { control: false, description: 'Fired when a notification is dismissed (before the undo grace window).', table: { category: 'Events' } },
    onOpenSettings: { control: false, description: 'Fired when the settings icon is pressed. Omit to hide the action.', table: { category: 'Events' } },
    onClose: { control: false, description: 'Adds a close icon button to the header. Omit to hide it.', table: { category: 'Events' } },
    bordered: {
      control: 'boolean',
      description: 'Own rounded/bordered card frame around the row list. Default true for standalone page use. Set false when embedding inside a container that already provides the surface/edge.',
      table: { category: 'Appearance' },
    },
    showStatusFilter: { control: 'boolean', description: 'Whether the Status (tone) facet renders at all. Default true.', table: { category: 'Appearance' } },
    objectFilterLabel: { control: 'text', description: 'Label for the second facet. Default "Object".', table: { category: 'Content' } },
    objectOptions: { control: false, description: 'Options for the second facet. Default a generic server list.', table: { category: 'Content' } },
    defaultObjectFilter: { control: false, description: "Initial selection for the second facet's filter. Default none (all).", table: { category: 'State' } },
  },
  decorators: [
    (Story) => (
      <>
        <Toaster />
        <div className="mx-auto w-full max-w-[720px] px-4 py-6 md:px-6">
          <Story />
        </div>
      </>
    ),
  ],
  args: {
    onMarkAllRead: () => toast.success('All marked as read'),
    onDismiss: (n) => toast(`Dismissed: ${n.title}`),
  },
};

export default meta;
type Story = StoryObj<typeof NotificationsInbox>;

/** Seeded defaults: six notifications across Today / Earlier, some unread. */
export const Default: Story = {};

/** All read: the "Mark all as read" action is disabled; Unread filter is empty. */
const ALL_READ: InboxNotification[] = [
  { id: 'r1', title: 'Invoice paid', description: 'July invoice of $79.00 was paid.', time: '3h ago', group: 'Today', tone: 'info', read: true },
  { id: 'r2', title: 'Teammate joined', description: 'Priya Nair accepted your invitation.', time: '2d ago', group: 'Earlier', tone: 'neutral', read: true },
];

export const AllRead: Story = {
  args: { notifications: ALL_READ },
};

/** Empty: the "all caught up" state. */
export const Empty: Story = {
  args: { notifications: [] },
};

/**
 * Security-alerts-only panel: every notification shares one tone, so the
 * Status facet is hidden entirely, and the second facet is relabeled
 * "Event type" with a page-appropriate, non-overlapping option set instead
 * of the generic server list.
 */
const EVENT_TYPE_OPTIONS: FilterOption[] = [
  { value: 'brute-force', label: 'Brute-force attempt' },
  { value: 'malware', label: 'Malware detected' },
  { value: 'firewall', label: 'Firewall rule triggered' },
  { value: 'cert-expiry', label: 'Certificate expiring' },
];

const SECURITY_ALERTS: InboxNotification[] = [
  { id: 's1', title: 'Brute-force attempt blocked', description: '14 failed logins from 198.51.100.7 in 2 minutes.', time: '5m ago', group: 'Today', tone: 'destructive', read: false, object: 'brute-force' },
  { id: 's2', title: 'Malware signature detected', description: 'eicar-test-file quarantined on web-01.', time: '1h ago', group: 'Today', tone: 'destructive', read: false, object: 'malware' },
  { id: 's3', title: 'Firewall rule triggered', description: 'Blocked inbound traffic on port 4444 from 203.0.113.9.', time: 'Yesterday', group: 'Earlier', tone: 'destructive', read: true, object: 'firewall' },
];

export const StatusHiddenCustomObjectFacet: Story = {
  name: 'Status hidden, custom object facet',
  args: {
    title: 'Security alerts',
    notifications: SECURITY_ALERTS,
    showStatusFilter: false,
    objectFilterLabel: 'Event type',
    objectOptions: EVENT_TYPE_OPTIONS,
    defaultObjectFilter: ['brute-force'],
  },
};
