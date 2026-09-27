import type { Meta, StoryObj } from '@storybook/react';
import { DescriptionList, DescriptionItem, DescriptionTerm, DescriptionDetails } from './description-list';
import { Badge } from './badge';
import { StatusDot } from './status-dot';

const meta: Meta<typeof DescriptionList> = {
  title: 'Data Display/DescriptionList',
  component: DescriptionList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Compositional — DescriptionList (<dl>) itself takes only standard HTML props. Build entries from DescriptionItem/DescriptionTerm/DescriptionDetails.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DescriptionList>;

/** The read-only attributes of a single site. Identifiers use `font-mono`. */
export const Default: Story = {
  render: () => (
    <DescriptionList className="w-[420px]">
      <DescriptionItem>
        <DescriptionTerm>Domain</DescriptionTerm>
        <DescriptionDetails className="font-mono">shop.seashell.dev</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Region</DescriptionTerm>
        <DescriptionDetails className="font-mono">eu-west-1</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Description</DescriptionTerm>
        <DescriptionDetails>Primary storefront serving production traffic across three availability zones.</DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  ),
};

/**
 * A status row carries a non-text value, so it pairs StatusDot with a text
 * label inside a Badge (status is never color alone) and overrides the row
 * to `sm:items-start` so the badge aligns to the top of the value track
 * rather than sitting on the term's text baseline.
 */
export const WithStatus: Story = {
  name: 'With status',
  render: () => (
    <DescriptionList className="w-[420px]">
      <DescriptionItem>
        <DescriptionTerm>Domain</DescriptionTerm>
        <DescriptionDetails className="font-mono">api.seashell.dev</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem className="sm:items-start">
        <DescriptionTerm>Status</DescriptionTerm>
        <DescriptionDetails>
          <Badge variant="danger">
            <StatusDot tone="danger" />
            Error
          </Badge>
        </DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Plan</DescriptionTerm>
        <DescriptionDetails>Scale</DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  ),
};

/**
 * A long unbreakable identifier (a deploy hash, a full URL) wraps inside
 * the value track instead of forcing horizontal page scroll at 360px —
 * both tracks are `min-w-0` and the value carries `break-words`.
 */
export const LongIdentifier: Story = {
  name: 'Long identifier',
  render: () => (
    <DescriptionList className="w-[420px]">
      <DescriptionItem>
        <DescriptionTerm>Deploy hash</DescriptionTerm>
        <DescriptionDetails className="font-mono">9f3c1a7e8b4d2f0c6a59e3d71b8c4f02a1d6e9b3</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Endpoint</DescriptionTerm>
        <DescriptionDetails className="font-mono">https://eu-west-1.api.seashell.dev/v2/deployments/9f3c1a7e</DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  ),
};

/**
 * DescriptionList passes `className` through, so consumers can lay the
 * items out in their own multi-column grid (here two-up on sm+) — each
 * DescriptionItem overrides back to a single-column stack for its own
 * term/value pair so the outer grid, not the item, owns the columns.
 */
export const TwoUpGrid: Story = {
  name: 'Two-up grid',
  render: () => (
    <DescriptionList className="grid w-[560px] grid-cols-1 sm:grid-cols-2 sm:gap-x-8">
      <DescriptionItem className="sm:grid-cols-1 sm:gap-1">
        <DescriptionTerm>Created</DescriptionTerm>
        <DescriptionDetails>12 Mar 2026</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem className="sm:grid-cols-1 sm:gap-1">
        <DescriptionTerm>Region</DescriptionTerm>
        <DescriptionDetails className="font-mono">eu-west-1</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem className="sm:grid-cols-1 sm:gap-1">
        <DescriptionTerm>Runtime</DescriptionTerm>
        <DescriptionDetails className="font-mono">node 20.11.1</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem className="sm:grid-cols-1 sm:gap-1">
        <DescriptionTerm>Requests / day</DescriptionTerm>
        <DescriptionDetails>902,540</DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  ),
};
