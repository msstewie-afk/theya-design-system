import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Bell, Xmark } from 'iconoir-react';
import { PushSheet, PushSheetHeader, PushSheetTitle, PushSheetBody, PushSheetClose } from './push-sheet';
import { Button } from './button';
import { NotificationsInbox } from '@/components/blocks/notifications-inbox';

/**
 * PushSheet - a non-modal side panel that pushes page content aside instead of
 * covering it: no backdrop, no focus trap, no portal (unlike `Sheet`, which is
 * our Dialog primitive and is always modal/fixed/portaled). Fully controlled
 * and trigger-less - mount it as a flex sibling of your page content and
 * toggle `open` from your own button, e.g. a topbar bell icon. Good for a
 * persistent panel the user keeps working alongside, such as a notifications
 * center, rather than a one-off form or confirmation (use `Sheet` for those).
 */
const meta: Meta<typeof PushSheet> = {
  title: 'Overlays/Push sheet',
  component: PushSheet,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  // Every story below fully overrides `render`, so this only satisfies
  // `open`'s required prop type for the Meta.
  args: { open: false },
  argTypes: {
    open: { control: false, description: 'Controlled open state.' },
    onOpenChange: { control: false, description: 'Fires when the sheet opens or closes.' },
    side: { control: 'inline-radio', options: ['left', 'right'], description: 'Edge the sheet is pinned to and pushes content from. Defaults to right.' },
    width: { control: 'text', description: 'Sheet width (any CSS length). Defaults to 22.5rem.' },
  },
};

export default meta;
type Story = StoryObj<typeof PushSheet>;

function DemoShell({ children }: { children: (open: boolean, setOpen: (v: boolean) => void) => React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex h-[480px] overflow-hidden rounded-lg border border-solid border-[var(--color-border-border-subtle)]">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-solid border-[var(--color-border-border-subtle)] px-4">
          <span className="font-body text-body-l font-medium text-[var(--color-text-text)]">Dashboard</span>
          <Button
            appearance="ghost"
            iconOnly
            size="md"
            aria-label={open ? 'Close notifications' : 'Open notifications'}
            aria-pressed={open}
            onClick={() => setOpen((v) => !v)}
            leftIcon={<Bell />}
          />
        </header>
        <main className="flex-1 overflow-y-auto p-6 font-body text-body-m text-[var(--color-text-text-subtler)]">
          Page content stays in view and fully interactive - there&apos;s no backdrop and nothing here is blocked while the panel is open. Toggle the bell icon (or press Esc while the panel is open) to push it in and out from the right.
        </main>
      </div>
      {children(open, setOpen)}
    </div>
  );
}

/** A generic panel with a header, title, and close button. */
export const Default: Story = {
  render: () => (
    <DemoShell>
      {(open, setOpen) => (
        <PushSheet open={open} onOpenChange={setOpen}>
          <PushSheetHeader>
            <PushSheetTitle>Panel title</PushSheetTitle>
            <PushSheetClose asChild>
              <Button appearance="ghost" iconOnly size="sm" aria-label="Close" leftIcon={<Xmark />} />
            </PushSheetClose>
          </PushSheetHeader>
          <PushSheetBody>
            <p className="font-body text-body-m text-[var(--color-text-text-subtler)]">
              Any content goes here. The panel stays mounted while closed (no state loss) but is `inert`, so it&apos;s unreachable to focus and assistive tech until it reopens.
            </p>
          </PushSheetBody>
        </PushSheet>
      )}
    </DemoShell>
  ),
};

/**
 * `NotificationsInbox` packaged inside the push variant - a notifications
 * panel that lives beside the page instead of covering it. `bordered={false}`
 * drops its own card frame so the row list reaches the panel's edges instead
 * of a card-inside-a-card, and `onClose` adds a close icon button to
 * NotificationsInbox's own header (right of "Mark all as read") since this
 * story mounts it directly in `PushSheetBody`, not `PushSheetHeader`. Esc and
 * the bell icon that opened it both close it too.
 */
export const Notifications: Story = {
  render: () => (
    <DemoShell>
      {(open, setOpen) => (
        <PushSheet open={open} onOpenChange={setOpen} width="26rem" aria-label="Notifications">
          {/* px-0: NotificationsInbox owns its own horizontal inset in bordered={false}
              mode (on the header/filter row only), so the body must contribute none -
              otherwise the list would double up with it, or the two would fight. */}
          <PushSheetBody className="px-0 py-4">
            <NotificationsInbox bordered={false} onClose={() => setOpen(false)} />
          </PushSheetBody>
        </PushSheet>
      )}
    </DemoShell>
  ),
};

/**
 * The `<md` fallback: below the `md` breakpoint the same header/body renders
 * inside a modal Radix Dialog overlay instead of the docked push layout -
 * backdrop, scroll-lock, and focus trap all come from Radix, so it overlays
 * the page instead of squeezing it. It's a modal dialog, so this is excluded
 * from the combined autodocs page (`docs.disable`) to avoid its focus-trap /
 * aria-hide affecting the other stories - view it on this story's own
 * canvas, narrowed below 768px.
 */
export const MobileOverlay: Story = {
  parameters: {
    docs: { disable: true },
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <DemoShell>
      {(open, setOpen) => (
        <PushSheet open={open} onOpenChange={setOpen}>
          <PushSheetHeader>
            <PushSheetTitle>Panel title</PushSheetTitle>
            <PushSheetClose asChild>
              <Button appearance="ghost" iconOnly size="sm" aria-label="Close" leftIcon={<Xmark />} />
            </PushSheetClose>
          </PushSheetHeader>
          <PushSheetBody>
            <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">
              Below `md` this panel overlays the page - with a backdrop and scroll-lock - instead of squeezing the dashboard content aside.
            </p>
          </PushSheetBody>
        </PushSheet>
      )}
    </DemoShell>
  ),
};
