import type { Meta, StoryObj } from '@storybook/react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './resizable';
import { ScrollArea } from './scroll-area';

const meta: Meta<typeof ResizablePanelGroup> = {
  title: 'Layout/Resizable',
  component: ResizablePanelGroup,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Lay panels in a row (horizontal) or a stacked column (vertical).',
    },
    className: { control: false, description: 'Class on the root element.' },
    children: { control: false, description: 'ResizablePanel/ResizableHandle elements.' },
  },
  args: { orientation: 'horizontal' },
};

export default meta;
type Story = StoryObj<typeof ResizablePanelGroup>;

const BOX = 'h-72 w-full rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]';

/** A sidebar + main split. Drag the grip, or focus the divider and use the arrow
 * keys (Home/End to jump, double-click to reset). Panels strip a passed
 * `tabIndex`, so scrollable panel content is wrapped in a focusable `ScrollArea`
 * to keep the region keyboard-reachable. */
export const Default: Story = {
  render: (args) => (
    <ResizablePanelGroup {...args} className={BOX}>
      <ResizablePanel defaultSize={30} minSize={20}>
        <ScrollArea className="size-full">
          <div className="p-4">
            <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">Sites</p>
            <p className="mt-1 font-mono text-body-s text-[var(--color-text-text-subtler)]">shop.seashell.dev</p>
            <p className="mt-1 font-mono text-body-s text-[var(--color-text-text-subtler)]">api.seashell.dev</p>
          </div>
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle withHandle aria-label="Resize sites list" />
      <ResizablePanel>
        <ScrollArea className="size-full">
          <div className="p-4">
            <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">Overview</p>
            <p className="mt-1 font-body text-body-s text-[var(--color-text-text-subtler)]">Region eu-west-1 · v2.4.0</p>
          </div>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

/** A row of two panes (the default). The handle carries a centered grip. */
export const Horizontal: Story = {
  parameters: { controls: { exclude: ['orientation'] } },
  render: () => (
    <ResizablePanelGroup orientation="horizontal" className={BOX}>
      <ResizablePanel defaultSize={40} minSize={25}>
        <ScrollArea className="size-full">
          <div className="p-4">
            <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">Navigation</p>
            <p className="mt-1 font-body text-body-s text-[var(--color-text-text-subtler)]">Browse the file tree for shop.seashell.dev.</p>
          </div>
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle withHandle aria-label="Resize navigation" />
      <ResizablePanel>
        <ScrollArea className="size-full">
          <div className="p-4">
            <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">Editor</p>
            <p className="mt-1 font-mono text-body-s text-[var(--color-text-text-subtler)]">app/(app)/sites/page.tsx</p>
          </div>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

/** A stacked column with a collapsible log pane below the content. */
export const Vertical: Story = {
  parameters: { controls: { exclude: ['orientation'] } },
  render: () => (
    <ResizablePanelGroup orientation="vertical" className="h-80 w-full rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]">
      <ResizablePanel defaultSize={70}>
        <ScrollArea className="size-full">
          <div className="p-4">
            <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">Deployment</p>
            <p className="mt-1 font-body text-body-s text-[var(--color-text-text-subtler)]">build #482 succeeded 6 minutes ago.</p>
          </div>
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle withHandle aria-label="Resize logs" />
      <ResizablePanel defaultSize={30} minSize={15} collapsible collapsedSize={6}>
        <ScrollArea className="size-full">
          <div className="p-4">
            <p className="font-mono text-body-s text-[var(--color-text-text-subtler)]">build #482 · eu-west-1</p>
            <p className="mt-1 font-mono text-body-s text-[var(--color-text-text-subtler)]">fetching sources…</p>
          </div>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

/** A three-pane layout — navigation, content, inspector — with a hairline handle
 * between each. Each divider gets its own `aria-label` so screen readers can
 * tell them apart. */
export const ThreePane: Story = {
  parameters: { controls: { exclude: ['orientation'] } },
  render: () => (
    <ResizablePanelGroup orientation="horizontal" className={BOX}>
      <ResizablePanel defaultSize={25} minSize={15}>
        <ScrollArea className="size-full">
          <div className="p-4 font-body text-body-m text-[var(--color-text-text)]">Navigation</div>
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize navigation" />
      <ResizablePanel>
        <ScrollArea className="size-full">
          <div className="p-4 font-body text-body-m text-[var(--color-text-text)]">Content</div>
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize inspector" />
      <ResizablePanel defaultSize={25} minSize={15}>
        <ScrollArea className="size-full">
          <div className="p-4 font-body text-body-m text-[var(--color-text-text)]">Inspector</div>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

/** Disabled at the group level: the divider shows a default cursor, dims, and can't
 * be dragged or keyboard-resized — state conveyed by more than cursor alone. */
export const Disabled: Story = {
  parameters: { controls: { exclude: ['orientation'] } },
  render: () => (
    <ResizablePanelGroup orientation="horizontal" disabled className={BOX}>
      <ResizablePanel defaultSize={35}>
        <ScrollArea className="size-full">
          <div className="p-4">
            <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">Sidebar</p>
            <p className="mt-1 font-body text-body-s text-[var(--color-text-text-subtler)]">Layout is locked.</p>
          </div>
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle withHandle aria-label="Resize sidebar" />
      <ResizablePanel>
        <ScrollArea className="size-full">
          <div className="p-4">
            <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">Main</p>
            <p className="mt-1 font-body text-body-s text-[var(--color-text-text-subtler)]">Resizing is disabled for this group.</p>
          </div>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};
