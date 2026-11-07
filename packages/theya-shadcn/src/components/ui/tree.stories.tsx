import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Archive, Building, Globe } from 'iconoir-react';
import { Tree, type TreeNode } from './tree';
import { treeGuidelines } from './tree.guidelines';

/**
 * Tree — an accessible hierarchical tree view (WAI-ARIA Tree View
 * pattern, single-select). Radix has no tree primitive, so this is a
 * hand-built ARIA tree: roving tabindex (exactly one row is a Tab
 * stop), full keyboard navigation (Up/Down move, Right expands/steps
 * in, Left collapses/steps out, Home/End jump, Enter/Space
 * select+toggle), and type-ahead. It is data-driven via a nested
 * `items` array, and an `aria-label` (or `aria-labelledby`) is
 * REQUIRED so the tree has an accessible name. Expansion and
 * selection are each controlled or uncontrolled, independently.
 */
const FILES: TreeNode[] = [
  {
    id: 'clients',
    label: 'Clients',
    children: [
      {
        id: 'rhea-theo',
        label: 'Rhea & Theo',
        children: [
          {
            id: 'selects',
            label: 'Selects',
            children: [
              { id: 'dawn-0412', label: 'DAWN_0412.jpg' },
              { id: 'dawn-0418', label: 'DAWN_0418.jpg' },
            ],
          },
          { id: 'contract', label: 'Contract.pdf' },
        ],
      },
      {
        id: 'layla',
        label: 'Layla Haddad',
        children: [{ id: 'golden-0907', label: 'GOLDEN_0907.tif' }],
      },
    ],
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    children: [
      { id: 'moonrise', label: 'L4_moonrise.raw' },
      { id: 'blue-0215', label: 'BLUE_0215.jpg' },
    ],
  },
  { id: 'releases', label: 'Model releases.pdf' },
];

const meta: Meta<typeof Tree> = {
  title: 'Data/Tree',
  component: Tree,
  // NOT tags: ['autodocs'] — TreeNode is self-referential
  // (children?: TreeNode[]), and Storybook's docgen-driven Docs-page
  // type introspection doesn't detect the cycle and hangs the tab
  // trying to fully unroll it (found live on this exact component,
  // Sep 2026). table.disable on the recursive props below is belt-
  // and-suspenders in case autodocs gets re-enabled later.
  parameters: { layout: 'padded', guidelines: treeGuidelines },
  argTypes: {
    items: { control: false, table: { disable: true }, description: 'Nested TreeNode[] data.' },
    defaultExpandedIds: { control: false, description: 'Uncontrolled initial set of expanded node ids.' },
    expandedIds: { control: false, description: 'Controlled set of expanded node ids.' },
    selectedId: { control: false, description: 'Controlled selected node id.' },
    defaultSelectedId: { control: false, description: 'Uncontrolled initial selected node id.' },
    // action: false — otherwise addon-actions auto-wraps these with a
    // mock spy, and the Controls panel's read-only value preview
    // (prettyPrint2, no cycle guard) chokes on the spy's own nested
    // internal state — the actual crash on Controlled (Sep 2026).
    onSelect: { control: false, action: false, description: '(id, node) on row select.' },
    onExpandedChange: { control: false, action: false, description: 'Fires with the new expanded-ids set.' },
    'aria-label': {
      control: 'text',
      description: 'Accessible name (required if no aria-labelledby).',
    },
  },
  args: {
    items: FILES,
    'aria-label': 'Photo library',
    defaultExpandedIds: ['clients', 'portfolio'],
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Tree>;

/** A folder of photos. Click a chevron to expand, click a row to select; or focus a row and use Up/Down, Left/Right, Home/End, Enter/Space, and type-ahead. */
export const Default: Story = {
  // WAI-ARIA tree keyboard model: one Tab stop, Up/Down, Home/End,
  // Left collapses / Right expands then steps in, type-ahead, Enter selects.,
};

/** Collapsed at first load — no `defaultExpandedIds`, so only the top level shows. Right (or a click) expands a parent in place. */
export const Collapsed: Story = {
  parameters: { controls: { exclude: ['defaultExpandedIds'] } },
  args: { defaultExpandedIds: undefined },
};

/** Uncontrolled selection: `defaultSelectedId` pre-selects a row (filled with the subtle primary token). Selection is independent of expansion. */
export const Selected: Story = {
  args: { defaultSelectedId: 'moonrise' },
};

/** A disabled node is greyed and skipped by every navigation path — Up/Down, Home/End, type-ahead, and arrow step-in/step-out — so the roving Tab stop never lands on a dead row. */
export const DisabledNode: Story = {
  parameters: { controls: { exclude: ['items', 'defaultExpandedIds'] } },
  args: {
    'aria-label': 'Studios',
    defaultExpandedIds: ['selene'],
    items: [
      {
        id: 'selene',
        label: 'Selene Weddings',
        textValue: 'Selene Weddings',
        children: [
          { id: 'golden-hour', label: 'Golden hour' },
          { id: 'blue-hour', label: 'Blue hour', disabled: true },
        ],
      },
      {
        id: 'l4',
        label: 'Studio L4',
        disabled: true,
        children: [{ id: 'first-light', label: 'First light' }],
      },
    ],
  },
  // Disabled rows are announced as disabled and skipped by the arrow keys.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const item = (name: string) => canvas.getByRole('treeitem', { name });
    await expect(item('Blue hour')).toHaveAttribute('aria-disabled', 'true');

    await userEvent.tab();
    await waitFor(() => expect(item('Selene Weddings')).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(item('Golden hour')).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}');
    await expect(item('Golden hour')).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(item('Golden hour')).toHaveFocus();
  },
};

/** Custom per-node icons via the `icon` slot override the default folder/file glyphs. Icons are decorative (`aria-hidden`); the label carries the name. */
export const CustomIcons: Story = {
  parameters: { controls: { exclude: ['items', 'defaultExpandedIds'] } },
  args: {
    'aria-label': 'Resources',
    defaultExpandedIds: ['othrys'],
    items: [
      {
        id: 'othrys',
        label: 'Othrys Lodge',
        icon: <Building />,
        children: [
          {
            id: 'portal',
            // Portal addresses are real identifiers, so they stay mono.
            label: <span className="font-mono">othrys.aether.photo</span>,
            textValue: 'othrys.aether.photo',
            icon: <Globe />,
          },
          {
            id: 'archive',
            label: 'Mnemosyne',
            icon: <Archive />,
          },
        ],
      },
    ],
  },
};

/** Controlled expansion and selection: the parent owns both as state. Here a studio starts open and an album inside it starts selected. */
// Module scope, not inline inside the render function — plain
// strings too, not JSX labels. A JSX element created fresh on every
// re-render (inside a live component's render pass) carries a dev-
// only `_owner` pointing at the CURRENT FIBER, which has real
// circular pointers (alternate/return/child) that prettyPrint2 (the
// Controls-panel value formatter) doesn't guard against, unlike
// sortObject elsewhere — this is what actually crashed Controlled
// with "Maximum call stack size exceeded" (Sep 2026). Hoisting the
// data out (same fix already used for every other story's `items`)
// sidesteps it entirely.
const CONTROLLED_STUDIOS: TreeNode[] = [
  {
    id: 'helios',
    label: 'Helios Studio',
    children: [
      { id: 'golden', label: 'Golden hour' },
      { id: 'wide-shining', label: 'Wide-shining' },
    ],
  },
  {
    id: 'selene',
    label: 'Selene Weddings',
    children: [{ id: 'blue', label: 'Blue hour' }],
  },
];

export const Controlled: Story = {
  parameters: { controls: { exclude: ['items'] } },
  render: function ControlledTree(args) {
    const [expanded, setExpanded] = useState<string[]>(['helios']);
    const [selected, setSelected] = useState<string | undefined>('golden');
    return (
      <div className="flex flex-col gap-3">
        <Tree
          {...args}
          aria-label="Studios"
          items={CONTROLLED_STUDIOS}
          expandedIds={expanded}
          onExpandedChange={setExpanded}
          selectedId={selected}
          onSelect={(id) => setSelected(id)}
        />
        <p className="font-body text-body-m text-[var(--color-text-text-subtler)]">
          Selected: <span className="font-mono text-[var(--color-text-text)]">{selected ?? 'none'}</span>
        </p>
      </div>
    );
  },
};

/** An empty `items` array renders an empty, named tree — no crash, no rows. */
export const Empty: Story = {
  parameters: { controls: { exclude: ['items', 'defaultExpandedIds'] } },
  args: { items: [], defaultExpandedIds: undefined },
};

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const item = (name: string) => canvas.getByRole('treeitem', { name });
    const focused = (name: string) => waitFor(() => expect(item(name)).toHaveFocus());
    await expect(canvas.getByRole('tree', { name: 'Photo library' })).toBeInTheDocument();

    await userEvent.tab();
    await focused('Clients');
    await userEvent.keyboard('{ArrowDown}');
    await focused('Rhea & Theo');
    await userEvent.keyboard('{End}');
    await focused('Model releases.pdf');
    await userEvent.keyboard('{Home}');
    await focused('Clients');

    await userEvent.keyboard('{ArrowLeft}');
    await expect(item('Clients')).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByRole('treeitem', { name: 'Rhea & Theo' })).toBeNull();
    await userEvent.keyboard('{ArrowRight}');
    await expect(item('Clients')).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowRight}');
    await focused('Rhea & Theo');
    await expect(item('Rhea & Theo')).toHaveAttribute('aria-level', '2');

    // Type-ahead: "m" matches only "Model releases.pdf" among the visible rows.
    await userEvent.keyboard('m');
    await focused('Model releases.pdf');
    await userEvent.keyboard('{Enter}');
    await expect(item('Model releases.pdf')).toHaveAttribute('aria-selected', 'true');
  },
};
