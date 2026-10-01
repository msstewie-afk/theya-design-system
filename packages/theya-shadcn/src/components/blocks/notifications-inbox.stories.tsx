import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { NotificationsInbox, type InboxNotification } from './notifications-inbox';
import { toast } from '@/components/ui/sonner';
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
    onNotificationRead: { control: false, description: 'Fired when a single notification is marked read — opened, or "Mark as read" from its menu.', table: { category: 'Events' } },
    onNotificationUnread: { control: false, description: 'Fired when a notification is marked unread from its menu.', table: { category: 'Events' } },
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

const body = () => within(document.body);
async function clearToasts() {
  toast.dismiss();
  await waitFor(() => expect(document.querySelectorAll('[data-sonner-toast]')).toHaveLength(0), { timeout: 3000 });
}
const titles = (canvasElement: HTMLElement) =>
  [...canvasElement.querySelectorAll('[data-notification-id]')].map((li) => li.getAttribute('data-notification-id'));
const rowButton = (canvasElement: HTMLElement, title: string) =>
  within(canvasElement).getByRole('button', { name: new RegExp(`^${title}`) });
const unreadToggle = (canvasElement: HTMLElement) => within(canvasElement).getByRole('radio', { name: /^Unread/ });

async function menuAction(canvasElement: HTMLElement, title: string, item: string) {
  await userEvent.click(within(canvasElement).getByRole('button', { name: `Actions for ${title}` }));
  await userEvent.click(await body().findByRole('menuitem', { name: item }));
  await waitFor(() => expect(body().queryByRole('menu')).toBeNull());
}

/**
 * Seeded defaults: six notifications across Today / Earlier, some unread.
 * Open marks read; the menu marks read/unread and dismisses (with undo);
 * filters combine; every action that removes its own control keeps focus.
 */
export const Default: Story = {
  args: { onNotificationRead: fn(), onNotificationUnread: fn(), onDismiss: fn(), onMarkAllRead: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(titles(canvasElement)).toEqual(['n-1', 'n-2', 'n-3', 'n-4', 'n-5', 'n-6']);
    await expect(unreadToggle(canvasElement)).toHaveAccessibleName('Unread 3');
    await expect(rowButton(canvasElement, 'Deploy succeeded')).toHaveAccessibleName(/Unread/);

    // Opening an unread row marks it read.
    await userEvent.click(rowButton(canvasElement, 'New sign-in from a new device'));
    await expect(args.onNotificationRead).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'n-2' }));
    await expect(rowButton(canvasElement, 'New sign-in from a new device')).not.toHaveAccessibleName(/Unread/);
    await expect(unreadToggle(canvasElement)).toHaveAccessibleName('Unread 2');

    // The menu reports read/unread to the host too.
    await menuAction(canvasElement, 'Invoice paid', 'Mark as unread');
    await expect(args.onNotificationUnread).toHaveBeenCalledWith(expect.objectContaining({ id: 'n-3' }));
    await menuAction(canvasElement, 'Deploy succeeded', 'Mark as read');
    await expect(args.onNotificationRead).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'n-1' }));
    await expect(unreadToggle(canvasElement)).toHaveAccessibleName('Unread 2');

    // Unread view.
    await userEvent.click(unreadToggle(canvasElement));
    await waitFor(() => expect(titles(canvasElement)).toEqual(['n-3', 'n-4']));

    // + Status: Error -> nothing matches; "Clear filters" resets and focuses the first row.
    await userEvent.click(canvas.getByRole('button', { name: 'Status' }));
    const statuses = await body().findByRole('group', { name: 'Status' });
    await userEvent.click(within(statuses).getByRole('checkbox', { name: /Error/ }));
    await userEvent.keyboard('{Escape}');
    await expect(await canvas.findByRole('heading', { name: 'No notifications match these filters' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Clear filters' }));
    await waitFor(() => expect(titles(canvasElement)).toHaveLength(6));
    await waitFor(() => expect(rowButton(canvasElement, 'Deploy succeeded')).toHaveFocus());

    // Dismiss: focus moves to the row that takes its place; undo restores it in place.
    await menuAction(canvasElement, 'Invoice paid', 'Dismiss');
    await waitFor(() => expect(titles(canvasElement)).toEqual(['n-1', 'n-2', 'n-4', 'n-5', 'n-6']));
    await expect(args.onDismiss).toHaveBeenCalledWith(expect.objectContaining({ id: 'n-3' }));
    await waitFor(() => expect(rowButton(canvasElement, 'Certificate renews soon')).toHaveFocus());
    const dismissed = (await body().findByText('Notification dismissed', { selector: '[data-title]' })).closest('[data-sonner-toast]') as HTMLElement;
    await userEvent.click(within(dismissed).getByRole('button', { name: 'Undo' }));
    await waitFor(() => expect(titles(canvasElement)).toEqual(['n-1', 'n-2', 'n-3', 'n-4', 'n-5', 'n-6']));
    await clearToasts();

    // Mark all read: the button hides itself, focus stays in the inbox.
    await userEvent.click(canvas.getByRole('button', { name: 'Mark all read' }));
    await expect(args.onMarkAllRead).toHaveBeenCalledTimes(1);
    await expect(canvas.queryByRole('button', { name: 'Mark all read' })).toBeNull();
    await expect(unreadToggle(canvasElement)).toHaveAccessibleName('Unread');
    await waitFor(() => expect(document.activeElement).toBe(canvasElement.querySelector('[data-slot="notifications-inbox"]')));
    await clearToasts();
  },
};

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: "You're all caught up" })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Mark all read' })).toBeNull();
  },
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
  { id: 's1', title: 'Brute-force attempt blocked', description: '14 failed logins from 198.51.100.7 in 2 minutes.', time: '5m ago', group: 'Today', tone: 'danger', read: false, object: 'brute-force' },
  { id: 's2', title: 'Malware signature detected', description: 'eicar-test-file quarantined on web-01.', time: '1h ago', group: 'Today', tone: 'danger', read: false, object: 'malware' },
  { id: 's3', title: 'Firewall rule triggered', description: 'Blocked inbound traffic on port 4444 from 203.0.113.9.', time: 'Yesterday', group: 'Earlier', tone: 'danger', read: true, object: 'firewall' },
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
