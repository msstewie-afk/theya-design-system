import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Cloud, Database, Globe } from 'iconoir-react';
import { Tree, type TreeNode } from './tree';

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
    id: 'app',
    label: 'app',
    children: [
      { id: 'layout', label: 'layout.tsx' },
      { id: 'page', label: 'page.tsx' },
      {
        id: 'sites',
        label: 'sites',
        children: [
          { id: 'sites-page', label: 'page.tsx' },
          { id: 'sites-data', label: 'data.ts' },
        ],
      },
    ],
  },
  {
    id: 'components',
    label: 'components',
    children: [
      { id: 'tree', label: 'tree.tsx' },
      { id: 'button', label: 'button.tsx' },
    ],
  },
  { id: 'readme', label: 'readme.md' },
];

const meta: Meta<typeof Tree> = {
  title: 'Data Display/Tree',
  component: Tree,
  // NOT tags: ['autodocs'] — TreeNode is self-referential
  // (children?: TreeNode[]), and Storybook's docgen-driven Docs-page
  // type introspection doesn't detect the cycle and hangs the tab
  // trying to fully unroll it (found live on this exact component,
  // Sep 2026). table.disable on the recursive props below is belt-
  // and-suspenders in case autodocs gets re-enabled later.
  parameters: { layout: 'padded' },
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
    'aria-label': 'Project files',
    defaultExpandedIds: ['app', 'components'],
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

/** A file tree. Click a chevron to expand, click a row to select; or focus a row and use Up/Down, Left/Right, Home/End, Enter/Space, and type-ahead. */
export const Default: Story = {};

/** Collapsed at first load — no `defaultExpandedIds`, so only the top level shows. Right (or a click) expands a parent in place. */
export const Collapsed: Story = {
  parameters: { controls: { exclude: ['defaultExpandedIds'] } },
  args: { defaultExpandedIds: undefined },
};

/** Uncontrolled selection: `defaultSelectedId` pre-selects a row (filled with the subtle primary token). Selection is independent of expansion. */
export const Selected: Story = {
  args: { defaultSelectedId: 'tree' },
};

/** A disabled node is greyed and skipped by every navigation path — Up/Down, Home/End, type-ahead, and arrow step-in/step-out — so the roving Tab stop never lands on a dead row. */
export const DisabledNode: Story = {
  parameters: { controls: { exclude: ['items', 'defaultExpandedIds'] } },
  args: {
    'aria-label': 'Environments',
    defaultExpandedIds: ['prod'],
    items: [
      {
        id: 'prod',
        label: 'production',
        textValue: 'production',
        children: [
          { id: 'app-acme', label: 'app.seashell.dev' },
          { id: 'billing', label: 'billing.seashell.dev', disabled: true },
        ],
      },
      {
        id: 'staging',
        label: 'staging',
        disabled: true,
        children: [{ id: 'staging-app', label: 'app.staging.seashell.dev' }],
      },
    ],
  },
};

/** Custom per-node icons via the `icon` slot override the default folder/file glyphs. Icons are decorative (`aria-hidden`); the label carries the name. */
export const CustomIcons: Story = {
  parameters: { controls: { exclude: ['items', 'defaultExpandedIds'] } },
  args: {
    'aria-label': 'Resources',
    defaultExpandedIds: ['eu-west-1'],
    items: [
      {
        id: 'eu-west-1',
        label: <span className="font-mono">eu-west-1</span>,
        textValue: 'eu-west-1',
        icon: <Cloud />,
        children: [
          {
            id: 'web',
            label: <span className="font-mono">shop.seashell.dev</span>,
            textValue: 'shop.seashell.dev',
            icon: <Globe />,
          },
          {
            id: 'db',
            label: <span className="font-mono">primary-db</span>,
            textValue: 'primary-db',
            icon: <Database />,
          },
        ],
      },
    ],
  },
};

/** Controlled expansion and selection: the parent owns both as state. Here both a region and a node inside it start open and selected. */
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
const CONTROLLED_REGIONS: TreeNode[] = [
  {
    id: 'eu-west-1',
    label: 'eu-west-1',
    children: [
      { id: 'web', label: 'shop.seashell.dev' },
      { id: 'api', label: 'api.seashell.dev' },
    ],
  },
  {
    id: 'us-east-1',
    label: 'us-east-1',
    children: [{ id: 'blog', label: 'blog.seashell.dev' }],
  },
];

export const Controlled: Story = {
  parameters: { controls: { exclude: ['items'] } },
  render: function ControlledTree(args) {
    const [expanded, setExpanded] = useState<string[]>(['eu-west-1']);
    const [selected, setSelected] = useState<string | undefined>('web');
    return (
      <div className="flex flex-col gap-3">
        <Tree
          {...args}
          aria-label="Regions"
          items={CONTROLLED_REGIONS}
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
