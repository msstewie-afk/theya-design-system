import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './resizable';
import { ScrollArea } from './scroll-area';
import { resizableGuidelines } from './resizable.guidelines';

const meta: Meta<typeof ResizablePanelGroup> = {
  title: 'Layout/Resizable',
  component: ResizablePanelGroup,
  tags: ['autodocs'],
  parameters: { guidelines: resizableGuidelines, layout: 'padded' },
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

/** Share of the group's width (or height) each panel actually takes, 0..1. */
function panelShares(root: HTMLElement, axis: 'x' | 'y' = 'x') {
  const group = root.querySelector('[data-slot="resizable-panel-group"]') as HTMLElement;
  const total = axis === 'x' ? group.getBoundingClientRect().width : group.getBoundingClientRect().height;
  return Array.from(group.querySelectorAll<HTMLElement>(':scope > [data-slot="resizable-panel"]')).map((panel) => {
    const box = panel.getBoundingClientRect();
    return (axis === 'x' ? box.width : box.height) / total;
  });
}

const near = (value: number, target: number) => Math.abs(value - target) <= 0.02;

const BOX = 'h-72 w-full rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]';

/** A sidebar + main split. Drag the grip, or focus the divider and use the arrow
 * keys (Home/End to jump, double-click to reset). Panels strip a passed
 * `tabIndex`, so scrollable panel content is wrapped in a focusable `ScrollArea`
 * to keep the region keyboard-reachable. */
export const Default: Story = {
  render: (args) => (
    <ResizablePanelGroup {...args} className={BOX}>
      <ResizablePanel defaultSize="30%" minSize="20%">
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
  play: async ({ canvasElement }) => {
    const handle = within(canvasElement).getByRole('separator', { name: 'Resize sites list' });
    // defaultSize="30%" means 30% (a bare number would be 30px).
    await waitFor(() => expect(near(panelShares(canvasElement)[0], 0.3)).toBe(true));

    handle.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(panelShares(canvasElement)[0]).toBeGreaterThan(0.31));

    // Home stops at minSize="20%".
    await userEvent.keyboard('{Home}');
    await waitFor(() => expect(near(panelShares(canvasElement)[0], 0.2)).toBe(true));
    await expect(handle).toHaveAttribute('aria-valuenow', handle.getAttribute('aria-valuemin'));
  },
};

/** A row of two panes (the default). The handle carries a centered grip. */
export const Horizontal: Story = {
  parameters: { controls: { exclude: ['orientation'] } },
  render: () => (
    <ResizablePanelGroup orientation="horizontal" className={BOX}>
      <ResizablePanel defaultSize="40%" minSize="25%">
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
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('separator', { name: 'Resize navigation' })).toBeInTheDocument();
    await waitFor(() => expect(near(panelShares(canvasElement)[0], 0.4)).toBe(true));
  },
};

/** A stacked column with a collapsible log pane below the content. */
export const Vertical: Story = {
  parameters: { controls: { exclude: ['orientation'] } },
  render: () => (
    <ResizablePanelGroup orientation="vertical" className="h-80 w-full rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]">
      <ResizablePanel defaultSize="70%">
        <ScrollArea className="size-full">
          <div className="p-4">
            <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">Deployment</p>
            <p className="mt-1 font-body text-body-s text-[var(--color-text-text-subtler)]">build #482 succeeded 6 minutes ago.</p>
          </div>
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle withHandle aria-label="Resize logs" />
      <ResizablePanel defaultSize="30%" minSize="15%" collapsible collapsedSize="6%">
        <ScrollArea className="size-full">
          <div className="p-4">
            <p className="font-mono text-body-s text-[var(--color-text-text-subtler)]">build #482 · eu-west-1</p>
            <p className="mt-1 font-mono text-body-s text-[var(--color-text-text-subtler)]">fetching sources…</p>
          </div>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
  play: async ({ canvasElement }) => {
    const handle = within(canvasElement).getByRole('separator', { name: 'Resize logs' });
    await waitFor(() => expect(near(panelShares(canvasElement, 'y')[1], 0.3)).toBe(true));
    // Pushing the divider to the end collapses the log pane to collapsedSize="6%".
    handle.focus();
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(near(panelShares(canvasElement, 'y')[1], 0.06)).toBe(true));
  },
};

/** A three-pane layout — navigation, content, inspector — with a hairline handle
 * between each. Each divider gets its own `aria-label` so screen readers can
 * tell them apart. */
export const ThreePane: Story = {
  parameters: { controls: { exclude: ['orientation'] } },
  render: () => (
    <ResizablePanelGroup orientation="horizontal" className={BOX}>
      <ResizablePanel defaultSize="25%" minSize="15%">
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
      <ResizablePanel defaultSize="25%" minSize="15%">
        <ScrollArea className="size-full">
          <div className="p-4 font-body text-body-m text-[var(--color-text-text)]">Inspector</div>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Each divider has its own name.
    await expect(canvas.getAllByRole('separator')).toHaveLength(2);
    await expect(canvas.getByRole('separator', { name: 'Resize navigation' })).toBeInTheDocument();
    await expect(canvas.getByRole('separator', { name: 'Resize inspector' })).toBeInTheDocument();
    await waitFor(() => {
      const [nav, , inspector] = panelShares(canvasElement);
      expect(near(nav, 0.25) && near(inspector, 0.25)).toBe(true);
    });
  },
};

/** Disabled at the group level: the divider shows a default cursor, dims, and can't
 * be dragged or keyboard-resized — state conveyed by more than cursor alone. */
export const Disabled: Story = {
  parameters: { controls: { exclude: ['orientation'] } },
  render: () => (
    <ResizablePanelGroup orientation="horizontal" disabled className={BOX}>
      <ResizablePanel defaultSize="35%">
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
  play: async ({ canvasElement }) => {
    const handle = within(canvasElement).getByRole('separator', { name: 'Resize sidebar' });
    await waitFor(() => expect(near(panelShares(canvasElement)[0], 0.35)).toBe(true));
    handle.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{End}');
    await expect(near(panelShares(canvasElement)[0], 0.35)).toBe(true);
  },
};
