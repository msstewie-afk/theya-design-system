import type { Meta, StoryObj } from '@storybook/react';
import { Globe, Search, Box, Plus } from 'iconoir-react';
import { EmptyState, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription, EmptyStateActions } from './empty-state';
import { Button } from './button';
import { emptyStateGuidelines } from './empty-state.guidelines';

/**
 * EmptyState — the centered no-data / zero-state placeholder. Use it when
 * a list, table, or content region has no items yet, or when a search /
 * filter returns nothing: it explains the absence and offers a clear
 * next step (a verb-first "Create…" action). Compose the all-in-one API
 * (`icon`/`title`/`description`/`action`) or the parts directly
 * (`EmptyStateIcon` + `EmptyStateTitle` + `EmptyStateDescription` +
 * `EmptyStateActions`).
 *
 * The icon chip is decorative (`aria-hidden`) — the title carries the
 * meaning. The title renders a styled `<p>` by default, so when the
 * empty state owns its region pass `titleAs="h2"` so it joins the
 * document outline (the common case here).
 */
const meta = {
  title: 'Status & Feedback/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: { layout: 'padded', guidelines: emptyStateGuidelines },
  argTypes: {
    title: { control: 'text', description: 'Heading text — carries the accessible meaning.' },
    description: { control: 'text', description: 'Optional supporting copy below the title.' },
    titleAs: { control: false, description: 'Element the title renders as (e.g. "h2") to join the outline.' },
    icon: { control: false, description: 'Decorative icon above the title.' },
    action: { control: false, description: 'Primary action control, e.g. a Button.' },
    children: { control: false, description: 'Extra content below the action.' },
  },
  args: {
    icon: <Globe />,
    title: 'No sites yet',
    titleAs: 'h2',
    description: 'Connect a domain to start serving traffic from this account.',
    action: (
      <Button appearance="filled" tone="primary" leftIcon={<Plus />}>
        Create site
      </Button>
    ),
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The all-in-one zero state: decorative icon chip, heading, supporting copy, and a primary action. Edit the title/description in the Controls panel. */
export const Default: Story = {};

/**
 * The alternate content shown when an active filter has no results —
 * switch it on with `filtered`, and `filteredIcon`/`filteredTitle`/
 * `filteredDescription`/`filteredAction` override the base content
 * (falling back to the base prop when omitted).
 */
export const Filtered: Story = {
  args: {
    filtered: true,
    filteredIcon: <Search />,
    filteredTitle: 'No results',
    filteredDescription: 'Try adjusting your filters or search query.',
    filteredAction: (
      <Button appearance="outlined" tone="secondary">
        Clear filters
      </Button>
    ),
  },
};

/** A search/filter that returned nothing: no icon, an outline "Clear filters" action that returns the user to the full list. */
export const NoResults: Story = {
  name: 'No results',
  args: {
    icon: undefined,
    title: 'No certificates match eu-west-1',
    description: 'Try a different region or clear the filter to see all 12 certificates.',
    action: (
      <Button appearance="outlined" tone="secondary">
        Clear filters
      </Button>
    ),
  },
};

/** Without an action — purely informational. The region still reads as a heading via `titleAs="h2"`. */
export const TitleOnly: Story = {
  name: 'Title only',
  args: {
    icon: <Box />,
    title: 'No deploy logs',
    description: undefined,
    action: undefined,
  },
};

/** A primary action plus a secondary one. The actions row wraps (`flex-wrap`) so two buttons stay on-screen at 360px. */
export const TwoActions: Story = {
  name: 'Two actions',
  parameters: { controls: { exclude: ['icon', 'action'] } },
  args: {
    icon: <Box />,
    title: 'No team members yet',
    description: 'Invite a teammate, or read how roles and permissions work.',
    action: (
      <>
        <Button appearance="filled" tone="primary">
          Invite teammate
        </Button>
        <Button appearance="outlined" tone="secondary">
          View docs
        </Button>
      </>
    ),
  },
};

/** Composed from the exported parts instead of the convenience props — useful when you need a mono identifier inside the description or finer control over the body. */
export const ComposedFromParts: Story = {
  name: 'Composed from parts',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="mx-auto flex max-w-sm min-w-0 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <EmptyStateIcon>
        <Box />
      </EmptyStateIcon>
      <EmptyStateTitle as="h2">No deploy logs</EmptyStateTitle>
      <EmptyStateDescription>
        Logs for <span className="font-mono">shop.seashell.dev</span> will appear here after the first deploy.
      </EmptyStateDescription>
      <EmptyStateActions>
        <Button appearance="filled" tone="primary">
          Trigger deploy
        </Button>
        <Button appearance="outlined" tone="secondary">
          View docs
        </Button>
      </EmptyStateActions>
    </div>
  ),
};

/** A long title and a wide single action stay inside the centered column (`max-w-sm`, `break-words`, `text-balance`) — no horizontal overflow at 360px. */
export const LongContent: Story = {
  name: 'Long content',
  parameters: { controls: { exclude: ['icon', 'action'] } },
  args: {
    icon: <Search />,
    title: 'No matching results for staging.eu-west-1.shop.seashell.dev',
    description: 'Nothing matches this very specific filter. Broaden the query or clear it to see every record in the region.',
    action: (
      <Button appearance="outlined" tone="secondary">
        Clear filters
      </Button>
    ),
  },
};
